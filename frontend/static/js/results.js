// results.js — reads the assessment result and renders the results page.

(function () {
  const raw = sessionStorage.getItem("resume-scan-result");

  const scoreValue = document.getElementById("scoreValue");
  const scoreDial = document.getElementById("scoreDial");
  const scoreRationale = document.getElementById("scoreRationale");
  const matchedList = document.getElementById("matchedList");
  const missingList = document.getElementById("missingList");
  const suggestionList = document.getElementById("suggestionList");
  const limitationList = document.getElementById("limitationList");

  if (!raw) {
    scoreRationale.textContent =
      "No scan result found. Run a scan from the home page first.";
    return;
  }

  const data = JSON.parse(raw);

  scoreValue.textContent = data.match_score;
  scoreDial.style.setProperty("--pct", data.match_score);
  scoreRationale.textContent = data.score_rationale;

  (data.matched_requirements || []).forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML =
      '<div class="req-title">' + escapeHtml(item.requirement) + "</div>" +
      '<div><span class="evidence-mark">' + escapeHtml(item.evidence) + "</span></div>";
    matchedList.appendChild(li);
  });

  (data.missing_requirements || []).forEach((req) => {
    const li = document.createElement("li");
    li.innerHTML =
      '<div class="req-title">' + escapeHtml(req) + "</div>" +
      '<div class="gap-note">Not evidenced in the resume</div>';
    missingList.appendChild(li);
  });

  (data.suggestions || []).forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    suggestionList.appendChild(li);
  });

  (data.limitations || []).forEach((l) => {
    const li = document.createElement("li");
    li.textContent = l;
    limitationList.appendChild(li);
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
