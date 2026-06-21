/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AppDetails from "./pages/AppDetails";
import DeveloperLogin from "./pages/DeveloperLogin";
import DeveloperDashboard from "./pages/DeveloperDashboard";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");

  // Load preferences
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    const savedLang = localStorage.getItem("lang") as "en" | "ar";
    if (savedLang) {
      setLang(savedLang);
      document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", (!darkMode).toString());
  };

  const toggleLang = () => {
    const newLang = lang === "en" ? "ar" : "en";
    setLang(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", newLang);
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen flex flex-col font-sans relative ${lang === "ar" ? "rtl" : "ltr"}`}>
        {/* Decorative Background Glows */}
        <div className="fixed -top-24 -left-24 w-96 h-96 bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none z-[-1]" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[150px] pointer-events-none z-[-1]" />

        <Navbar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          lang={lang} 
          toggleLang={toggleLang} 
        />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route path="/app/:id" element={<AppDetails lang={lang} />} />
            <Route path="/developer-login-hidden-h12m" element={<DeveloperLogin lang={lang} />} />
            <Route path="/developer-dashboard" element={<DeveloperDashboard lang={lang} />} />
          </Routes>
        </main>
        
        <footer className="glass mt-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-black/60 backdrop-blur-xl">
          <div className="flex gap-6 text-xs text-slate-500 dark:text-gray-500">
            <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">{lang === "en" ? "About H Application" : "عن التطبيق"}</span>
            <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">{lang === "en" ? "Terms of Service" : "شروط الخدمة"}</span>
            <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">{lang === "en" ? "Privacy Policy" : "سياسة الخصوصية"}</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-slate-400 dark:text-gray-700 tracking-widest uppercase truncate">{lang === "en" ? "Professional APK Distribution" : "توزيع احترافي للتطبيقات"}</p>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-800 hidden sm:block"></div>
            <Link to="/developer-login-hidden-h12m" className="text-[10px] text-slate-300 dark:text-gray-800 hover:text-brand-purple dark:hover:text-gray-400 transition-colors truncate">
              {lang === "en" ? "Developer Console" : "لوحة المطور"}
            </Link>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
