import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Application, CATEGORIES } from "../types";
import { LogOut, UploadCloud, Trash2, Edit2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function DeveloperDashboard({ lang }: { lang: "en" | "ar" }) {
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload Form State
  const [name, setName] = useState("");
  const [developerName, setDeveloperName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<FileList | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const token = localStorage.getItem("devToken");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchApps();
  }, [navigate, token]);

  const fetchApps = async () => {
    try {
      const res = await fetch("/api/apps");
      const data = await res.json();
      setApps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("devToken");
    navigate("/");
  };

  const handleDelete = async (id: number) => {
    if (!confirm(lang === "en" ? "Are you sure you want to delete this app?" : "هل أنت متأكد من الحذف؟")) return;
    try {
      await fetch(`/api/admin/apps/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchApps();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iconFile || !apkFile) {
      setMessage({ type: "error", text: "Icon and APK files are required." });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("name", name);
    formData.append("developerName", developerName);
    formData.append("description", description);
    formData.append("version", version);
    formData.append("category", category);
    formData.append("isFeatured", isFeatured.toString());
    formData.append("icon", iconFile);
    formData.append("apk", apkFile);
    
    if (screenshotFiles) {
      for (let i = 0; i < screenshotFiles.length; i++) {
        formData.append("screenshots", screenshotFiles[i]);
      }
    }

    try {
      const res = await fetch("/api/admin/apps", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: "success", text: lang === "en" ? "App uploaded successfully!" : "تم رفع التطبيق بنجاح!" });
        // Reset form
        setName("");
        setDeveloperName("");
        setDescription("");
        setVersion("");
        setIconFile(null);
        setApkFile(null);
        setScreenshotFiles(null);
        setIsFeatured(false);
        // Refresh list
        fetchApps();
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed." });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Server error occurred." });
    } finally {
      setUploading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8 bg-slate-900 text-white p-6 rounded-2xl">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {lang === "en" ? "Developer Dashboard" : "لوحة تحكم المطور"}
        </h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          {lang === "en" ? "Logout" : "تسجيل خروج"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-brand-blue" />
              {lang === "en" ? "Upload New App" : "رفع تطبيق جديد"}
            </h2>

            {message.text && (
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-2 ${message.type === "error" ? "bg-red-50 text-red-600 dark:bg-red-900/20" : "bg-green-50 text-green-600 dark:bg-green-900/20"}`}>
                {message.type === "error" ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{lang === "en" ? "App Name *" : "اسم التطبيق *"}</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{lang === "en" ? "Developer Name *" : "اسم المطور *"}</label>
                <input required type="text" value={developerName} onChange={e=>setDeveloperName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{lang === "en" ? "Category *" : "الفئة *"}</label>
                <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{lang === "en" ? "Version *" : "الإصدار *"}</label>
                <input required type="text" value={version} onChange={e=>setVersion(e.target.value)} placeholder="1.0.0" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{lang === "en" ? "Description *" : "الوصف *"}</label>
                <textarea required rows={4} value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 resize-none"></textarea>
              </div>
              
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{lang === "en" ? "App Icon (PNG/JPG) *" : "أيقونة التطبيق *"}</label>
                <input required type="file" accept="image/*" onChange={e => setIconFile(e.target.files?.[0] || null)} className="w-full block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{lang === "en" ? "APK File *" : "ملف APK *"}</label>
                <input required type="file" accept=".apk" onChange={e => setApkFile(e.target.files?.[0] || null)} className="w-full block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-purple/10 file:text-brand-purple hover:file:bg-brand-purple/20" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{lang === "en" ? "Screenshots (Up to 5)" : "لقطات ชاشة"}</label>
                <input type="file" accept="image/*" multiple onChange={e => setScreenshotFiles(e.target.files)} className="w-full block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:hover:file:bg-slate-700" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="feature" checked={isFeatured} onChange={e=>setIsFeatured(e.target.checked)} className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue" />
                <label htmlFor="feature" className="text-sm font-medium">{lang === "en" ? "Feature on Homepage" : "مميز في الصفحة الرئيسية"}</label>
              </div>

              <button disabled={uploading} type="submit" className="w-full mt-4 py-4 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
                {uploading ? (lang === "en" ? "Uploading..." : "جاري الرفع...") : (lang === "en" ? "Upload Application" : "رفع التطبيق")}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Apps List */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">{lang === "en" ? "Manage Applications" : "إدارة التطبيقات"}</h2>
            {loading ? (
              <div className="flex justify-center p-10"><div className="animate-spin w-8 h-8 border-4 border-slate-300 border-t-brand-blue rounded-full"></div></div>
            ) : apps.length === 0 ? (
              <div className="text-center p-10 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                {lang === "en" ? "No applications uploaded yet." : "لا توجد تطبيقات."}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {apps.map(app => (
                  <div key={app.id} className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <img src={app.iconUrl} alt="icon" className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 text-center sm:text-left rtl:sm:text-right">
                      <h3 className="font-bold">{app.name}</h3>
                      <p className="text-xs text-slate-500">{app.category} • v{app.version} • {app.downloadCount} dl</p>
                      {app.isFeatured === 1 && <span className="inline-block mt-1 text-[10px] uppercase font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Featured</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(app.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
