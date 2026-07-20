const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const targetPath = path.join(root, "src/data/raw/app-output-resolved.json");
const rows = JSON.parse(fs.readFileSync(targetPath, "utf8"));

const SITE_KEY = "spine";
const BASE_TOXICITY =
  "Neurologic (cord/cauda); Marrow/haematologic; Vertebral/bony; Pain flare/soft tissue";
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
    return "Potential spinal cord, cauda, vertebral, and marrow toxicity with stereotactic spine RT";
  }
  if (row.fractionation_key === "Palliative") {
    return "Potential marrow, vertebral, and neural toxicity with palliative spine RT";
  }
  if (row.fractionation_key === "Conventional") {
    return "Potential marrow, vertebral, and neural toxicity with concomitant spine RT";
  }
  return "Potential marrow, vertebral, and neural toxicity with spine RT";
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
    /(bevacizumab|sunitinib|sorafenib|lenvatinib|axitinib|cabozantinib|regorafenib)/.test(agent);

  if (LOW_CONCERN_CLASSES.has(drugClass) || row.risk_category === "Low concern") {
    return "No clear additional acute spine interaction signal identified";
  }

  if (agent.includes("cisplatin")) {
    if (row.fractionation_key === "Stereotactic") {
      return "Amplified spinal cord and vertebral toxicity risk with stereotactic spine RT plus cisplatin";
    }
    return "Marrow suppression and potential neural toxicity overlap with spine RT";
  }

  if (agent.includes("carboplatin") || agent.includes("oxaliplatin")) {
    return `${base}; cytopenia and neuropathy risk may be amplified`;
  }

  if (agent.includes("etoposide")) {
    return `${base}; additive marrow suppression risk`;
  }

  if (drugClass === "CDK4/6 inhibitor" || agent.includes("abemaciclib")) {
    return `${base}; neutropenia may worsen marrow toxicity and infection risk`;
  }

  if (isImmune) {
    return `${base}; inflammatory pain flare or neural inflammation may overlap with RT toxicity`;
  }

  if (isVegf) {
    return `${base}; impaired healing, bleeding, and post-operative spine risk require caution`;
  }

  if (agent.includes("cetuximab") || drugClass.includes("EGFR")) {
    return `${base}; limited direct spine data, but radiosensitisation may narrow neural tolerance`;
  }

  if (
    drugClass === "Platinum / radiosensitiser" ||
    drugClass === "Cytotoxic antibiotic" ||
    drugClass === "Taxane" ||
    drugClass === "Antibody-drug conjugate"
  ) {
    return `${base}; radiosensitisation may amplify neural and marrow toxicity`;
  }

  if (
    drugClass === "Protein kinase inhibitor" ||
    drugClass === "PI3K inhibitor" ||
    drugClass === "AKT inhibitor" ||
    drugClass === "JAK inhibitor" ||
    drugClass === "MET inhibitor" ||
    drugClass === "RET inhibitor" ||
    drugClass === "FLT3 inhibitor"
  ) {
    return `${base}; neural and marrow toxicity may be amplified`;
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
    /(bevacizumab|sunitinib|sorafenib|lenvatinib|axitinib|cabozantinib|regorafenib)/.test(agent);

  if (LOW_CONCERN_CLASSES.has(drugClass) || row.risk_category === "Low concern") {
    return { category: "Low concern", priority: 2 };
  }
  if (isVegf && row.fractionation_key === "Stereotactic") {
    return { category: "High-risk interaction", priority: 5 };
  }
  if (row.evidence_directness === "No applicable evidence" || row.evidence_directness === "Drug-level (site-generic)") {
    if (row.fractionation_key === "Stereotactic") {
      return { category: "High-risk interaction", priority: 5 };
    }
    if (isImmune) {
      return { category: "Caution", priority: 3 };
    }
    return { category: "Moderate concern", priority: 4 };
  }
  return { category: row.risk_category, priority: row.risk_priority };
}

let changed = 0;
for (const row of rows) {
  if (row.site_key !== SITE_KEY) continue;

  const nextRisk = normalizeRisk(row);
  const nextEvidence = normalizeEvidence(row);
  const nextWarning = buildWarning(row);
  const nextToxicity =
    /(bevacizumab|sunitinib|sorafenib|lenvatinib|axitinib|cabozantinib|regorafenib)/.test(agentName(row)) ||
    String(row.drug_class || "") === "VEGF/multikinase inhibitor"
      ? `${BASE_TOXICITY}; Bleeding/poor healing`
      : BASE_TOXICITY;

  const before = JSON.stringify(row);
  row.toxicity_domains = nextToxicity;
  row.interaction_warning = nextWarning;
  row.evidence_directness = nextEvidence;
  row.risk_category = nextRisk.category;
  row.risk_priority = nextRisk.priority;
  row.site_recommendation = "";
  row.medonc_discussion = row.risk_category === "Low concern" ? "Consider" : "Yes";
  row.senior_ro_review = row.risk_category === "High-risk interaction" ? "Yes" : row.senior_ro_review;
  if (before !== JSON.stringify(row)) changed += 1;
}

fs.writeFileSync(targetPath, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Updated ${changed} ${SITE_KEY} rows in ${targetPath}`);
