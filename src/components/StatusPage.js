import React, { useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

const StatusPage = () => {
  const [uploadId, setUploadId] = useState("");
  const [status, setStatus] = useState("");
  const [meta, setMeta] = useState(null);
  const [labels, setLabels] = useState({
    program: "",
    subject: "",
    exam_type: ""
  });

  const checkStatus = async () => {
    setStatus("Checking...");
    const docRef = doc(db, "pyq_uploads", uploadId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      setMeta(null);
      setStatus("No upload found for this ID.");
      return;
    }

    const data = snap.data();
    setMeta(data);
    setStatus("Status: " + data.status.toUpperCase());

    const programSnap = await getDoc(doc(db, "programs", data.program_id));
    const subjectSnap = await getDoc(doc(db, "subjects", data.subject_id));
    const examTypeSnap = await getDoc(doc(db, "exam_types", data.exam_type_id));

    setLabels({
      program: programSnap.exists() ? programSnap.data().name : data.program_id,
      subject: subjectSnap.exists() ? subjectSnap.data().name : data.subject_id,
      exam_type: examTypeSnap.exists() ? examTypeSnap.data().name : data.exam_type_id
    });
  };
  /*
page
input-group
status-text
status-details
question-list


  */

  return (
    <div className="page">
      <h2>Check Upload Status</h2>

      <div className="input-group">
        <input
          placeholder="Enter Upload ID"
          value={uploadId}
          onChange={e => setUploadId(e.target.value)}
        />
        <button onClick={checkStatus}>Check</button>
      </div>

      <div className="status-text">{status}</div>

      {meta && (
        <div className="status-details">
          <p><strong>Program:</strong> {labels.program}</p>
          <p><strong>Subject:</strong> {labels.subject}</p>
          <p><strong>Exam Type:</strong> {labels.exam_type}</p>
          <p><strong>Session:</strong> {meta.session}</p>
          <p>
            <strong>PDF:</strong>{" "}
            <a href={meta.pdf_url} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusPage;
