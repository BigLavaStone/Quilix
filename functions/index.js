const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const { getGeminiPrompt } = require("./geminiPrompt");
require("dotenv").config();

admin.initializeApp();

// exports.processPYQUpload = functions.firestore
//   .document("pyq_uploads/{uploadId}")
//   .onCreate(async (snap, context) => {
//     const data = snap.data();
//     const uploadId = context.params.uploadId;
//     const pdfPath = `pyq_uploads/${uploadId}/paper.pdf`;

//     try {
//       // Download PDF from Storage
//       const bucket = admin.storage().bucket();
//       const file = bucket.file(pdfPath);
//       const [pdfBuffer] = await file.download();

//       // Prepare Gemini API request
//       const prompt = getGeminiPrompt(data);
//       const geminiApiKey = process.env.GEMINI_API_KEY;

//       const geminiResponse = await axios.post(
//         `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
//         {
//           contents: [
//             {
//               role: "user",
//               parts: [
//                 { text: prompt },
//                 { inlineData: { mimeType: "application/pdf", data: pdfBuffer.toString("base64") } }
//               ]
//             }
//           ]
//         }
//       );

//       // Parse Gemini response
//       let questions = [];
//       try {
//         const text = geminiResponse.data.candidates[0].content.parts[0].text;
//         const match = text.match(/\[.*\]/s);
//         if (match) {
//           questions = JSON.parse(match[0]);
//         }
//       } catch (e) {
//         // Handle parse error
//       }

//       // Write questions to Firestore
//       const batch = admin.firestore().batch();
//       questions.forEach((q) => {
//         const qRef = admin.firestore().collection("questions").doc();
//         batch.set(qRef, { ...q, upload_id: uploadId });
//       });
//       await batch.commit();

//       // Update status
//       await snap.ref.update({ status: "completed" });
//     } catch (err) {
//       await snap.ref.update({ status: "failed", error: err.message });
//     }
//   });


// ... previous imports & setup remain same

exports.processPYQUpload = functions.firestore
  .document("pyq_uploads/{uploadId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const uploadId = context.params.uploadId;
    const pdfPath = `pyq_uploads/${uploadId}/paper.pdf`;
    console.log(`Processing upload: ${uploadId} from path: ${pdfPath}`);

    try {
      // 🔽 Step 1: Download PDF from storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(pdfPath);
      console.log(`Downloading PDF from: ${pdfPath}`);
      const [pdfBuffer] = await file.download();
      console.log(`PDF downloaded successfully, size: ${pdfBuffer.length} bytes`);

      // 🔽 Step 2: Fetch names from DB using IDs
      const db = admin.firestore();

      const programSnap = await db.collection("programs").doc(data.program_id).get();
      const branchSnap = await db.collection("branches").doc(data.branch_id).get();
      const subjectSnap = await db.collection("subjects").doc(data.subject_id).get();

      const programName = programSnap.exists ? programSnap.data().name : "Unknown";
      const branchName = branchSnap.exists ? branchSnap.data().name : "Unknown";
      const subjectName = subjectSnap.exists ? subjectSnap.data().name : "Unknown";
      const modules = subjectSnap.exists && subjectSnap.data().modules ? subjectSnap.data().modules : [];

      console.log(`Fetched names: Program - ${programName}, Branch - ${branchName}, Subject - ${subjectName}`);

      // 🔽 Step 3: Build enriched metadata for prompt
      const enrichedData = {
        upload_id: uploadId,
        subject_id: data.subject_id,
        year: data.year,
        session: data.session,
        program_name: programName,
        branch_name: branchName,
        subject_name: subjectName,
        modules: modules.map((m, i) => ({ id: i + 1, name: m })), // optional: convert to array of objects
      };

      // 🔽 Step 4: Get the prompt
      console.log("Generating prompt for Gemini API...");
      const prompt = getGeminiPrompt(enrichedData);
      const geminiApiKey = process.env.GEMINI_API_KEY;
      console.log("Prompt generated successfully");
      console.log("Connecting to Gemini API...");

      // 🔽 Step 5: Gemini API request
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: pdfBuffer.toString("base64"),
                  },
                },
              ],
            },
          ],
        }
      );
      console.log("Gemini API response received");

      // 🔽 Step 6: Extract & parse questions
      let questions = [];
      try {
        const text = geminiResponse.data.candidates[0].content.parts[0].text;
        const match = text.match(/\[.*\]/s);
        if (match) {
          questions = JSON.parse(match[0]);
        }
        console.log(`Extracted ${questions.length} questions from Gemini response`);
      } catch (e) {
        // Handle parse error
      }

      // 🔽 Step 7: Store questions in DB
      console.log(`Storing ${questions.length} questions in Firestore...`);
      const batch = admin.firestore().batch();
      questions.forEach((q) => {
        const qRef = admin.firestore().collection("questions").doc();
        batch.set(qRef, { ...q, upload_id: uploadId });
      });
      await batch.commit();
      console.log("Questions stored successfully in Firestore");

      // 🔽 Step 8: Update status
      await snap.ref.update({ status: "completed" });
    } catch (err) {
      await snap.ref.update({ status: "failed", error: err.message });
    }
  });
