// upload.js — resume upload, job description input, and form submit.

(function () {
  const ACCEPTED_TYPES = [".pdf", ".docx"];
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
    "Reading uploaded files...",
    "Extracting resume text...",
    "Analyzing job description...",
    "Matching skills with AI...",
    "Generating recommendations...",
    "Preparing final report..."
];

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorEl.textContent = "";

    const resumeFile = resumeZone.getFile();
    const jdIsFileMode = jdTabFile.classList.contains("active");
    const jdFile = jdZone.getFile();
    const jdTextValue = jdText.value.trim();

    if (!resumeFile) {
      errorEl.textContent = "Please upload a resume (PDF or DOCX) before analyzing.";
      return;
    }
    if (!fileIsValid(resumeFile)) {
      errorEl.textContent = "Resume must be a PDF or DOCX file under " + MAX_SIZE_MB + "MB.";
      return;
    }
    if (jdIsFileMode) {
      if (!jdFile) {
        errorEl.textContent = "Please add a job description file, or switch to paste text.";
        return;
      }
      if (!fileIsValid(jdFile)) {
        errorEl.textContent = "Job description file must be PDF or DOCX under " + MAX_SIZE_MB + "MB.";
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

  async function runScan(resumeFile, jd, jdIsFile) {

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    overlay.classList.add("visible");

    runStepChecklist();

    try {

        const formData = new FormData();

        formData.append("resume", resumeFile);

        if (jdIsFile) {

    formData.append(
        "job_description_file",
        jd
    );

} else {

    formData.append(
        "job_description",
        jd
    );

}

        const response = await fetch(
            "/upload",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {

            throw new Error("Failed to analyze resume.");

        }

        const assessment = await response.json();
         
        console.log("Backend Response:", assessment);

        sessionStorage.setItem(
            "resume-scan-result",
            JSON.stringify(assessment.analysis)
        );

        console.log("SessionStorage saved successfully");

        window.location.href = "/result.html";

        console.log("Redirecting to result page...");
        
    }

    catch (error) {

        console.error(error);

        errorEl.textContent =
            error.message || "Something went wrong.";

    }

    finally {

        submitBtn.disabled = false;

        submitBtn.classList.remove("loading");

        overlay.classList.remove("visible");

    }

}

  setJdMode("paste");
})();