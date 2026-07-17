// results.js — reads the assessment result and renders the results page.

(function () {
  const raw = sessionStorage.getItem("resume-scan-result");

  const scoreValue = document.getElementById("scoreValue");
  const scoreDial = document.getElementById("scoreDial");
  const scoreRationale = document.getElementById("scoreRationale");
  const atsScore = document.getElementById("atsScore");
  const skillsMatchedCount = document.getElementById("skillsMatchedCount");
  const skillsMissingCount = document.getElementById("skillsMissingCount");
  const aiSummary = document.getElementById("aiSummary");
  const matchedList = document.getElementById("matchedList");
  const missingList = document.getElementById("missingList");
  const strengthsList = document.getElementById("strengthsList");
  const weaknessesList = document.getElementById("weaknessesList");
  const grammarList = document.getElementById("grammarList");
  const keywordChips = document.getElementById("keywordChips");
  const suggestionList = document.getElementById("suggestionList");
  const limitationList = document.getElementById("limitationList");

  if (!raw) {
    scoreRationale.textContent = "No scan result found. Run a scan from the upload page first.";
    return;
  }

  const data = JSON.parse(raw);

  scoreValue.textContent = data.match_score;
  scoreDial.style.setProperty("--pct", data.match_score);
  scoreRationale.textContent = data.score_rationale;
  aiSummary.textContent = data.ai_summary || "";

  atsScore.textContent = (data.ats_score != null ? data.ats_score : "–") + "%";
  skillsMatchedCount.textContent = (data.matched_requirements || []).length;
  skillsMissingCount.textContent = (data.missing_requirements || []).length;

  function fillSimpleList(el, items) {
    (items || []).forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      el.appendChild(li);
    });
  }

  (data.matched_requirements || []).forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML =
      '<span class="badge badge-matched">✓ Matched</span>' +
      '<div class="req-title">' + escapeHtml(item.requirement) + "</div>" +
      '<div><span class="evidence-mark">' + escapeHtml(item.evidence) + "</span></div>";
    matchedList.appendChild(li);
  });

  (data.missing_requirements || []).forEach((req) => {
    const li = document.createElement("li");
    li.innerHTML =
      '<span class="badge badge-missing">! Missing</span>' +
      '<div class="req-title">' + escapeHtml(req) + "</div>" +
      '<div class="gap-note">Not evidenced in the resume</div>';
    missingList.appendChild(li);
  });

  fillSimpleList(strengthsList, data.strengths);
  fillSimpleList(weaknessesList, data.weaknesses);
  fillSimpleList(grammarList, data.grammar_issues);
  fillSimpleList(suggestionList, data.suggestions);
  fillSimpleList(limitationList, data.limitations);

  (data.keyword_suggestions || []).forEach((kw) => {
    const span = document.createElement("span");
    span.className = "keyword-chip";
    span.textContent = kw;
    keywordChips.appendChild(span);
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
