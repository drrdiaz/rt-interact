const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const targetPath = path.join(root, "src/data/raw/app-output-resolved.json");
const rows = JSON.parse(fs.readFileSync(targetPath, "utf8"));

const SITE_KEY = "skin";
const BASE_TOXICITY = "Skin/soft tissue; Wound-healing";
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
    return "Potential severe skin and soft-tissue toxicity with stereotactic superficial RT";
  }
  if (row.fractionation_key === "Palliative") {
    return "Potential skin and soft-tissue toxicity with palliative superficial RT";
  }
  if (row.fractionation_key === "Conventional") {
    return "Potential skin and soft-tissue toxicity with concomitant superficial RT";
  }
  return "Potential skin and soft-tissue toxicity with superficial RT";
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
  const isBraf =
    /(vemurafenib|dabrafenib|encorafenib|brafi)/.test(agent);

  if (LOW_CONCERN_CLASSES.has(drugClass) || row.risk_category === "Low concern") {
    return "No clear additional acute skin interaction signal identified";
  }

  if (agent.includes("cisplatin") || agent.includes("carboplatin")) {
    return `${base}; radiosensitisation may amplify dermatitis and delayed healing`;
  }

  if (agent.includes("capecitabine") || agent.includes("5-fluorouracil") || agent.includes("5-fu")) {
    return `${base}; dermatitis and hand-foot syndrome may be amplified`;
  }

  if (agent.includes("etoposide") || agent.includes("irinotecan") || agent.includes("topotecan")) {
    return `${base}; dermatitis and marrow toxicity may be amplified`;
  }

  if (drugClass === "CDK4/6 inhibitor" || agent.includes("abemaciclib")) {
    return `${base}; dermatitis and impaired healing may worsen tolerance`;
  }

  if (isImmune) {
    return `${base}; immune dermatitis or recall-type inflammation may overlap with RT toxicity`;
  }

  if (isVegf) {
    return `${base}; impaired healing and soft-tissue breakdown risk require caution`;
  }

  if (isBraf) {
    return `${base}; marked radiodermatitis and recall risk are well recognised`;
  }

  if (agent.includes("cetuximab") || drugClass.includes("EGFR")) {
    return `${base}; acneiform rash and dermatitis may be amplified`;
  }

  if (
    drugClass === "Platinum / radiosensitiser" ||
    drugClass === "Cytotoxic antibiotic" ||
    drugClass === "Taxane" ||
    drugClass === "Antibody-drug conjugate"
  ) {
    return `${base}; radiosensitisation may amplify dermatitis and soft-tissue injury`;
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
    return `${base}; dermatitis and healing toxicity may be amplified`;
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
  const isBraf = /(vemurafenib|dabrafenib|encorafenib|brafi)/.test(agent);

  if (LOW_CONCERN_CLASSES.has(drugClass) || row.risk_category === "Low concern") {
    return { category: "Low concern", priority: 2 };
  }
  if (isBraf || (row.fractionation_key === "Stereotactic" && (isVegf || row.evidence_directness === "No applicable evidence" || row.evidence_directness === "Drug-level (site-generic)"))) {
    return { category: "High-risk interaction", priority: 5 };
  }
  if (row.evidence_directness === "No applicable evidence" || row.evidence_directness === "Drug-level (site-generic)") {
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
      ? `${BASE_TOXICITY}; Soft-tissue breakdown`
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
