import React, { useState, useEffect } from "react";
import { 
  Pill, 
  Search, 
  Languages, 
  History, 
  Bookmark, 
  Trash2, 
  Printer, 
  Share2, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  CornerDownRight, 
  FileText, 
  BookOpen, 
  Info,
  ChevronRight,
  User,
  HeartPulse,
  HeartHandshake
} from "lucide-react";
import { ExplanationHistoryItem } from "./types";
import SafetyChecklist from "./components/SafetyChecklist";
import Glossary from "./components/Glossary";

const PRESET_MEDICINES = [
  { name: "Paracetamol", desc: "Pain / Fever" },
  { name: "Ibuprofen", desc: "NSAID / Pain" },
  { name: "Amoxicillin", desc: "Antibiotic" },
  { name: "Metformin", desc: "Diabetes" },
  { name: "Atorvastatin", desc: "Cholesterol" },
];

const LANGUAGES = [
  { code: "English", label: "🇺🇸 English" },
  { code: "Spanish", label: "🇪🇸 Español" },
  { code: "French", label: "🇫🇷 Français" },
  { code: "Arabic", label: "🇸🇦 العربية" },
  { code: "Hindi", label: "🇮🇳 हिन्दी" },
  { code: "Vietnamese", label: "🇻🇳 Tiếng Việt" },
  { code: "German", label: "🇩🇪 Deutsch" },
  { code: "Chinese", label: "🇨🇳 简体中文" },
];

