
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCqv9j2IV_EGUDopUiYN8p_db68BiJfNp8";    
const MODEL_NAME     = "gemini-1.5-flash";     

const form    = document.getElementById("cvForm");
const preview = document.getElementById("preview");
const result  = document.getElementById("result");

function buildResume(d) {
  return `
${d.name}
${d.email}

SUMMARY
${d.summary}

EXPERIENCE
${d.experience}

EDUCATION
${d.education}

SKILLS
${d.skills}
  `.trim();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  result.textContent = "Scoring…";

  const data   = Object.fromEntries(new FormData(form).entries());
  const resume = buildResume(data);
  preview.textContent = resume;

  try {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
You are an Applicant-Tracking-System assistant.
Rate the résumé on overall fit for a mid-level software-engineer role.
Return ONLY valid raw JSON (no markdown, no explanation):
{ "score": int 0-100, "strengths": [...], "weaknesses": [...] }

Résumé:
"""${resume}"""
`;

  const reply = await model.generateContent(prompt);
  const raw = reply.response.text().trim();

  const jsonStr = raw.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, "$1").trim();

  const { score, strengths, weaknesses } = JSON.parse(jsonStr);

  result.innerHTML = `
    <strong>Score: ${score}/100</strong><br/>
    <b>Strengths</b>: ${strengths.join(", ") || "-"}<br/>
    <b>Weaknesses</b>: ${weaknesses.join(", ") || "-"}
  `;
} catch (err) {
  console.error(err);
  result.textContent = "Gemini call failed or returned bad JSON. See DevTools.";
}

});
