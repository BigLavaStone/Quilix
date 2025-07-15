import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const MIN_YEAR = 2015;
const MAX_YEAR = new Date().getFullYear();

function getSessionString(year) {
  return `${year}-${(year + 1).toString().slice(-2)}`;
}

const UploadForm = () => {
  const [programs, setPrograms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examTypes, setExamTypes] = useState([]);

  const [form, setForm] = useState({
    program_id: "",
    branch_id: "",
    semester_id: "",
    subject_id: "",
    exam_type_id: "",
    year: MAX_YEAR,
    session: getSessionString(MAX_YEAR),
  });

  const [pdf, setPdf] = useState(null);
  const [uploadId, setUploadId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setPrograms((await getDocs(collection(db, "programs"))).docs.map(d => ({ id: d.id, ...d.data() })));
      setExamTypes((await getDocs(collection(db, "exam_types"))).docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!form.program_id) return setBranches([]);
    const fetchBranches = async () => {
      const q = query(collection(db, "branches"), where("program_id", "==", form.program_id));
      setBranches((await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchBranches();
    setForm(f => ({ ...f, branch_id: "", semester_id: "", subject_id: "" }));
  }, [form.program_id]);

  useEffect(() => {
    if (!form.branch_id) return setSemesters([]);
    const fetchSemesters = async () => {
      const q = query(collection(db, "semesters"), where("branch_id", "==", form.branch_id));
      setSemesters((await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchSemesters();
    setForm(f => ({ ...f, semester_id: "", subject_id: "" }));
  }, [form.branch_id]);

  useEffect(() => {
    if (!form.semester_id) return setSubjects([]);
    const fetchSubjects = async () => {
      const q = query(collection(db, "subjects"), where("semester_id", "==", form.semester_id));
      setSubjects((await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchSubjects();
    setForm(f => ({ ...f, subject_id: "" }));
  }, [form.semester_id]);

  useEffect(() => {
    setForm(f => ({
      ...f,
      session: getSessionString(Number(f.year)),
    }));
  }, [form.year]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleYearChange = (e) => {
    let val = Number(e.target.value);
    if (val < MIN_YEAR) val = MIN_YEAR;
    if (val > MAX_YEAR) val = MAX_YEAR;
    setForm({ ...form, year: val });
  };

  const handleFileChange = (e) => {
    setPdf(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdf) return setStatus("Please select a PDF file.");
    setStatus("Uploading...");

    try {
      const uploadRef = doc(collection(db, "pyq_uploads"));
      const upload_id = uploadRef.id;

      const storageRef = ref(storage, `pyq_uploads/${upload_id}/paper.pdf`);
      await uploadBytes(storageRef, pdf);
      const pdfUrl = await getDownloadURL(storageRef);

      await setDoc(uploadRef, {
        ...form,
        upload_id,
        pdf_url: pdfUrl,
        status: "processing",
        created_at: serverTimestamp(),
      });

      setUploadId(upload_id);
      setStatus("Upload successful! Your Upload ID: " + upload_id);
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="page">
    <h2>Upload Question Paper</h2>

    <form className="form" onSubmit={handleSubmit}>
      <label>Program:
        <select name="program_id" value={form.program_id} onChange={handleChange} required>
          <option value="">Select Program</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <label>Branch:
        <select name="branch_id" value={form.branch_id} onChange={handleChange} required>
          <option value="">Select Branch</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </label>

      <label>Semester:
        <select name="semester_id" value={form.semester_id} onChange={handleChange} required>
          <option value="">Select Semester</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.number || s.id}</option>
          ))}
        </select>
      </label>

      <label>Subject:
        <select name="subject_id" value={form.subject_id} onChange={handleChange} required>
          <option value="">Select Subject</option>
          {subjects.map(su => (
            <option key={su.id} value={su.id}>{su.name}</option>
          ))}
        </select>
      </label>

      <label>Exam Type:
        <select name="exam_type_id" value={form.exam_type_id} onChange={handleChange} required>
          <option value="">Select Exam Type</option>
          {examTypes.map(et => (
            <option key={et.id} value={et.id}>{et.name}</option>
          ))}
        </select>
      </label>

      <label>
        Year (Start of Session):
        <input
          name="year"
          type="number"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={form.year}
          onChange={handleYearChange}
          required
        />
        <span className="session-label">Session: {form.session}</span>
      </label>

      <label>PDF File:
        <input type="file" accept="application/pdf" onChange={handleFileChange} required />
      </label>

      <button type="submit">Upload</button>

      <div className="status-text">{status}</div>
      {uploadId && <div className="upload-id">Your Upload ID: {uploadId}</div>}
    </form>
    </div>
  );
};

export default UploadForm;
