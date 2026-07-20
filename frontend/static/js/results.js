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
    const interviewReadiness = document.getElementById("interviewReadiness");

    const matchedList = document.getElementById("matchedList");
    const missingList = document.getElementById("missingList");

    const strengthsList = document.getElementById("strengthsList");
    const weaknessesList = document.getElementById("weaknessesList");

    const grammarList = document.getElementById("grammarList");
    const formattingList = document.getElementById("formattingList");
    const experienceList = document.getElementById("experienceList");
    const educationList = document.getElementById("educationList");
    const projectsList = document.getElementById("projectsList");

    const keywordChips = document.getElementById("keywordChips");

    const suggestionList = document.getElementById("suggestionList");
    const limitationList = document.getElementById("limitationList");

    if (!raw) {
        alert("No analysis data found in sessionStorage.");
        scoreRationale.textContent =
            "No scan result found. Run a scan from the upload page first.";
        return;
    }

    let data;

    try {
        data = JSON.parse(raw);
    } catch (error) {
        console.error(error);
        scoreRationale.textContent = "Unable to load the analysis result.";
        return;
    }

    // ============================
    // Scores
    // ============================

    const overallScore = Number(data.overall_score ?? 0);

    scoreValue.textContent = overallScore;
    scoreDial.style.setProperty("--pct", overallScore);

    scoreRationale.textContent =
        data.score_rationale ||
        "Resume analysis completed successfully.";

    atsScore.textContent = `${data.ats_score ?? 0}%`;

    aiSummary.textContent =
        data.summary ||
        "No summary available.";

    interviewReadiness.textContent =
        data.interview_readiness ||
        "Not available.";

    skillsMatchedCount.textContent =
        (data.matched_skills || []).length;

    skillsMissingCount.textContent =
        (data.missing_skills || []).length;

    // ============================
    // Helper
    // ============================

    function clear(element) {
        if (element) element.innerHTML = "";
    }

    function fillSimpleList(element, items) {

        if (!element) return;

        clear(element);

        if (!Array.isArray(items) || items.length === 0) {

            const li = document.createElement("li");
            li.textContent = "No information available.";
            element.appendChild(li);

            return;
        }

        items.forEach(item => {

            const li = document.createElement("li");
            li.textContent = item;
            element.appendChild(li);

        });

    }

    // ============================
    // Matched Skills
    // ============================

    clear(matchedList);

    (data.matched_skills || []).forEach(skill => {

        const title =
            typeof skill === "string"
                ? skill
                : skill.requirement || "";

        const evidence =
            typeof skill === "object"
                ? skill.evidence
                : "";

        const li = document.createElement("li");

        li.innerHTML = `
            <span class="badge badge-matched">✓ Matched</span>
            <div class="req-title">${escapeHtml(title)}</div>
            ${evidence ? `<div><span class="evidence-mark">${escapeHtml(evidence)}</span></div>` : ""}
        `;

        matchedList.appendChild(li);

    });

    // ============================
    // Missing Skills
    // ============================

    clear(missingList);

    (data.missing_skills || []).forEach(skill => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span class="badge badge-missing">✗ Missing</span>
            <div class="req-title">${escapeHtml(skill)}</div>
            <div class="gap-note">Skill not found in resume.</div>
        `;

        missingList.appendChild(li);

    });

    // ============================
    // Feedback Lists
    // ============================

    fillSimpleList(strengthsList, data.strengths);

    fillSimpleList(weaknessesList, data.weaknesses);

    fillSimpleList(grammarList, data.grammar_issues);

    fillSimpleList(formattingList, data.formatting_feedback);

    fillSimpleList(experienceList, data.experience_feedback);

    fillSimpleList(educationList, data.education_feedback);

    fillSimpleList(projectsList, data.projects_feedback);

    fillSimpleList(suggestionList, data.suggestions);

    if (Array.isArray(data.limitations))
        fillSimpleList(limitationList, data.limitations);
    else if (data.limitations)
        fillSimpleList(limitationList, [data.limitations]);
    else
        fillSimpleList(limitationList, []);

    // ============================
    // Keyword Recommendations
    // ============================

    clear(keywordChips);

    (data.keyword_recommendations || []).forEach(keyword => {

        const chip = document.createElement("span");

        chip.className = "keyword-chip";

        chip.textContent = keyword;

        keywordChips.appendChild(chip);

    });

    // ============================
    // Escape HTML
    // ============================

    function escapeHtml(text) {

        const div = document.createElement("div");

        div.textContent = text ?? "";

        return div.innerHTML;

    }

})();