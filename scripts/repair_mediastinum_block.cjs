const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const targetPath = path.join(root, "src/data/raw/app-output-resolved.json");
const rows = JSON.parse(fs.readFileSync(targetPath, "utf8"));

const SITE_KEY = "mediastinum";
const BASE_TOXICITY = "Pulmonary; Oesophageal; Cardiac; Marrow/haematologic; Endocrine";
const LOW_CONCERN_CLASSES = new Set([
  "Androgen receptor inhibitor",
  "Androgen-axis therapy",
  "Antiandrogen/progestogen",
  "Aromatase inhibitor",
  "Bone-modifying agent",
  "GnRH agonist",
  "GnRH antagonist",
  "Selective estrogen receptor degrader",
  "Selective estrogen receptor modulator",
]);

function agentName(row) {
  return String(row.agent || "").toLowerCase();
}

function fractionationBase(row) {
  if (row.fractionation_key === "Stereotactic") {
    return "Potential pulmonary, oesophageal, cardiac, marrow, and endocrine toxicity with stereotactic mediastinal RT";
  }
  if (row.fractionation_key === "Palliative") {
    return "Potential pulmonary, oesophageal, cardiac, marrow, and endocrine toxicity with palliative mediastinal RT";
  }
  if (row.fractionation_key === "Conventional") {
    return "Potential pulmonary, oesophageal, cardiac, marrow, and endocrine toxicity with concomitant mediastinal RT";
  }
  return "Potential pulmonary, oesophageal, cardiac, marrow, and endocrine toxicity with mediastinal RT";
}

function buildWarning(row) {
  const agent = agentName(row);
  const drugClass = String(row.drug_class || "");
  const base = fractionationBase(row);
  const isImmune =
    drugClass === "Immune checkpoint inhibitor" ||
    /(pembrolizumab|nivolumab|cemiplimab|durvalumab|atezolizumab|avelumab|ipilimumab)/.test(agent);
  const isVegf =
    drugClass === "VEGF/multikinase inhibitor" ||
    /(bevacizumab|sunitinib|sorafenib|lenvatinib|axitinib|cabozantinib|regorafenib|pazopanib)/.test(agent);

  if (LOW_CONCERN_CLASSES.has(drugClass) || row.risk_category === "Low concern") {
    return "No clear additional acute mediastinal interaction signal identified";
  }
  if (agent.includes("cisplatin")) {
    if (row.fractionation_key === "Stereotactic") {
      return "Amplified pulmonary, oesophageal, and cardiac toxicity risk with stereotactic mediastinal RT plus cisplatin";
    }
    return `${base}; pulmonary, oesophageal, and marrow toxicity may increase with concurrent cisplatin`;
  }
  if (drugClass === "CDK4/6 inhibitor" || agent.includes("abemaciclib")) {
    return `${base}; pneumonitis, oesophagitis, and neutropenia may worsen tolerance`;
  }
  if (isImmune) {
    return `${base}; immune pneumonitis, oesophagitis, or myocarditis may overlap with RT toxicity`;
  }
  if (isVegf) {
    return `${base}; bleeding, fistula, and impaired healing risk require caution`;
  }
  if (agent.includes("cetuximab") || drugClass.includes("EGFR")) {
    return `${base}; limited direct site data, but oesophageal and pulmonary toxicity may be amplified`;
  }
  if (
    drugClass === "Platinum / radiosensitiser" ||
    drugClass === "Cytotoxic antibiotic" ||
    drugClass === "Taxane" ||
    drugClass === "Antibody-drug conjugate"
  ) {
    return `${base}; radiosensitisation may amplify thoracic normal-tissue toxicity`;
  }
  return base;
}

function normalizeEvidence(row) {
  const citationsMissing = !String(row.citations || "").trim();
  if (
    citationsMissing &&
    ["Direct RT-combination", "Partially direct RT-combination"].includes(row.evidence_directness)
  ) {
    return "Evidence source not loaded";
  }
  if (
    row.evidence_directness === "Drug-level (site-generic)" ||
    row.evidence_directness === "No applicable evidence"
  ) {
    if (LOW_CONCERN_CLASSES.has(String(row.drug_class || "")) || row.risk_category === "Low concern") {
      return "No applicable evidence";
    }
    return "Indirect / class-level evidence";
  }
  return row.evidence_directness;
}

function normalizeRisk(row) {
  const agent = agentName(row);
  const drugClass = String(row.drug_class || "");
  const isImmune =
    drugClass === "Immune checkpoint inhibitor" ||
    /(pembrolizumab|nivolumab|cemiplimab|durvalumab|atezolizumab|avelumab|ipilimumab)/.test(agent);
  const isVegf =
    drugClass === "VEGF/multikinase inhibitor" ||
    /(bevacizumab|sunitinib|sorafenib|lenvatinib|axitinib|cabozantinib|regorafenib|pazopanib)/.test(agent);

  if (LOW_CONCERN_CLASSES.has(drugClass) || row.risk_category === "Low concern") {
    return { category: "Low concern", priority: 2 };
  }
  if (row.fractionation_key === "Stereotactic" && (isVegf || row.evidence_directness === "No applicable evidence" || row.evidence_directness === "Drug-level (site-generic)")) {
    return { category: "High-risk interaction", priority: 5 };
  }
  if (row.evidence_directness === "No applicable evidence" || row.evidence_directness === "Drug-level (site-generic)") {
    if (isImmune) return { category: "Caution", priority: 3 };
    return { category: "Moderate concern", priority: 4 };
  }
  return { category: row.risk_category, priority: row.risk_priority };
}

let changed = 0;
for (const row of rows) {
  if (row.site_key !== SITE_KEY) continue;
  const before = JSON.stringify(row);
  const nextRisk = normalizeRisk(row);
  row.toxicity_domains = BASE_TOXICITY;
  row.interaction_warning = buildWarning(row);
  row.evidence_directness = normalizeEvidence(row);
  row.risk_category = nextRisk.category;
  row.risk_priority = nextRisk.priority;
  row.site_recommendation = "";
  row.medonc_discussion = row.risk_category === "Low concern" ? "Consider" : "Yes";
  row.senior_ro_review = row.risk_category === "High-risk interaction" ? "Yes" : row.senior_ro_review;
  if (before !== JSON.stringify(row)) changed += 1;
}

fs.writeFileSync(targetPath, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Updated ${changed} ${SITE_KEY} rows in ${targetPath}`);
