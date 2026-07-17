// upload.js — resume upload, job description input, and form submit.

(function () {
  const ACCEPTED_TYPES = [".pdf", ".txt"];
  const MAX_SIZE_MB = 8;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function setupDropzone(dropzoneId, inputId, chipId, nameId, opts) {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const chip = document.getElementById(chipId);
    const nameEl = document.getElementById(nameId);
    if (!dropzone || !input) return null;

    const progressWrap = opts && opts.progressWrapId ? document.getElementById(opts.progressWrapId) : null;
    const progressFill = opts && opts.progressFillId ? document.getElementById(opts.progressFillId) : null;
    const progressPct = opts && opts.progressPctId ? document.getElementById(opts.progressPctId) : null;
    const preview = opts && opts.previewId ? document.getElementById(opts.previewId) : null;
    const previewName = opts && opts.previewNameId ? document.getElementById(opts.previewNameId) : null;
    const previewMeta = opts && opts.previewMetaId ? document.getElementById(opts.previewMetaId) : null;

    let selectedFile = null;

    function simulateUpload(file) {
      if (!progressWrap || !progressFill || !progressPct) return;
      progressWrap.classList.add("visible");
      progressFill.style.width = "0%";
      let pct = 0;
      const timer = setInterval(() => {
        pct += Math.random() * 25 + 10;
        if (pct >= 100) {
          pct = 100;
          clearInterval(timer);
          setTimeout(() => progressWrap.classList.remove("visible"), 500);
        }
        progressFill.style.width = pct + "%";
        progressPct.textContent = "Uploading… " + Math.round(pct) + "%";
      }, 180);
    }

    function showFile(file) {
      selectedFile = file;
      nameEl.textContent = file.name;
      dropzone.classList.add("has-file");
      dropzone.classList.remove("pulse");

      if (preview && previewName && previewMeta) {
        previewName.textContent = file.name;
        const ext = file.name.split(".").pop().toUpperCase();
        previewMeta.textContent = ext + " · " + formatSize(file.size);
        preview.classList.add("visible");
      }

      simulateUpload(file);
    }

    function clearFile(e) {
      if (e) e.stopPropagation();
      selectedFile = null;
      input.value = "";
      dropzone.classList.remove("has-file");
      dropzone.classList.add("pulse");
      if (preview) preview.classList.remove("visible");
      if (progressWrap) progressWrap.classList.remove("visible");
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

    return { getFile: () => selectedFile };
  }

  const resumeZone = setupDropzone("resumeDropzone", "resumeFile", "resumeChip", "resumeFileName", {
    progressWrapId: "resumeProgressWrap",
    progressFillId: "resumeProgressFill",
    progressPctId: "resumeProgressPct",
    previewId: "resumePreview",
    previewNameId: "resumePreviewName",
    previewMetaId: "resumePreviewMeta",
  });
  const jdZone = setupDropzone("jdDropzone", "jdFile", "jdChip", "jdFileName");

  // JD input mode: paste text vs upload file
  const jdTabPaste = document.getElementById("jdTabPaste");
  const jdTabFile = document.getElementById("jdTabFile");
  const jdText = document.getElementById("jdText");
  const jdFileRow = document.getElementById("jdFileRow");
  const jdInputWrap = jdText.closest(".jd-input-wrap");
  const charCount = document.getElementById("charCount");

  function setJdMode(mode) {
    const isPaste = mode === "paste";
    jdTabPaste.classList.toggle("active", isPaste);
    jdTabFile.classList.toggle("active", !isPaste);
    jdTabPaste.setAttribute("aria-selected", String(isPaste));
    jdTabFile.setAttribute("aria-selected", String(!isPaste));
    jdInputWrap.style.display = isPaste ? "block" : "none";
    jdFileRow.classList.toggle("visible", !isPaste);
  }

  jdTabPaste.addEventListener("click", () => setJdMode("paste"));
  jdTabFile.addEventListener("click", () => setJdMode("file"));

  // Live character count
  function updateCharCount() {
    const max = jdText.getAttribute("maxlength") || 6000;
    charCount.textContent = jdText.value.length + " / " + max;
  }
  jdText.addEventListener("input", updateCharCount);
  updateCharCount();

  function fileIsValid(file) {
    if (!file) return false;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) return false;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return false;
    return true;
  }

  // Button ripple effect
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  const form = document.getElementById("scanForm");
  const submitBtn = document.getElementById("submitBtn");
  const errorEl = document.getElementById("formError");
  const overlay = document.getElementById("loadingOverlay");
  const loadingMessageEl = document.getElementById("loadingMessage");
  const stepEls = Array.from(document.querySelectorAll("#loadingSteps li"));

  const LOADING_STEPS = [
    "Reading resume…",
    "Extracting skills…",
    "Matching requirements…",
    "Calculating ATS score…",
    "Generating AI feedback…",
  ];

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

  function runStepChecklist() {
    let i = 0;
    stepEls.forEach((el) => el.classList.remove("active", "done"));

    function advance() {
      if (i > 0) stepEls[i - 1].classList.remove("active");
      if (i > 0) stepEls[i - 1].classList.add("done");
      if (i < stepEls.length) {
        stepEls[i].classList.add("active");
        loadingMessageEl.textContent = LOADING_STEPS[i];
        i++;
        setTimeout(advance, 620);
      } else {
        loadingMessageEl.textContent = "Done";
      }
    }
    advance();
  }

  function runScan(resumeFile, jd, jdIsFile) {
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    overlay.classList.add("visible");
    runStepChecklist();

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
        ats_score: 82,
        score_rationale:
          "Strong overlap on core technical skills and years of experience; a few specific tools named in the job description aren't evidenced in the resume.",
        ai_summary:
          "This resume shows solid, evidenced experience in JavaScript, REST APIs, and Git that lines up well with the role. The main gaps are newer tools the job description calls out by name — TypeScript and CI/CD — which aren't mentioned anywhere in the resume text. Tightening a few vague bullet points and naming tools explicitly would likely raise both the match score and the ATS score.",
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
        strengths: [
          "Clear, quantifiable ownership of features in past roles.",
          "Consistent use of version control and team workflows.",
        ],
        weaknesses: [
          "No mention of testing or QA practices.",
          "Bullet points are mostly duties, not outcomes.",
        ],
        grammar_issues: [
          "Inconsistent verb tense between the two most recent roles (past vs. present).",
          "\"Responsible for\" appears 4 times — vary the phrasing.",
        ],
        keyword_suggestions: ["TypeScript", "CI/CD", "GitHub Actions", "WCAG", "Unit testing"],
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
    }, 3200);
  }

  setJdMode("paste");
})();