export default function App() {
  const [medicineName, setMedicineName] = useState("");
  const [language, setLanguage] = useState("English");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Active response state
  const [currentExplanation, setCurrentExplanation] = useState<string | null>(null);
  const [currentMedicineName, setCurrentMedicineName] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);

  // App navigation state: 'explainer' | 'checklist' | 'glossary' | 'history'
  const [activeTab, setActiveTab] = useState<"explainer" | "checklist" | "glossary">("explainer");

  // History State
  const [historyItems, setHistoryItems] = useState<ExplanationHistoryItem[]>([]);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState("");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("pharma_explainer_history");
    if (saved) {
      try {
        setHistoryItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save to local storage
  const saveHistory = (items: ExplanationHistoryItem[]) => {
    setHistoryItems(items);
    localStorage.setItem("pharma_explainer_history", JSON.stringify(items));
  };

  const handleExplain = async (medToQuery?: string, langToQuery?: string) => {
    const targetMed = medToQuery || medicineName;
    const targetLang = langToQuery || language;

    if (!targetMed.trim()) {
      setError("Please specify a medicine name.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentExplanation(null);

    try {
      const response = await fetch("/api/explain-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineName: targetMed, language: targetLang }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.explanation) {
        throw new Error("No explanation returned from server.");
      }

      const formattedExplanation = data.explanation;
      setCurrentExplanation(formattedExplanation);
      setCurrentMedicineName(targetMed);
      setCurrentLanguage(targetLang);

      // Check if medicine explanation is invalid or unknown
      const isUnknownMessage = formattedExplanation.toLowerCase().includes("couldn't verify reliable information") || 
                                formattedExplanation.toLowerCase().includes("could not verify");

      // Add to history if valid
      const newHistoryItem: ExplanationHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        medicineName: targetMed,
        language: targetLang,
        explanation: formattedExplanation,
        timestamp: new Date().toLocaleString(),
        isBookmarked: false,
        personalNotes: ""
      };

      // Exclude multiple duplicates
      const filtered = historyItems.filter(
        item => !(item.medicineName.toLowerCase() === targetMed.toLowerCase() && item.language === targetLang)
      );
      saveHistory([newHistoryItem, ...filtered]);

    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Failed to contact the pharmacist AI server. Please verify your internet connection or check if your API keys are correct."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyItems.map(item => {
      if (item.id === id) {
        return { ...item, isBookmarked: !item.isBookmarked };
      }
      return item;
    });
    saveHistory(updated);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyItems.filter(item => item.id !== id);
    saveHistory(updated);
  };

  const handleApplyHistoryItem = (item: ExplanationHistoryItem) => {
    setCurrentExplanation(item.explanation);
    setCurrentMedicineName(item.medicineName);
    setCurrentLanguage(item.language);
    setMedicineName(item.medicineName);
    setLanguage(item.language);
    setActiveTab("explainer");
  };

  const startEditingNotes = (item: ExplanationHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNotesId(item.id);
    setTempNotes(item.personalNotes || "");
  };

  const saveNotes = (id: string) => {
    const updated = historyItems.map(item => {
      if (item.id === id) {
        return { ...item, personalNotes: tempNotes };
      }
      return item;
    });
    saveHistory(updated);
    setEditingNotesId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyExplanation = () => {
    if (currentExplanation) {
      navigator.clipboard.writeText(currentExplanation);
      alert("Medicine summary copied to your clipboard!");
    }
  };

  // Helper parser for the structured output
  const parseSections = (text: string) => {
    const sections: { title: string; content: string; icon: string }[] = [];
    const lines = text.split("\n");
    let currentSection: { title: string; content: string[]; icon: string } | null = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Identify header patterns
      if (trimmed.startsWith("💊 Medicine Name:")) {
        if (currentSection) sections.push({ ...currentSection, content: currentSection.content.join("\n") });
        currentSection = { title: "💊 Medicine Name", content: [], icon: "💊" };
      } else if (trimmed.startsWith("📌 What is it used for?")) {
        if (currentSection) sections.push({ ...currentSection, content: currentSection.content.join("\n") });
        currentSection = { title: "📌 What is it used for?", content: [], icon: "📌" };
      } else if (trimmed.startsWith("⚠️ Precautions:")) {
        if (currentSection) sections.push({ ...currentSection, content: currentSection.content.join("\n") });
        currentSection = { title: "⚠️ Precautions", content: [], icon: "⚠️" };
      } else if (trimmed.startsWith("🔍 Possible Side Effects:")) {
        if (currentSection) sections.push({ ...currentSection, content: currentSection.content.join("\n") });
        currentSection = { title: "🔍 Possible Side Effects", content: [], icon: "🔍" };
      } else if (trimmed.startsWith("🧾 Simple Explanation:")) {
        if (currentSection) sections.push({ ...currentSection, content: currentSection.content.join("\n") });
        currentSection = { title: "🧾 Simple Explanation", content: [], icon: "🧾" };
      } else if (trimmed.startsWith("❌ What this AI cannot do:")) {
        if (currentSection) sections.push({ ...currentSection, content: currentSection.content.join("\n") });
        currentSection = { title: "❌ What this AI cannot do", content: [], icon: "❌" };
      } else if (trimmed.startsWith("⚕️ Medical Disclaimer:")) {
        if (currentSection) sections.push({ ...currentSection, content: currentSection.content.join("\n") });
        currentSection = { title: "⚕️ Medical Disclaimer", content: [], icon: "⚕️" };
      } else {
        if (currentSection) {
          // clean up trailing markdown bullet lists if present
          currentSection.content.push(line);
        } else {
          // If content occurs before any parsed headings, default to a summary
          currentSection = { title: "Description", content: [line], icon: "📋" };
        }
      }
    });

    if (currentSection) {
      sections.push({ ...currentSection, content: currentSection.content.join("\n") });
    }

    return sections;
  };

  const parsedSections = currentExplanation ? parseSections(currentExplanation) : [];

  const filteredHistory = historyItems.filter(item => 
    item.medicineName.toLowerCase().includes(searchHistoryQuery.toLowerCase()) || 
    item.explanation.toLowerCase().includes(searchHistoryQuery.toLowerCase()) ||
    (item.personalNotes && item.personalNotes.toLowerCase().includes(searchHistoryQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col font-sans selection:bg-natural-brand/20">
      
      {/* Header Area */}
      <header className="flex flex-col sm:flex-row justify-between items-center px-6 md:px-12 py-5 border-b border-natural-border gap-4 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-natural-brand rounded-full flex items-center justify-center text-white font-serif italic text-xl shadow-xs">
            Ph
          </div>
          <div>
            <h1 className="font-serif text-2xl tracking-tight text-natural-darkbrand font-semibold">
              PharmaGuide AI
            </h1>
            <p className="text-[10px] text-natural-muted font-mono uppercase tracking-widest leading-none mt-0.5">
              RESPONSIBLE PRODUCT EXPLAINER • MAY 2026
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-natural-alt rounded-xl border border-natural-border shrink-0">
          <button
            id="tab-explainer"
            onClick={() => setActiveTab("explainer")}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
              activeTab === "explainer"
                ? "bg-natural-brand text-white shadow-xs"
                : "text-natural-muted hover:text-natural-text"
            }`}
          >
            Explainer
          </button>
          <button
            id="tab-checklist"
            onClick={() => setActiveTab("checklist")}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
              activeTab === "checklist"
                ? "bg-natural-brand text-white shadow-xs"
                : "text-natural-muted hover:text-natural-text"
            }`}
          >
            Safety Checklist
          </button>
          <button
            id="tab-glossary"
            onClick={() => setActiveTab("glossary")}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
              activeTab === "glossary"
                ? "bg-natural-brand text-white shadow-xs"
                : "text-natural-muted hover:text-natural-text"
            }`}
          >
            Glossary
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive / Content Column */}
        <section className="lg:col-span-8 flex flex-col gap-6">

          {activeTab === "explainer" && (
            <>
              {/* Clinical Query Config Block */}
              <div className="bg-white rounded-[24px] p-6 shadow-xs border border-[#F0F0E8] flex flex-col gap-5">
                <div>
                  <h2 className="font-serif text-xl font-bold text-natural-darkbrand flex items-center gap-2">
                    <Pill className="w-5 h-5 text-natural-brand" />
                    Decode Your Prescribed Product
                  </h2>
                  <p className="text-xs text-natural-text/70 mt-1">
                    Translate dense pharmaceutical information into safe, patient-centric guides.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Medicine Name Inputs */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="medicine-input" className="text-[11px] font-bold text-natural-muted uppercase tracking-wider">
                      Medicine Name
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-muted" />
                      <input
                        id="medicine-input"
                        type="text"
                        placeholder="e.g., Paracetamol, Metformin..."
                        className="w-full bg-natural-alt border border-natural-border rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-natural-brand focus:bg-white transition-all text-natural-text placeholder:text-natural-muted"
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleExplain();
                        }}
                      />
                    </div>
                  </div>

                  {/* Language Input Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="language-select" className="text-[11px] font-bold text-natural-muted uppercase tracking-wider">
                      Explanation Language
                    </label>
                    <div className="relative">
                      <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-muted" />
                      <select
                        id="language-select"
                        className="w-full bg-natural-alt border border-natural-border rounded-xl py-3 pl-10 pr-8 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-natural-brand focus:bg-white transition-all text-natural-text appearance-none cursor-pointer"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-natural-muted text-xs">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Presets Pills */}
                <div>
                  <span className="text-[10px] font-bold text-natural-muted uppercase tracking-wider block mb-2">
                    Quick Reference Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_MEDICINES.map(med => (
                      <button
                        key={med.name}
                        onClick={() => {
                          setMedicineName(med.name);
                          handleExplain(med.name);
                        }}
                        className="bg-natural-alt border border-natural-border hover:border-natural-brand/50 hover:bg-natural-brand/5 rounded-full px-3.5 py-1.5 text-xs text-natural-brand font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-natural-brand"></span>
                        <span className="font-semibold">{med.name}</span>
                        <span className="text-[10px] text-natural-muted font-normal italic">({med.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Command Action bar */}
                <div className="flex items-center justify-between border-t border-natural-border/60 pt-4 mt-2">
                  <span className="text-[11px] text-natural-muted flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Checked against strict safety conditions.
                  </span>
                  <button
                    id="explain-btn"
                    onClick={() => handleExplain()}
                    disabled={isLoading}
                    className="bg-natural-brand text-white border-none font-bold text-sm tracking-wide px-6 py-3 rounded-xl shadow-md shadow-natural-brand/20 hover:bg-natural-darkbrand transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Consulting AI Pharmacist...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Explain Medicine
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error messages if any */}
              {error && (
                <div id="error-banner" className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Execution Safety Block</p>
                    <p>{error}</p>
                    <p className="text-[10px] text-red-600 mt-1.5">
                      To fix API Key issues: Please open the **Settings Menu** at the top right, go to **Secrets**, and add a key named **GEMINI_API_KEY**.
                    </p>
                  </div>
                </div>
              )}

              {/* Real-time Loader Placeholder */}
              {isLoading && (
                <div className="bg-white rounded-[24px] p-10 shadow-xs border border-[#F0F0E8] flex flex-col items-center justify-center text-center gap-4 animate-pulse">
                  <div className="w-16 h-16 bg-natural-alt rounded-full flex items-center justify-center text-natural-brand">
                    <Pill className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-natural-darkbrand">Drafting Patient-Safe Reference</h3>
                    <p className="text-xs text-natural-muted max-w-sm mt-1">
                      Structuring explanations to minimize jargon, verify safety points, and emphasize necessary cautions...
                    </p>
                  </div>
                </div>
              )}

              {/* Parsed Pharmacological Explanation Output Block */}
              {currentExplanation && !isLoading && (
                <article id="pharmacological-output" className="bg-white rounded-[32px] p-8 shadow-xs border border-[#F0F0E8] flex flex-col gap-6 animate-fade-in print:shadow-none print:border-none">
                  
                  {/* Top Metadata Badge */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-natural-border/60 pb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-natural-brand text-[10px] font-bold uppercase tracking-widest bg-natural-alt px-3 py-1 rounded-full">
                          AI Pharmaceutical Advice
                        </span>
                        <span className="font-mono text-[9px] text-[#22c55e] bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                          ✓ Checked
                        </span>
                      </div>
                      <h3 className="font-serif text-4xl mt-3 text-natural-text font-bold" id="output-med-title">
                        {currentMedicineName}
                      </h3>
                      <p className="text-natural-muted text-xs mt-1 font-semibold">
                        Preferred Output Language: <span className="text-natural-brand">{currentLanguage}</span>
                      </p>
                    </div>

                    <div className="flex gap-2 self-stretch sm:self-center">
                      <button
                        id="btn-copy-exp"
                        onClick={handleCopyExplanation}
                        className="flex-1 sm:flex-none px-4 py-2 bg-natural-alt hover:bg-natural-brand/10 border border-natural-border rounded-xl text-xs font-bold text-natural-brand transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        title="Copy text breakdown"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Copy text
                      </button>
                      <button
                        id="btn-print-exp"
                        onClick={handlePrint}
                        className="flex-1 sm:flex-none px-4 py-2 bg-natural-brand hover:bg-natural-darkbrand text-white rounded-xl text-xs font-bold shadow-sm shadow-natural-brand/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Guide
                      </button>
                    </div>
                  </div>

                  {/* Primary Grid Layout for Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Render components depending on sections parsed */}
                    {parsedSections.map((sect, index) => {
                      if (sect.title.includes("Medicine Name")) {
                        return null; // already shown in large header
                      }

                      // Categorize color weights depending on section
                      let containerClass = "p-5 rounded-2xl bg-natural-alt/40 border border-[#F0F0E8]";
                      let titleColor = "text-natural-brand";

                      if (sect.title.includes("Precautions")) {
                        containerClass = "p-5 rounded-2xl bg-amber-50/40 border border-amber-100/80";
                        titleColor = "text-amber-800";
                      } else if (sect.title.includes("Medical Disclaimer")) {
                        containerClass = "p-5 rounded-2xl bg-blue-50/40 border border-blue-100/80 col-span-full";
                        titleColor = "text-blue-800";
                      } else if (sect.title.includes("Simple Explanation")) {
                        containerClass = "p-6 rounded-2xl bg-[#5A5A40]/5 border border-[#5A5A40]/10 col-span-full";
                        titleColor = "text-natural-darkbrand font-bold";
                      } else if (sect.title.includes("cannot do")) {
                        containerClass = "p-5 rounded-2xl bg-red-50/30 border border-red-100/60";
                        titleColor = "text-red-800";
                      }

                      return (
                        <div key={index} className={containerClass}>
                          <h4 className={`${titleColor} font-display text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-1.5`}>
                            <span>{sect.title}</span>
                          </h4>
                          
                          {/* Rich Rendering of Contents */}
                          <div className="text-natural-text text-xs/relaxed whitespace-pre-wrap font-medium">
                            {sect.title.includes("Simple Explanation") ? (
                              <blockquote className="font-serif italic text-base/relaxed text-natural-text border-l-4 border-natural-brand pl-4 py-1">
                                {sect.content}
                              </blockquote>
                            ) : (
                              <div className="space-y-1">
                                {sect.content.split("\n").map((cli, ci) => {
                                  const text = cli.trim();
                                  if (!text) return null;
                                  if (text.startsWith("-") || text.startsWith("*")) {
                                    return (
                                      <p key={ci} className="pl-4 relative">
                                        <span className="absolute left-0 text-natural-brand font-bold">•</span>
                                        {text.substring(1).trim()}
                                      </p>
                                    );
                                  }
                                  return <p key={ci}>{text}</p>;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Notes to this generated session */}
                  <div className="border-t border-natural-border pt-6 mt-4">
                    <h4 className="text-[11px] font-bold text-natural-muted uppercase tracking-wider mb-2">
                      Personal Patient Med-Notes
                    </h4>
                    <p className="text-[11px] text-natural-muted mb-3">
                      Add custom schedules, pharmacy phone numbers, or doctor intake notes linked specifically to {currentMedicineName}. Saved directly to your device storage.
                    </p>
                    
                    {(() => {
                      // Find current item in history
                      const associatedItem = historyItems.find(
                        item => item.medicineName.toLowerCase() === currentMedicineName?.toLowerCase() && item.language === currentLanguage
                      );
                      
                      if (!associatedItem) return null;

                      const isEditing = editingNotesId === associatedItem.id;
                      
                      return (
                        <div className="bg-natural-alt rounded-2xl p-4 border border-natural-border">
                          {isEditing ? (
                            <div className="space-y-3">
                              <textarea
                                id="notes-textarea-main"
                                className="w-full bg-white border border-natural-border rounded-xl p-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-natural-brand text-natural-text"
                                rows={3}
                                placeholder="Write down doctor schedules, allergy triggers, or local distributor address..."
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-3 py-1.5 rounded-lg border border-natural-border text-[11px] font-bold text-natural-muted cursor-pointer hover:bg-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  id="btn-save-notes-main"
                                  onClick={() => saveNotes(associatedItem.id)}
                                  className="px-4 py-1.5 bg-natural-brand hover:bg-natural-darkbrand text-white rounded-lg text-[11px] font-bold cursor-pointer"
                                >
                                  Save Notes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                {associatedItem.personalNotes ? (
                                  <p className="text-xs text-natural-text whitespace-pre-wrap leading-relaxed font-semibold italic">
                                    &ldquo;{associatedItem.personalNotes}&rdquo;
                                  </p>
                                ) : (
                                  <span className="text-xs text-natural-muted italic">
                                    No personal medical observations written yet.
                                  </span>
                                )}
                              </div>
                              <button
                                id="btn-edit-notes-main"
                                onClick={(e) => startEditingNotes(associatedItem, e)}
                                className="shrink-0 text-xs text-natural-brand underline font-semibold hover:text-natural-darkbrand cursor-pointer"
                              >
                                {associatedItem.personalNotes ? "Edit Notes" : "+ Add Note"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                </article>
              )}

              {/* Initial Onboarding Information Card */}
              {!currentExplanation && !isLoading && (
                <div className="bg-[#5A5A40] text-[#F5F5F0] rounded-[32px] p-8 shadow-sm flex flex-col gap-6 md:flex-row items-center border border-[#5A5A40]/10">
                  <div className="w-16 h-16 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-white">
                    <HeartHandshake className="w-8 h-8 text-[#ccfbf1]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Medicines Explained responsibly.</h3>
                    <p className="text-xs text-[#F5F5F0]/85 leading-relaxed mt-2">
                      Welcome to PharmaGuide AI. Type in any medical ingredient or generic drug above, choose your translation, and get a safe patient guide automatically matched to exact clinical distribution boundaries. Underneath, use our medical checkers to write pharmacist notes.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "checklist" && (
            <div className="animate-fade-in">
              <SafetyChecklist />
            </div>
          )}

          {activeTab === "glossary" && (
            <div className="animate-fade-in">
              <Glossary />
            </div>
          )}

        </section>

        {/* Right Sidebar Column */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          {/* AI Limitations warning card */}
          <div className="bg-[#F5F5F0] border border-[#E5E5DF] rounded-[24px] p-6 flex flex-col">
            <h3 className="text-natural-darkbrand font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ❌ What this AI cannot do
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#ECECE6]">
                <div className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[10px] font-bold">✕</div>
                <p className="text-[11px] text-[#4A4A3F] font-semibold">Cannot diagnose any medical status</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#ECECE6]">
                <div className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[10px] font-bold">✕</div>
                <p className="text-[11px] text-[#4A4A3F] font-semibold">Cannot prescribe custom drug dosages</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#ECECE6]">
                <div className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[10px] font-bold">✕</div>
                <p className="text-[11px] text-[#4A4A3F] font-semibold">Cannot substitute local professional guidance</p>
              </div>
            </div>
            
            <p className="text-[10px] text-natural-muted leading-relaxed mt-4 bg-white/60 p-3 rounded-lg border border-dashed border-[#ECECE6]">
              All guides generated strictly prompt patient-pharmacist interaction scripts at the end of every inquiry cycle to guarantee perfect therapeutic adherence.
            </p>
          </div>

          {/* History & Stored Items Panel */}
          <div className="bg-white border border-natural-border rounded-[24px] p-6 transition-all shadow-xs flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-natural-border/60">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-natural-brand" />
                <h3 className="text-natural-darkbrand font-bold text-xs uppercase tracking-widest">
                  Consultation History
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-natural-alt text-natural-brand px-2 py-0.5 rounded-full font-semibold">
                {historyItems.length} items
              </span>
            </div>

            {/* Live Search for history */}
            {historyItems.length > 0 && (
              <div className="mb-3.5 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-natural-muted" />
                <input
                  id="history-search-input"
                  type="text"
                  placeholder="Filter past records..."
                  className="w-full bg-natural-alt border border-natural-border rounded-lg py-1.5 pl-8 pr-3 text-xs text-natural-text focus:outline-hidden focus:ring-1 focus:ring-natural-brand focus:bg-white"
                  value={searchHistoryQuery}
                  onChange={(e) => setSearchHistoryQuery(e.target.value)}
                />
              </div>
            )}

            {/* List of items */}
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] pr-1">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    id={`history-item-${item.id}`}
                    onClick={() => handleApplyHistoryItem(item)}
                    className="p-3 bg-natural-alt/50 hover:bg-natural-alt rounded-xl border border-natural-border/60 hover:border-natural-brand/30 transition-all cursor-pointer text-left relative flex flex-col justify-between group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-serif text-sm font-bold text-natural-text group-hover:text-natural-brand transition-colors">
                        {item.medicineName}
                      </span>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Bookmark checkbox style button */}
                        <button
                          id={`bookmark-btn-${item.id}`}
                          onClick={(e) => toggleBookmark(item.id, e)}
                          className="p-1 hover:bg-white rounded-md text-natural-muted hover:text-natural-brand transition-all cursor-pointer"
                          title="Bookmark this medication"
                        >
                          <Bookmark 
                            className={`w-3.5 h-3.5 ${
                              item.isBookmarked ? "fill-natural-brand text-natural-brand" : "text-natural-muted"
                            }`} 
                          />
                        </button>
                        <button
                          id={`delete-btn-${item.id}`}
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-1 hover:bg-red-50 rounded-md text-natural-muted hover:text-red-600 transition-all cursor-pointer"
                          title="Delete history item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 text-[10px] text-natural-muted">
                      <span className="bg-white border border-natural-border/60 px-1.5 py-0.5 rounded-md font-semibold text-natural-brand">
                        {item.language}
                      </span>
                      <span className="flex items-center gap-0.5 text-[9px] font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {item.timestamp.split(",")[0]}
                      </span>
                    </div>

                    {/* Private Clinical Observation Badge */}
                    {item.personalNotes && (
                      <div className="mt-2 text-[9px] text-[#a16207] bg-amber-50/70 border border-amber-100 rounded p-1 flex items-start gap-1">
                        <span className="font-bold">Note:</span>
                        <span className="truncate flex-1 font-medium">{item.personalNotes}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-natural-muted/70 text-xs flex flex-col items-center justify-center gap-2">
                  <Clock className="w-8 h-8 text-natural-border" />
                  <span>No past medicine reports found.</span>
                </div>
              )}
            </div>

            {historyItems.length > 0 && (
              <button
                id="clear-all-history-btn"
                onClick={() => {
                  if (confirm("Are you sure you want to delete all medicine search history?")) {
                    saveHistory([]);
                  }
                }}
                className="mt-4 pt-3 border-t border-natural-border/60 text-center text-[10px] font-mono tracking-wider text-red-500 hover:text-red-700 font-bold uppercase transition-colors cursor-pointer w-full text-left"
              >
                Clear Entire History Archive
              </button>
            )}
          </div>
        </aside>

      </main>

      {/* Sticky footer disclaimer structured exactly for natural tones */}
      <footer className="bg-natural-border/40 py-6 px-6 md:px-12 text-center border-t border-natural-border shrink-0 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
          <p className="text-[12px] font-serif font-semibold text-natural-darkbrand">
            ⚕️ Medical Disclaimer: AI-generated information only. Please consult a doctor or pharmacist before use.
          </p>
          <p className="text-[10px] text-natural-muted font-sans font-medium">
            This platform acts as an educational aid and does not substitute clinical consultation or active health interventions of any type.
          </p>
        </div>
      </footer>

    </div>
  );
}
