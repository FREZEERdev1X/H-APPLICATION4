import { Link } from "react-router-dom";
import { Moon, Sun, Languages, Search, Menu } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function Navbar({ darkMode, toggleDarkMode, lang, toggleLang }: any) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand-purple/20">
                H
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block theme-gradient-text">
                H APPLICATION
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleLang}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={lang === "en" ? "Switch to Arabic" : "التغيير للإنجليزية"}
            >
              <div className="flex items-center gap-1">
                <Languages className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  {lang === "en" ? "AR" : "EN"}
                </span>
              </div>
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
