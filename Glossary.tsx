import React, { useState } from "react";
import { BookOpen, Search, HelpCircle, ArrowRight } from "lucide-react";
import { GlossaryItem } from "../types";

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: "Generic Medicine",
    simpleDefinition: "The active chemical compound in a drug. It works identically to brand-name versions, has the same safety and strength, but is usually much less expensive.",
    category: "General"
  },
  {
    term: "Brand Name Medicine",
    simpleDefinition: "The commercial trademarked name chosen by the pharmaceutical manufacturer (e.g., 'Panadol' or 'Tylenol' for Paracetamol).",
    category: "General"
  },
  {
    term: "NSAID",
    simpleDefinition: "Non-Steroidal Anti-Inflammatory Drug. A class of medicines that reduces pain, lowers fever, and relieves inflammation (e.g., Ibuprofen, Naproxen).",
    category: "Drug Classes"
  },
  {
    term: "Antibiotic",
    simpleDefinition: "A medicine used specifically to kill or block the growth of bacteria. It does NOT cure viruses like the common cold, flu, or COVID-19.",
    category: "Drug Classes"
  },
  {
    term: "Antihistamine",
    simpleDefinition: "A drug that blocks histamine, a chemical in the body that triggers allergic reactions. Commonly used for runny nose, itching, or hay fever.",
    category: "Drug Classes"
  },
  {
    term: "Contraindication",
    simpleDefinition: "A medical reason, condition, or other drug that makes a particular medicine highly dangerous to take (e.g., taking standard ibuprofen is contraindicated in active stomach ulcers).",
    category: "Safety"
  },
  {
    term: "Active Ingredient",
    simpleDefinition: "The main chemical substance inside a medicine responsible for its beneficial biological effect.",
    category: "General"
  },
  {
    term: "OTC (Over-The-Counter)",
    simpleDefinition: "Medicines that can be legally purchased without requiring a doctor's written prescription.",
    category: "General"
  },
  {
    term: "Anticonvulsant",
    simpleDefinition: "A diverse group of drugs used in the treatment of epileptic seizures and sometimes neuropathic pain.",
    category: "Drug Classes"
  },
  {
    term: "Antacid",
    simpleDefinition: "A weak base medicine that neutralizes excess stomach acid to quickly relieve symptoms of acid reflux, heartburn, and indigestion.",
    category: "General"
  }
];

export default function Glossary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(GLOSSARY_ITEMS.map(i => i.category)))];

  const filteredItems = GLOSSARY_ITEMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.simpleDefinition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/60 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-natural-alt text-natural-brand p-2.5 rounded-xl">
          <BookOpen className="w-5 h-5" id="glossary-book-icon" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-natural-darkbrand" id="glossary-title">
            Pharmaceutical Glossary
          </h2>
          <p className="text-xs text-natural-muted">
            Understand common pharmacy terms in clear, friendly phrases.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-muted" />
          <input
            id="glossary-search-input"
            type="text"
            placeholder="Search medical terms..."
            className="w-full bg-natural-alt border border-natural-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-natural-brand focus:bg-white transition-all text-natural-text placeholder:text-natural-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              id={`glossary-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-natural-brand text-white"
                  : "bg-natural-alt text-natural-muted hover:bg-natural-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => (
            <div
              key={idx}
              id={`glossary-item-${idx}`}
              className="p-4 bg-natural-alt/30 rounded-xl transition-all border border-natural-border/60 hover:border-natural-brand/30 hover:bg-natural-brand/5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif text-sm font-bold text-natural-darkbrand">
                  {item.term}
                </span>
                <span className="text-[10px] bg-natural-border/60 text-natural-muted px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-natural-text/80 leading-relaxed font-medium">
                {item.simpleDefinition}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-natural-muted text-xs flex flex-col items-center justify-center gap-2">
            <HelpCircle className="w-8 h-8 text-natural-muted" />
            <span>No terms match your search. Try another spelling.</span>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-natural-border/65 flex items-center justify-between text-[11px] text-natural-muted">
        <span className="flex items-center gap-1 font-semibold">
          ⚕️ Empowers pharmacy distribution transparency
        </span>
        <span className="font-mono text-[10px]">Updated May 2026</span>
      </div>
    </div>
  );
}
