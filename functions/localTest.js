const admin = require("firebase-admin");
const axios = require("axios");
const fs = require("fs");
const { getGeminiPrompt } = require("./geminiPrompt");
require("dotenv").config();
const serviceAccount = require("./serviceAccountKey.json");

// 🔧 Initialize Firebase Admin SDK (Make sure your service account or environment is set up)
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "quilix-7894b",
    storageBucket: "quilix-7894b.firebasestorage.app",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// 🧪 Replace with your upload ID
const TEST_UPLOAD_ID = "PKpCQ8EmuqhkgwSxr2sT"; // <--- Change this to your test value

async function testFunction(uploadId) {
  const docRef = db.collection("pyq_uploads").doc(uploadId);
  const snap = await docRef.get();

  if (!snap.exists) {
    console.error("❌ No such upload ID found!");
    return;
  }

  const data = snap.data();
  const pdfPath = `pyq_uploads/${uploadId}/paper.pdf`;

  console.log(`📄 Downloading PDF from storage: ${pdfPath}`);
  const file = bucket.file(pdfPath);
  const [pdfBuffer] = await file.download();

  console.log("✅ PDF downloaded");

  // 🔍 Fetch names using IDs
  const programSnap = await db.collection("programs").doc(data.program_id).get();
  const branchSnap = await db.collection("branches").doc(data.branch_id).get();
  const subjectSnap = await db.collection("subjects").doc(data.subject_id).get();

  const programName = programSnap.exists ? programSnap.data().name : "Unknown";
  const branchName = branchSnap.exists ? branchSnap.data().name : "Unknown";
  const subjectName = subjectSnap.exists ? subjectSnap.data().name : "Unknown";
  const modules = subjectSnap.exists && subjectSnap.data().modules ? subjectSnap.data().modules : [];

  const enrichedData = {
    upload_id: uploadId,
    subject_id: data.subject_id,
    year: data.year,
    session: data.session,
    program_name: programName,
    branch_name: branchName,
    subject_name: subjectName,
    modules: modules.map((m, i) => ({ id: i + 1, name: m })),
  };

  const prompt = getGeminiPrompt(enrichedData);
  const geminiApiKey = process.env.GEMINI_API_KEY;

  console.log("🧠 Sending request to Gemini API...");
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

  console.log("✅ Gemini response received");

  // 🧠 Parse Gemini Response
  let questions = [];
  try {
    const text = geminiResponse.data.candidates[0].content.parts[0].text;
    const match = text.match(/\[.*\]/s);
    if (match) {
      questions = JSON.parse(match[0]);
    }
    console.log(`✅ Extracted ${questions.length} questions`);
    console.log(questions);
  } catch (err) {
    console.error("❌ Failed to parse Gemini response:", err.message);
  }
}

testFunction(TEST_UPLOAD_ID).catch(console.error);
