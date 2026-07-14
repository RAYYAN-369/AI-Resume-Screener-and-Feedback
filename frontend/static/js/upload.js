// upload.js — resume upload, job description input, and form submit.

(function () {
  const ACCEPTED_TYPES = [".pdf", ".txt"];
  const MAX_SIZE_MB = 8;

  function setupDropzone(dropzoneId, inputId, chipId, nameId) {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const chip = document.getElementById(chipId);
    const nameEl = document.getElementById(nameId);
    if (!dropzone || !input) return null;

    let selectedFile = null;

    function showFile(file) {
      selectedFile = file;
      nameEl.textContent = file.name;
      dropzone.classList.add("has-file");
    }

    function clearFile(e) {
      if (e) e.stopPropagation();
      selectedFile = null;
      input.value = "";
      dropzone.classList.remove("has-file");
    }

    dropzone.addEventListener("click", (e) => {
      if (e.target === chip || chip.contains(e.target)) {
        clearFile(e);
        return;
      }
      input.click();
    });

    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.click();
      }
    });

    input.addEventListener("change", () => {
      if (input.files && input.files[0]) showFile(input.files[0]);
    });

    ["dragenter", "dragover"].forEach((evt) =>
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      })
    );

    ["dragleave", "drop"].forEach((evt) =>
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      })
    );

    dropzone.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) showFile(file);
    });

    return {
      getFile: () => selectedFile,
    };
  }

  const resumeZone = setupDropzone("resumeDropzone", "resumeFile", "resumeChip", "resumeFileName");
  const jdZone = setupDropzone("jdDropzone", "jdFile", "jdChip", "jdFileName");

  // JD input mode: paste text vs upload file
  const jdTabPaste = document.getElementById("jdTabPaste");
  const jdTabFile = document.getElementById("jdTabFile");
  const jdText = document.getElementById("jdText");
  const jdFileRow = document.getElementById("jdFileRow");

  function setJdMode(mode) {
    const isPaste = mode === "paste";
    jdTabPaste.classList.toggle("active", isPaste);
    jdTabFile.classList.toggle("active", !isPaste);
    jdTabPaste.setAttribute("aria-selected", String(isPaste));
    jdTabFile.setAttribute("aria-selected", String(!isPaste));
    jdText.style.display = isPaste ? "block" : "none";
    jdFileRow.classList.toggle("visible", !isPaste);
  }

  jdTabPaste.addEventListener("click", () => setJdMode("paste"));
  jdTabFile.addEventListener("click", () => setJdMode("file"));

  function fileIsValid(file) {
    if (!file) return false;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) return false;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return false;
    return true;
  }

  const form = document.getElementById("scanForm");
  const submitBtn = document.getElementById("submitBtn");
  const errorEl = document.getElementById("formError");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.textContent = "";

    const resumeFile = resumeZone.getFile();
    const jdIsFileMode = jdTabFile.classList.contains("active");
    const jdFile = jdZone.getFile();
    const jdTextValue = jdText.value.trim();

    if (!resumeFile) {
      errorEl.textContent = "Please add a resume (PDF or TXT) before analyzing.";
      return;
    }
    if (!fileIsValid(resumeFile)) {
      errorEl.textContent = "Resume must be a PDF or TXT file under " + MAX_SIZE_MB + "MB.";
      return;
    }
    if (jdIsFileMode) {
      if (!jdFile) {
        errorEl.textContent = "Please add a job description file, or switch to paste text.";
        return;
      }
      if (!fileIsValid(jdFile)) {
        errorEl.textContent = "Job description file must be PDF or TXT under " + MAX_SIZE_MB + "MB.";
        return;
      }
    } else if (jdTextValue.length < 20) {
      errorEl.textContent = "Please paste a job description (at least a couple of sentences).";
      return;
    }

    runScan(resumeFile, jdIsFileMode ? jdFile : jdTextValue, jdIsFileMode);
  });

  function runScan(resumeFile, jd, jdIsFile) {
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    // ------------------------------------------------------------------
    // TODO(backend integration): replace this mock with a real call to
    // the ResumeAssessor service, e.g.:
    //
    //   const formData = new FormData();
    //   formData.append("resume", resumeFile);
    //   if (jdIsFile) formData.append("job_description_file", jd);
    //   else formData.append("job_description_text", jd);
    //
    //   const res = await fetch("/api/scan", { method: "POST", body: formData });
    //   const assessment = await res.json(); // matches the Assessment schema
    //
    // For now we simulate the request/response so the frontend can be
    // built and reviewed independently of the backend.
    // ------------------------------------------------------------------

    setTimeout(() => {
      const mockAssessment = {
        match_score: 76,
        score_rationale:
          "Strong overlap on core technical skills and years of experience; a few specific tools named in the job description aren't evidenced in the resume.",
        matched_requirements: [
          {
            requirement: "3+ years building web applications with JavaScript",
            evidence: "Built and maintained customer-facing features using JavaScript for 4 years at Acme Corp.",
          },
          {
            requirement: "Experience with REST APIs",
            evidence: "Designed and consumed REST APIs to integrate the billing and inventory services.",
          },
          {
            requirement: "Version control with Git",
            evidence: "Used Git and pull-request workflows daily across a 6-person engineering team.",
          },
        ],
        missing_requirements: [
          "Direct experience with TypeScript",
          "Exposure to CI/CD pipelines (e.g. GitHub Actions)",
          "Experience with accessibility (WCAG) audits",
        ],
        suggestions: [
          "If you've used TypeScript even briefly, name it explicitly — the JD calls it out as a requirement.",
          "Mention any exposure to automated deployment or testing pipelines, even as a contributor rather than owner.",
          "Quantify the scale of the applications you've built (users, requests/day) to strengthen the experience claims already there.",
        ],
        limitations: [
          "The job description did not specify a seniority level, so scoring assumes a general match rather than a level-specific one.",
          "Only the text extracted from the uploaded files was assessed — formatting, design, or attachments were not reviewed.",
        ],
      };

      sessionStorage.setItem("resume-scan-result", JSON.stringify(mockAssessment));
      window.location.href = "result.html";
    }, 900);
  }

  setJdMode("paste");
})();
