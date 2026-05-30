import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Copy, Check, FileText, Info } from "lucide-react";
import { SafetyCheckResult } from "../types";

export default function SafetyChecklist() {
  const [answers, setAnswers] = useState<SafetyCheckResult>({
    hasAllergies: null,
    isPregnantOrFeeding: null,
    hasMedicalConditions: null,
    takingOtherMeds: null,
    hasConsultedDoctor: null,
  });

  const [copied, setCopied] = useState(false);

  const handleSelect = (key: keyof SafetyCheckResult, val: boolean) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
  };

  const getAlertSeverityGroup = () => {
    const alerts: string[] = [];
    if (answers.hasAllergies === true) {
      alerts.push("⚠️ Known drug/food allergies. Ensure the pharmacist checks ingredients for cross-reactivity.");
    }
    if (answers.isPregnantOrFeeding === true) {
      alerts.push("🤰 Pregnancy or Breastfeeding status. Very crucial! Many medicines cross into milk or the placenta.");
    }
    if (answers.hasMedicalConditions === true) {
      alerts.push("🏥 Chronic medical conditions (e.g., kidney, liver, heart). Normal doses might need careful adjustments.");
    }
    if (answers.takingOtherMeds === true) {
      alerts.push("💊 Taking other medicines or supplements. High risk of drug-drug interactions.");
    }
    if (answers.hasConsultedDoctor === false) {
      alerts.push("⚕️ You have not consulted a healthcare professional yet. Please speak to our licensed pharmacist.");
    }
    return alerts;
  };

  const activeAlerts = getAlertSeverityGroup();
  const isFormPartiallyAnswered = Object.values(answers).some(a => a !== null);
  const isFullyAnswered = Object.values(answers).every(a => a !== null);

  const getPharmacyConversationScript = () => {
    let script = "📋 MY MEDICATION INQUIRY NOTES\n";
    script += `Date: ${new Date().toLocaleDateString()}\n`;
    script += "==================================\n\n";
    script += "Dear Pharmacist / Doctor,\n";
    script += "I am asking about my medicine and would like to review these safe points:\n\n";

    if (answers.hasAllergies) {
      script += "- I have allergies. Is this medicine safe from cross-allergy reactions?\n";
    } else {
      script += "- Confirming: I have no known severe drug allergies.\n";
    }

    if (answers.isPregnantOrFeeding) {
      script += "- I am pregnant, planning to become pregnant, or breastfeeding. Are there safer options or dose changes required?\n";
    }

    if (answers.hasMedicalConditions) {
      script += "- I have chronic health conditions (e.g., kidney / liver / heart). Does this drug affect my organs?\n";
    }

    if (answers.takingOtherMeds) {
      script += "- I am actively taking other medications/dietary supplements. Please cross-check for high-risk drug-drug interactions.\n";
    }

    script += "- What are the absolute critical signs/side effects that mean I must stop this medicine immediately?\n";
    script += "- Should this medicine be taken with meals, or strictly on an empty stomach?\n\n";
    script += "----------------------------------\n";
    script += "Form simulated safely. Remember that this list represents custom prompt notes to start a face-to-face consultation.";
    return script;
  };

  const handleCopy = () => {
    const script = getPharmacyConversationScript();
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAnswers({
      hasAllergies: null,
      isPregnantOrFeeding: null,
      hasMedicalConditions: null,
      takingOtherMeds: null,
      hasConsultedDoctor: null,
    });
  };

  return (
    <div className="bg-white rounded-[24px] shadow-xs border border-natural-border p-6">
      <div className="flex items-start gap-3.5 mb-5">
        <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl shrink-0">
          <AlertTriangle className="w-5 h-5" id="checklist-warn-icon" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-natural-darkbrand" id="checklist-title">
            Medication Safety Check
          </h2>
          <p className="text-xs text-natural-muted">
            Self-verify your clinical safety risks before taking any brand or generic product.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Q1 */}
        <div id="safety-q1" className="border-b border-natural-border/60 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs/relaxed font-medium text-natural-text">
              1. Do you have any known severe allergies to drugs, foods, or dyes?
            </span>
            <div className="flex gap-1.5 shrink-0">
              <button
                id="q1-yes"
                onClick={() => handleSelect("hasAllergies", true)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.hasAllergies === true
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                Yes
              </button>
              <button
                id="q1-no"
                onClick={() => handleSelect("hasAllergies", false)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.hasAllergies === false
                    ? "bg-[#F5F5F0] border-[#5A5A40]/30 text-natural-brand"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Q2 */}
        <div id="safety-q2" className="border-b border-natural-border/60 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs/relaxed font-medium text-natural-text">
              2. Are you pregnant, planning pregnancy, or currently breastfeeding?
            </span>
            <div className="flex gap-1.5 shrink-0">
              <button
                id="q2-yes"
                onClick={() => handleSelect("isPregnantOrFeeding", true)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.isPregnantOrFeeding === true
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                Yes
              </button>
              <button
                id="q2-no"
                onClick={() => handleSelect("isPregnantOrFeeding", false)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.isPregnantOrFeeding === false
                    ? "bg-[#F5F5F0] border-[#5A5A40]/30 text-natural-brand"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Q3 */}
        <div id="safety-q3" className="border-b border-natural-border/60 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs/relaxed font-medium text-natural-text">
              3. Do you have liver, kidney, heart, asthma or diabetic conditions?
            </span>
            <div className="flex gap-1.5 shrink-0">
              <button
                id="q3-yes"
                onClick={() => handleSelect("hasMedicalConditions", true)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.hasMedicalConditions === true
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                Yes
              </button>
              <button
                id="q3-no"
                onClick={() => handleSelect("hasMedicalConditions", false)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.hasMedicalConditions === false
                    ? "bg-[#F5F5F0] border-[#5A5A40]/30 text-natural-brand"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Q4 */}
        <div id="safety-q4" className="border-b border-natural-border/60 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs/relaxed font-medium text-natural-text">
              4. Are you taking other medicines, herbs, vitamins, or OTC drugs?
            </span>
            <div className="flex gap-1.5 shrink-0">
              <button
                id="q4-yes"
                onClick={() => handleSelect("takingOtherMeds", true)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.takingOtherMeds === true
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                Yes
              </button>
              <button
                id="q4-no"
                onClick={() => handleSelect("takingOtherMeds", false)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.takingOtherMeds === false
                    ? "bg-[#F5F5F0] border-[#5A5A40]/30 text-natural-brand"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Q5 */}
        <div id="safety-q5" className="border-b border-natural-border/60 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs/relaxed font-medium text-natural-text">
              5. Have you spoken to a doctor or pharmacist about this drug yet?
            </span>
            <div className="flex gap-1.5 shrink-0">
              <button
                id="q5-yes"
                onClick={() => handleSelect("hasConsultedDoctor", true)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.hasConsultedDoctor === true
                    ? "bg-[#F5F5F0] border-[#5A5A40]/30 text-natural-brand"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                Yes
              </button>
              <button
                id="q5-no"
                onClick={() => handleSelect("hasConsultedDoctor", false)}
                className={`px-3 py-1 text-xs rounded-md border font-semibold cursor-pointer ${
                  answers.hasConsultedDoctor === false
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "border-natural-border text-natural-muted hover:bg-natural-alt"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFormPartiallyAnswered && (
        <div id="safety-results-container" className="mt-5 space-y-4 animate-fade-in">
          {activeAlerts.length > 0 ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h3 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                CRITICAL WARNING POINTS DETECTED:
              </h3>
              <ul className="space-y-1.5">
                {activeAlerts.map((alert, i) => (
                  <li key={i} className="text-[11px] text-amber-700 leading-relaxed pl-3 border-l-2 border-amber-400">
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Perfect! No high-risk general categories detected.
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Even without explicit risks, always double-check with the pharmacy professional before your target intake, as secondary interactions might exist.
              </p>
            </div>
          )}

          <div className="bg-natural-alt border border-natural-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-natural-darkbrand flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-natural-brand" />
                Patient consultation notes script:
              </span>
              <button
                id="copy-script-btn"
                onClick={handleCopy}
                className="text-xs text-natural-brand hover:text-natural-darkbrand font-semibold flex items-center gap-1 px-2.5 py-1 bg-white border border-natural-border hover:border-[#5A5A40]/55 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Notes
                  </>
                )}
              </button>
            </div>
            <pre className="text-[10px] font-mono text-natural-text/80 bg-white border border-natural-border rounded-lg p-3 overflow-x-auto max-h-48 leading-relaxed">
              {getPharmacyConversationScript()}
            </pre>
          </div>

          <div className="flex justify-end pt-1">
            <button
              id="reset-safety-btn"
              onClick={handleReset}
              className="text-xs text-natural-muted hover:text-natural-text transition-colors uppercase font-mono tracking-wider cursor-pointer font-bold"
            >
              Reset Answers
            </button>
          </div>
        </div>
      )}

      {!isFormPartiallyAnswered && (
        <div className="mt-4 p-3 bg-natural-alt rounded-xl border border-natural-border flex gap-2 items-center">
          <Info className="w-4 h-4 text-natural-muted shrink-0" />
          <p className="text-[11px] text-natural-muted font-semibold">
            Answering this creates a personalized consultation template to prevent accidental interactions.
          </p>
        </div>
      )}
    </div>
  );
}
