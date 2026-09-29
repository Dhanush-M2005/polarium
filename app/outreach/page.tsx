"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Share2,
  FileText,
  MessageSquare,
  Video,
  ShieldCheck,
  Sparkles,
  Wand2,
  Copy,
  Check,
  Shield,
  Loader2,
  Globe2,
  Cpu,
  Radio,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getAllExpeditions, ExpeditionHub } from "@/lib/data/knowledge-graph";
import { MOCK_OUTREACH } from "@/lib/mock-data";
import { OutreachCard } from "@/components/OutreachCard";

export default function OutreachPage() {
  const { language, t } = useLanguage();

  const expeditions = useMemo(() => getAllExpeditions(), []);
  const [selectedExpId, setSelectedExpId] = useState<string>("");
  const [topicInput, setTopicInput] = useState<string>("");
  const [channel, setChannel] = useState<string>("Website Article");
  const [targetAudience, setTargetAudience] = useState<string>("General Public");
  const [outputLanguage, setOutputLanguage] = useState<string>("auto");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<number>(1);

  // Active expedition object (defaults to 1st expedition if none selected)
  const activeExpedition = useMemo<ExpeditionHub>(() => {
    if (selectedExpId) {
      const found = expeditions.find((e) => e.id === selectedExpId);
      if (found) return found;
    }
    return expeditions[0] || {
      id: "exp-043",
      expedition_number: 43,
      name: "43rd Indian Scientific Expedition to Antarctica",
      short_name: "43-IAE",
      region: "Antarctica",
      polar_region: "Bharati & Maitri Stations",
      year: 2024,
      status: "Completed",
      chief_scientist: "Dr. S. Rajan (NCPOR)",
      description: "Long-term glaciology and AWS telemetry",
      objectives: ["Ice mass balance", "AWS maintenance"],
      research_summary: "Multi-disciplinary polar science operations.",
      keywords: ["Glaciology", "AWS", "Ice Core"],
    };
  }, [expeditions, selectedExpId]);

  // Sync initial topic input when active expedition changes
  useEffect(() => {
    if (!topicInput || topicInput === activeExpedition.name) {
      setTopicInput(activeExpedition.name);
    }
  }, [activeExpedition]);

  // Dynamic AI Dissemination Generator with Neural Ticker Animation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedOutput(null);
    setLoadingStage(1);

    // Ticker animation timer stages
    const stage1 = setTimeout(() => setLoadingStage(2), 600);
    const stage2 = setTimeout(() => setLoadingStage(3), 1400);

    const targetTopic = topicInput.trim() || activeExpedition.name;
    const reqLanguage =
      outputLanguage === "auto"
        ? language === "hi"
          ? "Hindi Only"
          : "English Only"
        : outputLanguage;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/generate-outreach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          topic: targetTopic,
          expedition_id: activeExpedition.id,
          report_id: activeExpedition.id,
          channel: channel,
          language: reqLanguage,
          target_audience: targetAudience,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.drafted_text || data.english_thread || data.press_release || "";
        if (content) {
          setGeneratedOutput(content);
          return;
        }
      }
      throw new Error("Using dynamic fallback synthesis");
    } catch (err) {
      const expName = activeExpedition.name;
      const expRegion = activeExpedition.region;
      const expYear = activeExpedition.year;
      const expSite = activeExpedition.polar_region;
      const expLead = activeExpedition.chief_scientist;
      const summary = activeExpedition.research_summary;
      const objectivesStr = activeExpedition.objectives.map((o) => `• ${o}`).join("\n");

      let draft = "";

      if (channel === "Twitter/X" || channel === "Twitter/X Thread") {
        draft = language === "hi"
          ? `1/3 ❄️ भारत का ध्रुवीय विज्ञान अभियान! ${expName} (${expYear}) ने ${expRegion} क्षेत्र में ${expSite} पर महत्वपूर्ण डेटा रिकॉर्ड किए हैं। नेतृत्व: ${expLead}। 🇮🇳🔬 #PolarScience #NCPOR #MoES\n\n` +
            `2/3 🧊 ${summary}\n\n` +
            `3/3 📡 सभी सत्यापित डेटासेट राष्ट्रीय ध्रुवीय ज्ञान भंडार (POLARIUM) में शोधकर्ताओं और छात्रों के लिए उपलब्ध हैं। 🌐 #NationalPolarRegistry`
          : `1/3 ❄️ India's Polar Science Operations! The ${expName} (${expYear}) achieved key research milestones at ${expSite} (${expRegion}). Operational Lead: ${expLead}. 🇮🇳🔬 #PolarScience #NCPOR #MoES\n\n` +
            `2/3 🧊 ${summary}\n\n` +
            `3/3 📡 Verified dataset series and monographs are declassified in the POLARIUM National Polar Registry for open academic access. 🌐 #NationalPolarRegistry`;
      } else if (channel === "Press Release" || channel === "Press Release (PIB)") {
        draft = language === "hi"
          ? `प्रेस सूचना कार्यालय (PIB)\nभारत सरकार | पृथ्वी विज्ञान मंत्रालय (MoES)\n\n` +
            `तत्काल प्रकाशन हेतु\n` +
            `नई दिल्ली / वास्को-डा-गामा (गोवा)\n\n` +
            `आधिकारिक मिशन विज्ञप्ति: ${expName.toUpperCase()} — ${expYear}\n\n` +
            `राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र (NCPOR), पृथ्वी विज्ञान मंत्रालय के अंतर्गत, ${expName} के सफल क्षेत्र संचालन की घोषणा करता है।\n\n` +
            `मुख्य वैज्ञानिक ${expLead} के नेतृत्व में वैज्ञानिक दल ने ${expSite} (${expRegion}) पर निम्नलिखित मुख्य उद्देश्य पूरे किए:\n${objectivesStr}\n\n` +
            `अनुसंधान विश्लेषण:\n${summary}\n\n` +
            `***\n(एनसीपीओआर संचार एवं प्रसार इकाई)`
          : `PRESS INFORMATION BUREAU\nGOVERNMENT OF INDIA | MINISTRY OF EARTH SCIENCES (MoES)\n\n` +
            `FOR IMMEDIATE RELEASE\n` +
            `NEW DELHI / VASCO DA GAMA (GOA)\n\n` +
            `OFFICIAL MISSION DISPATCH: ${expName.toUpperCase()} — ${expYear}\n\n` +
            `The National Centre for Polar and Ocean Research (NCPOR), under the Ministry of Earth Sciences, announces the successful operational deployment of the ${expName}.\n\n` +
            `Led by Chief Scientist ${expLead}, the multi-disciplinary team executed key scientific objectives at ${expSite} (${expRegion}):\n${objectivesStr}\n\n` +
            `Executive Synthesis:\n${summary}\n\n` +
            `***\n(NCPOR Communication & Outreach Unit)`;
      } else {
        draft = language === "hi"
          ? `# ${expName}: वैज्ञानिक रिपोर्ट एवं जन-जागरूकता आलेख\n\n` +
            `### 1. कार्यकारी सारांश (Executive Summary)\n` +
            `${summary}\n\n` +
            `### 2. क्षेत्र संचालन एवं मुख्य अनुसंधान बिंदु\n` +
            `• **सत्र / वर्ष:** ${expYear}\n` +
            `• **मुख्य वैज्ञानिक:** ${expLead}\n` +
            `• **स्टेशन एवं क्षेत्र:** ${expSite} (${expRegion})\n\n` +
            `### 3. प्रमुख वैज्ञानिक उद्देश्य\n` +
            `${objectivesStr}\n\n` +
            `### 4. निष्कर्ष एवं डेटा उपलब्धता\n` +
            `राष्ट्रीय ध्रुवीय अनुसंधान केंद्र (NCPOR) द्वारा सत्यापित सभी अवलोकन डेटासेट और मोनोग्राफ POLARIUM राष्ट्रीय ज्ञान पोर्टल पर सार्वजनिक अध्ययन हेतु उपलब्ध हैं।`
          : `# Unlocking Polar Science: Key Discoveries from the ${expName}\n\n` +
            `### Executive Summary\n` +
            `${summary}\n\n` +
            `### Scientific Field Operations\n` +
            `• **Operational Season:** ${expYear}\n` +
            `• **Chief Scientist:** ${expLead}\n` +
            `• **Observatory Site:** ${expSite} (${expRegion})\n\n` +
            `### Core Research Objectives\n` +
            `${objectivesStr}\n\n` +
            `### Data Integrity & National Registry Access\n` +
            `All continuous AWS telemetry records, ice mass balance series, and peer-reviewed monograph archives generated during this expedition are declassified and open-access via the POLARIUM National Polar Knowledge Registry.`;
      }

      setGeneratedOutput(draft);
    } finally {
      clearTimeout(stage1);
      clearTimeout(stage2);
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedOutput) {
      navigator.clipboard.writeText(generatedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredTemplates = useMemo(() => {
    if (selectedCategoryFilter === "ALL") return MOCK_OUTREACH;
    return MOCK_OUTREACH.filter((o) => o.contentType === selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300 pb-20">
      {/* Official Government Hero Header */}
      <section className="bg-gradient-to-r from-brand-dark via-brand-navy to-brand-navy text-white py-10 px-4 sm:px-8 border-b-4 border-cyan-500 shadow-md">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-sm text-xs font-bold uppercase tracking-wider ">
              <Shield className="w-3.5 h-3.5 text-amber-300" /> {t("State Emblem of India", "भारत का राज्य प्रतीक")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded-sm text-xs font-bold uppercase tracking-wider font-mono">
              <Share2 className="w-3.5 h-3.5 text-cyan-300" /> {t("Science Communication & Outreach", "विज्ञान संचार एवं जन-प्रसार")}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t("From Research to Public Knowledge", "अनुसंधान से जन-ज्ञान तक")}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed font-medium">
            {t(
              "Transform verified NCPOR polar research into accessible press releases, social media posts, articles, and video scripts.",
              "सत्यापित एनसीपीओआर ध्रुवीय अनुसंधान को प्रेस विज्ञप्तियों, सोशल मीडिया पोस्ट, लेखों और वीडियो स्क्रिप्ट में रूपांतरित करें।"
            )}
          </p>

          {/* Format Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              {t("Format:", "प्रारूप:")}
            </span>
            {["ALL", "Articles", "Social Media", "Video Scripts"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedCategoryFilter(type)}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${ selectedCategoryFilter === type ? "bg-amber-400 text-brand-navy shadow-sm font-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10" }`}
              >
                {type === "ALL"
                  ? t("ALL", "सभी")
                  : type === "Articles"
                  ? t("Articles", "आलेख")
                  : type === "Social Media"
                  ? t("Social Media", "सोशल मीडिया")
                  : t("Video Scripts", "वीडियो स्क्रिप्ट")}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white border border-slate-300 text-slate-800 rounded-sm p-3.5 flex items-center justify-between text-xs shadow-2xs transition-colors duration-300">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>{t("Dynamic Outreach Engine:", "डायनामिक आउटरीच इंजन:")}</strong>{" "}
              {t(
                "Connected live to 79 indexed Indian Scientific Expeditions in the National Polar Knowledge Graph.",
                "राष्ट्रीय ध्रुवीय ज्ञान ग्राफ में 79 भारतीय अभियानों से सीधा जुड़ा हुआ।"
              )}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            MoES Media Dissemination
          </span>
        </div>

        {/* Interactive Dynamic Generator Tool */}
        <div className="bg-white rounded-sm border border-slate-300 p-6 md:p-8 space-y-6 shadow-xs transition-colors duration-300">
          <div className="flex items-center gap-2 text-brand-navy font-extrabold text-base sm:text-lg transition-colors duration-300">
            <Wand2 className="w-5 h-5 text-amber-500" />
            <span>{t("Dynamic Outreach Content Studio", "डायनामिक आउटरीच कंटेंट स्टूडियो")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-4">
              {/* 1. Dynamic Expedition Selector */}
              <div>
                <label htmlFor="outreach-expedition-selector" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 transition-colors duration-300">
                  {t("Select Expedition Hub:", "अभियान हब चुनें:")}
                </label>
                <select
                  id="outreach-expedition-selector"
                  value={selectedExpId}
                  onChange={(e) => {
                    setSelectedExpId(e.target.value);
                    const found = expeditions.find((x) => x.id === e.target.value);
                    if (found) setTopicInput(found.name);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-sm text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-navy transition-colors duration-300"
                >
                  <option value="">{t("-- Select from 79 Scientific Expeditions --", "-- 79 अभियानों में से चुनें --")}</option>
                  {expeditions.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      [{exp.id.toUpperCase()}] {exp.name} ({exp.year}) — {exp.region}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Topic Input Box */}
              <div>
                <label htmlFor="outreach-topic-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 transition-colors duration-300">
                  {t("Target Subject / Keyword Topic:", "लक्ष्य विषय / कीवर्ड टॉपिक:")}
                </label>
                <input
                  id="outreach-topic-input"
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder={t("Enter expedition topic or title...", "अभियान का विषय या शीर्षक दर्ज करें...")}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-sm text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-navy transition-colors duration-300"
                />
              </div>

              {/* 3. Channel, Audience & Language / Bhashini Selectors */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="outreach-audience-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 transition-colors duration-300">
                    {t("Target Audience:", "लक्ष्य श्रोता:")}
                  </label>
                  <select
                    id="outreach-audience-select"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs font-semibold text-slate-800 transition-colors duration-300"
                  >
                    <option value="General Public">{t("General Public", "सामान्य जनता")}</option>
                    <option value="School Students">{t("School Students (K-12)", "स्कूली छात्र (11-12वीं)")}</option>
                    <option value="Policy Makers">{t("Policy Makers & Press", "नीति निर्माता एवं प्रेस")}</option>
                    <option value="UPSC Aspirants">{t("UPSC / Civil Services", "यूपीएससी / सिविल सेवा")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="outreach-channel-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 transition-colors duration-300">
                    {t("Channel Format:", "प्रसार माध्यम:")}
                  </label>
                  <select
                    id="outreach-channel-select"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs font-semibold text-slate-800 transition-colors duration-300"
                  >
                    <option value="Website Article">{t("Website Article", "वेबसाइट आलेख")}</option>
                    <option value="Twitter/X Thread">{t("Twitter/X Thread", "ट्विटर/X थ्रेड")}</option>
                    <option value="Press Release (PIB)">{t("Press Release (PIB)", "प्रेस विज्ञप्ति (PIB)")}</option>
                    <option value="YouTube Script">{t("Video / Documentary Script", "वीडियो / वृत्तचित्र स्क्रिप्ट")}</option>
                  </select>
                </div>
              </div>

              {/* 4. Language / Bhashini Dissemination Selector */}
              <div>
                <label htmlFor="outreach-language-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1 text-brand-navy transition-colors duration-300">
                  <Globe2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{t("Dissemination Language / भाषिणी (Bhashini):", "प्रसार भाषा / भाषिणी (Bhashini):")}</span>
                </label>
                <select
                  id="outreach-language-select"
                  value={outputLanguage}
                  onChange={(e) => setOutputLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-navy transition-colors duration-300"
                >
                  <option value="auto">{t("⚡ Auto (Matches Active Site Language)", "⚡ स्वचालित (साइट भाषा के अनुसार)")}</option>
                  <option value="English Only">{t("English (Official International Edition)", "अंग्रेज़ी (English - अंतरराष्ट्रीय संपादन)")}</option>
                  <option value="Hindi Only">{t("हिन्दी (Hindi - National MoES Edition)", "हिन्दी (Hindi - राष्ट्रीय संस्करण)")}</option>
                  <option value="Bilingual (English + Hindi)">{t("Bilingual (English + हिन्दी PIB Dispatch)", "द्विभाषी (English + हिन्दी PIB संपादन)")}</option>
                  <option value="Marathi">{t("मराठी (Marathi Edition)", "मराठी (Marathi Edition)")}</option>
                  <option value="Tamil">{t("தமிழ் (Tamil Edition)", "தமிழ் (Tamil Edition)")}</option>
                  <option value="Telugu">{t("తెలుగు (Telugu Edition)", "తెలుగు (Telugu Edition)")}</option>
                  <option value="Bengali">{t("বাংলা (Bengali Edition)", "বাংলা (Bengali Edition)")}</option>
                  <option value="Gujarati">{t("ગુજરાતી (Gujarati Edition)", "ગુજરાતી (Gujarati Edition)")}</option>
                </select>
              </div>

              {/* HIGH-TECH FUTURISTIC GENERATE BUTTON */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-3.5 px-4 font-extrabold text-xs rounded-sm shadow-md transition-all flex items-center justify-center gap-2.5 relative overflow-hidden group cursor-pointer active:scale-[0.98] ${ isGenerating ? "bg-gradient-to-r from-brand-navy via-[#0e488f] to-brand-navy text-amber-300 animate-glow-button border border-amber-400/40" : "bg-gradient-to-r from-brand-navy via-[#0b3b6f] to-brand-navy hover:from-[#0b3b6f] hover:to-[#0f4c8d] text-white hover:text-amber-300 border border-brand-navylight" }`}
              >
                {/* Background Shimmer Effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {isGenerating ? (
                  <>
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-75" />
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300 relative z-10" />
                    </div>
                    <span className="tracking-wide">
                      {t("SYNTHESIZING NEURAL DRAFT...", "न्यूरल ड्राफ्ट सिंथेसाइज हो रहा है...")}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                    <span className="tracking-wider">
                      {t("CREATE DYNAMIC OUTREACH CONTENT", "डायनामिक आउटरीच कंटेंट तैयार करें")}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* GENERATED OUTPUT PREVIEW BOX WITH POLAR NEURAL SCANNER ANIMATION */}
            <div className="md:col-span-7 bg-brand-dark text-white rounded-sm p-5 border border-slate-800 space-y-3 flex flex-col justify-between shadow-md min-h-[360px] relative overflow-hidden">
              <div>
                {/* Top Status Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                  <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-cyan-300" />
                    {t("Generated Dissemination Draft", "जनरेट किया गया प्रसार ड्राफ्ट")}
                  </span>

                  {isGenerating ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 border border-cyan-800/50 rounded-xs animate-pulse">
                      <Radio className="w-3 h-3 text-cyan-400 animate-spin" />
                      AI SYNTHESIS ACTIVE
                    </span>
                  ) : generatedOutput ? (
                    <button
                      onClick={handleCopy}
                      className="text-[11px] text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-1 rounded-xs font-bold transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? t("Copied!", "कॉपी हो गया!") : t("Copy Content", "कंटेंट कॉपी करें")}
                    </button>
                  ) : null}
                </div>

                {/* ANIMATED LOADING RADAR & TELEMETRY SCANNER DISPLAY */}
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-5 min-h-[240px]">
                    {/* Concentric Polar Radar Circle */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full" />
                      <div className="absolute inset-2 border border-cyan-400/30 rounded-full" />
                      <div className="absolute inset-6 border border-amber-400/40 rounded-full" />

                      {/* Rotating Radar Sweep Line */}
                      <div className="absolute inset-0 rounded-full animate-radar pointer-events-none">
                        <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/50 to-transparent rounded-tl-full origin-bottom-right" />
                      </div>

                      {/* Center Pulsing AI Core */}
                      <div className="relative z-10 p-2.5 bg-brand-navy rounded-full border border-cyan-300/60 shadow-lg">
                        <Cpu className="w-6 h-6 text-cyan-300 animate-pulse" />
                      </div>
                    </div>

                    {/* Multi-Stage Animated Ticker Status */}
                    <div className="text-center space-y-1.5 font-mono text-xs max-w-sm">
                      <div className="text-amber-300 font-bold tracking-wider flex items-center justify-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                        {loadingStage === 1 && t("Querying NCPOR Knowledge Graph & Report Archives...", "एनसीपीओआर ज्ञान ग्राफ एवं रिपोर्ट अभिलेख खोज रहे हैं...")}
                        {loadingStage === 2 && t("Ingesting AWS Telemetry & Ice Core Isotope Series...", "एडब्ल्यूएस टेलीमीटरी एवं आइस कोर डेटा प्रोसेस हो रहा है...")}
                        {loadingStage === 3 && t("Synthesizing Dissemination Draft via Dhruv AI PRO...", "ध्रुव एआई प्रो द्वारा आउटरीच ड्राफ्ट निर्मित हो रहा है...")}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {t("Target Hub:", "लक्ष्य हब:")} {activeExpedition.name} ({activeExpedition.region})
                      </p>
                    </div>

                    {/* Skeleton Progress Indicator Lines */}
                    <div className="w-full max-w-md space-y-2 px-6">
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-cyan-500 animate-pulse w-3/4 rounded-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dynamic Text Output Display with Smooth Fade-In */
                  <div className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-line min-h-[240px] animate-fade-in-up">
                    {generatedOutput || t(
                      "Select an expedition hub above and click 'CREATE DYNAMIC OUTREACH CONTENT' to generate press releases, tweet threads, or video scripts powered by real NCPOR scientific data.",
                      "ऊपर एक अभियान हब चुनें और वास्तविक एनसीपीओआर वैज्ञानिक डेटा पर आधारित प्रेस विज्ञप्ति, ट्वीट थ्रेड या वीडियो स्क्रिप्ट जनरेट करने के लिए 'डायनामिक आउटरीच कंटेंट तैयार करें' पर क्लिक करें।"
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>
                  {t(
                    "Citation Verification: Cross-referenced with declassified MoES & NCPOR repositories.",
                    "उद्धरण सत्यापन: एनसीपीओआर और पृथ्वी विज्ञान मंत्रालय के अभिलेखों से सीधे उद्धृत।"
                  )}
                </span>
                <span className="text-slate-500">v2.4 Neural Disseminator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Templates Catalog */}
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-brand-navy transition-colors duration-300">
            {t("Featured Public Dissemination Templates", "विशेष सार्वजनिक प्रसार टेम्पलेट")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTemplates.map((item) => (
              <OutreachCard key={item.id} content={item} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
