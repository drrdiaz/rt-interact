const fs = require("fs");
const path = require("path");

const targetPath = path.join(__dirname, "..", "src/data/raw/app-output-resolved.json");
const rows = JSON.parse(fs.readFileSync(targetPath, "utf8"));

const BASE_TOXICITY = "Global marrow/haematologic; Pulmonary; Hepatic; Renal; Ocular; Gonadal/fertility";

function lower(value) {
  return String(value || "").toLowerCase();
}

function hasAgent(row, needle) {
  const n = needle.toLowerCase();
  return lower(row.agent).includes(n) || (row.searchable_agents || []).includes(n);
}

for (const row of rows) {
  if (row.site_key !== "tbi") continue;

  row.toxicity_domains = BASE_TOXICITY;
  row.site_recommendation = "";

  if (hasAgent(row, "abemaciclib")) {
    row.interaction_warning =
      row.fractionation_key === "Stereotactic"
        ? "Potential severe multi-organ toxicity with stereotactic-equivalent whole-body irradiation context; profound marrow toxicity, diarrhoea, and pneumonitis may worsen tolerance"
        : `Potential multi-organ toxicity with ${row.fractionation_key === "Palliative" ? "palliative whole-body irradiation context" : "concomitant total-body irradiation"}; profound marrow toxicity, diarrhoea, and pneumonitis may worsen tolerance`;
    row.risk_category = row.fractionation_key === "Stereotactic" ? "High-risk interaction" : "Moderate concern";
    row.risk_priority = row.fractionation_key === "Stereotactic" ? 5 : 4;
    continue;
  }

  if (hasAgent(row, "pembrolizumab")) {
    row.interaction_warning =
      row.fractionation_key === "Stereotactic"
        ? "Potential severe multi-organ toxicity with stereotactic-equivalent whole-body irradiation context; immune pneumonitis, hepatitis, nephritis, or enteritis may overlap with TBI toxicity"
        : `Potential multi-organ toxicity with ${row.fractionation_key === "Palliative" ? "palliative whole-body irradiation context" : "concomitant total-body irradiation"}; immune pneumonitis, hepatitis, nephritis, or enteritis may overlap with TBI toxicity`;
    row.evidence_directness = "Indirect / class-level evidence";
    row.risk_category = row.fractionation_key === "Stereotactic" ? "High-risk interaction" : "Caution";
    row.risk_priority = row.fractionation_key === "Stereotactic" ? 5 : 3;
    continue;
  }

  if (hasAgent(row, "bevacizumab")) {
    row.interaction_warning =
      row.fractionation_key === "Stereotactic"
        ? "Potential severe multi-organ toxicity with stereotactic-equivalent whole-body irradiation context; bleeding and healing toxicity require caution"
        : `Potential multi-organ toxicity with ${row.fractionation_key === "Palliative" ? "palliative whole-body irradiation context" : "concomitant total-body irradiation"}; bleeding and healing toxicity require caution`;
    row.evidence_directness = "Indirect / class-level evidence";
    row.risk_category = row.fractionation_key === "Stereotactic" ? "High-risk interaction" : "Moderate concern";
    row.risk_priority = row.fractionation_key === "Stereotactic" ? 5 : 4;
    continue;
  }

  if (hasAgent(row, "cetuximab")) {
    row.interaction_warning =
      row.fractionation_key === "Stereotactic"
        ? "Potential severe multi-organ toxicity with stereotactic-equivalent whole-body irradiation context; limited direct site data, but pulmonary and mucosal toxicity may be amplified"
        : `Potential multi-organ toxicity with ${row.fractionation_key === "Palliative" ? "palliative whole-body irradiation context" : "concomitant total-body irradiation"}; limited direct site data, but pulmonary and mucosal toxicity may be amplified`;
    row.toxicity_domains = BASE_TOXICITY;
    row.evidence_directness = "Indirect / class-level evidence";
    row.risk_category = row.fractionation_key === "Stereotactic" ? "High-risk interaction" : "Moderate concern";
    row.risk_priority = row.fractionation_key === "Stereotactic" ? 5 : 4;
    continue;
  }

  if (hasAgent(row, "cisplatin")) {
    row.interaction_warning =
      row.fractionation_key === "Stereotactic"
        ? "Potential severe multi-organ toxicity with stereotactic-equivalent whole-body irradiation context; marrow, renal, pulmonary, and mucosal toxicity may increase with concurrent cisplatin"
        : `Potential multi-organ toxicity with ${row.fractionation_key === "Palliative" ? "palliative whole-body irradiation context" : "concomitant total-body irradiation"}; marrow, renal, pulmonary, and mucosal toxicity may increase with concurrent cisplatin`;
    row.toxicity_domains = BASE_TOXICITY;
    row.evidence_directness = "Indirect / class-level evidence";
    row.risk_category = row.fractionation_key === "Stereotactic" ? "High-risk interaction" : "Moderate concern";
    row.risk_priority = row.fractionation_key === "Stereotactic" ? 5 : 4;
  }
}

fs.writeFileSync(targetPath, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Forced TBI repair written to ${targetPath}`);
