import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { motion } from "motion/react";

export default function DeveloperLogin({ lang }: { lang: "en" | "ar" }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem("devToken", data.token);
        navigate("/developer-dashboard");
      } else {
        setError(lang === "en" ? "Invalid password" : "كلمة مرور خاطئة");
      }
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card rounded-3xl p-8 outline outline-1 outline-slate-200 dark:outline-slate-800"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-brand-blue" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            {lang === "en" ? "Developer Access" : "دخول المطور"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {lang === "en" ? "Authorized personnel only" : "للمصرح لهم فقط"}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === "en" ? "Enter Access Code" : "الرقم السري"}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-blue outline-none text-center tracking-widest text-lg font-mono placeholder:text-base placeholder:tracking-normal"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "..." : lang === "en" ? "Unlock Dashboard" : "دخول للوحة التحكم"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
