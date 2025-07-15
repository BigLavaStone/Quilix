import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import StatusPage from "./components/StatusPage";
import QuestionsPage from "./components/QuestionsPage";
import './AppStyles.css';

function App() {
  const [page, setPage] = useState("upload");

  return (
    <div className="container">
      <h1>Quilix PYQ Analyzer</h1>
      <nav>
        <button onClick={() => setPage("upload")}>Upload</button>
        <button onClick={() => setPage("status")}>Status</button>
        <button onClick={() => setPage("questions")}>Questions</button>
      </nav>
      <hr />
      {page === "upload" && <UploadForm />}
      {page === "status" && <StatusPage />}
      {page === "questions" && <QuestionsPage />}
    </div>
  );
}

export default App;
