function getGeminiPrompt(metadata) {
  return `
You are an expert at analyzing scanned university question papers.
Given the following PDF and metadata:
- Program: ${metadata.program}
- Branch: ${metadata.branch}
- Semester: ${metadata.semester}
- Subject: ${metadata.subject}
- Modules: ${metadata.modules.map(m => m.name).join(", ")}
- upload_id: ${metadata.upload_id}
- subject_id: ${metadata.subject_id}

Your task:
1. Perform OCR on the PDF if needed and extract all questions.
2. For each question, extract:
   - question_no (e.g., "1", "2", etc. if 1 (a) then it is "1" and sub_bit is "a")
   - sub_bit (e.g., "a", "b", "c" for sub-parts)
   - is_optional (true if this is an alternate/optional question)
   - choice_count (how many to answer, e.g., "Answer any 1 out of 2" should be 1 and that to be in multi bit questions like "a", "b", "c" etc.)
   - question (full text)
   - marks (integer or float if needed)
   - module (match to one of the provided modules)
   - for now keep module id an empty string
   - use the provided upload_id
3. Return a JSON array in this format:
  [
    {
      "upload_id": "pyq_abc123",
      "question_no": "1",         
      "sub_bit": "a",             
      "is_optional": true,        
      "choice_count": 1,          
      "question": "Explain JVM architecture.",
      "marks": 5,
      "module_id": ""
    }, ...
  ]
If you are unsure about any field, make your best guess. Only include questions, not instructions or headers.
In case you are unsure about the module, know that Questions comes in a serial order of modules in same mark Questions
that is there are 5 Question of 1 mark in a serial then 1st belong to module 1 and so on.
but counter check it with the module names provided in the metadata.

`;
}

module.exports = { getGeminiPrompt };