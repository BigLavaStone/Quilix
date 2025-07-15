import React, { useState } from "react";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import OptionalQuestionRow from "./OptionalQuestionRow";
import FilterBar from "./FilterBar";

const QuestionsPage = () => {
  const [uploadId, setUploadId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({ module: "", marks: "" });

  const fetchQuestions = async () => {
    let q = query(collection(db, "questions"), where("upload_id", "==", uploadId));
    const snap = await getDocs(q);
    let data = snap.docs.map(d => d.data());

    // Apply client-side filters
    if (filters.module) data = data.filter(q => q.module === filters.module);
    if (filters.marks) data = data.filter(q => String(q.marks) === String(filters.marks));

    setQuestions(data);
  };

  const groupByQuestionNo = (questions) => {
    const groups = {};
    questions.forEach(q => {
      if (!groups[q.question_no]) groups[q.question_no] = [];
      groups[q.question_no].push(q);
    });
    return Object.values(groups);
  };

  return (
    <div className="page">
      <h2>Extracted Questions</h2>
      <div className="input-group">
        <input
          placeholder="Enter Upload ID"
          value={uploadId}
          onChange={e => setUploadId(e.target.value)}
        />
        <button onClick={fetchQuestions}>Fetch</button>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} />

      <div className="question-list">
        {groupByQuestionNo(questions).map((group, idx) =>
          group.length > 1 ? (
            <OptionalQuestionRow key={idx} questions={group} />
          ) : (
            <div key={idx} className="question-card">
              <b>{group[0].question_no}</b> {group[0].sub_bit && `(${group[0].sub_bit})`} - {group[0].question} [{group[0].marks} marks]
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default QuestionsPage;
