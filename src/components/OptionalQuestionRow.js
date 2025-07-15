import React from "react";

const OptionalQuestionRow = ({ questions }) => (
  <div className="optional-row">
    {questions.map((q, idx) => (
      <div key={idx} className="question-card">
        <b>{q.question_no}</b> {q.sub_bit && `(${q.sub_bit})`}<br />
        {q.question}<br />
        <span>[{q.marks} marks]</span>
      </div>
    ))}
  </div>
);

export default OptionalQuestionRow;
