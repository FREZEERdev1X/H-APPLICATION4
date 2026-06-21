import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Application } from "../types";
import { Download, Star, Calendar, HardDrive, Info, AlertCircle, ChevronLeft } from "lucide-react";

export default function AppDetails({ lang }: { lang: "en" | "ar" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentName, setCommentName] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApp();
  }, [id]);

  const fetchApp = async () => {
    try {
      const res = await fetch(`/api/apps/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setApp(data);
    } catch (e) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!app) return;
    // trigger download by opening apkUrl
    const link = document.createElement("a");
    link.href = app.apkUrl;
    link.download = `${app.name}-${app.version}.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Call increment API
    setApp({ ...app, downloadCount: app.downloadCount + 1 });
    await fetch(`/api/apps/${id}/download`, { method: "POST" });
  };

  const submitComment = async (e: any) => {
    e.preventDefault();
    if (!commentName || !commentContent) return;
    setSubmitting(true);
    try {
      await fetch(`/api/apps/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: commentName, content: commentContent, rating: commentRating })
      });
      setCommentName("");
      setCommentContent("");
      setCommentRating(5);
      fetchApp(); // Refresh
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button 
        onClick={() => navigate("/")}
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
        {lang === "en" ? "Back to Store" : "العودة للمتجر"}
      </button>

      {/* Header Section */}
      <div className="glass-card rounded-3xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
        <img 
          src={app.iconUrl} 
          alt={app.name} 
          className="w-32 h-32 md:w-48 md:h-48 rounded-3xl object-cover shadow-2xl border-4 border-white dark:border-slate-800"
        />
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            {app.name}
          </h1>
          <p className="text-xl text-brand-blue dark:text-brand-purple font-medium">
            {app.developerName}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold">{app.averageRating ? app.averageRating.toFixed(1) : "New"}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
              <Download className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="font-medium">{app.downloadCount > 1000 ? (app.downloadCount/1000).toFixed(1) + 'k+' : app.downloadCount}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
              <HardDrive className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="font-medium">{app.size}</span>
            </div>
            <div className="text-xs font-semibold px-4 py-2 rounded-xl bg-brand-blue/10 text-brand-blue dark:bg-brand-purple/20 dark:text-brand-purple uppercase flex items-center">
              {app.category}
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleDownload}
              className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-blue/90 hover:to-brand-purple/90 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-blue/30 transform transition-all active:scale-95 flex justify-center items-center gap-3"
            >
              <Download className="w-6 h-6" />
              {lang === "en" ? "Download APK" : "تحميل التطبيق"}
            </button>
          </div>
        </div>
      </div>

      {/* Screenshots */}
      {app.screenshots && app.screenshots.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">{lang === "en" ? "Screenshots" : "لقطات الشاشة"}</h2>
          <div className="flex overflow-x-auto gap-4 pb-6 hide-scrollbar snap-x">
            {app.screenshots.map(s => (
              <img 
                key={s.id} 
                src={s.url} 
                alt="Screenshot" 
                className="h-72 md:h-96 rounded-2xl object-cover shadow-md snap-center shrink-0 border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
        {/* About App */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">{lang === "en" ? "About this app" : "عن التطبيق"}</h2>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {app.description}
            </div>
          </section>

          <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6">{lang === "en" ? "Ratings and Reviews" : "التقييمات والمراجعات"}</h2>
            
            <form onSubmit={submitComment} className="glass border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-8 space-y-4">
              <h3 className="font-semibold">{lang === "en" ? "Leave a review" : "اترك مراجعة"}</h3>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(num => (
                  <button type="button" key={num} onClick={() => setCommentRating(num)}>
                    <Star className={`w-8 h-8 transition-colors ${commentRating >= num ? "text-yellow-500 fill-yellow-500" : "text-slate-300 dark:text-slate-600"}`} />
                  </button>
                ))}
              </div>
              <input 
                type="text" 
                required
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                placeholder={lang === "en" ? "Your Name" : "اسمك"}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-blue outline-none"
              />
              <textarea 
                required
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                placeholder={lang === "en" ? "Describe your experience..." : "صف تجربتك..."}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {lang === "en" ? "Submit Review" : "إرسال التقييم"}
              </button>
            </form>

            <div className="space-y-6">
              {app.comments && app.comments.length > 0 ? app.comments.map(c => (
                <div key={c.id} className="border-b border-slate-200 dark:border-slate-800 pb-6 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      {c.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{c.userName}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(num => (
                            <Star key={num} className={`w-3 h-3 ${c.rating >= num ? "text-yellow-500 fill-yellow-500" : "text-slate-300 dark:text-slate-700"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 pl-13">{c.content}</p>
                </div>
              )) : (
                <div className="text-center py-10 text-slate-500">
                  {lang === "en" ? "No reviews yet. Be the first!" : "لا توجد مراجعات بعد. كن الأول!"}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <Info className="w-5 h-5" />
                {lang === "en" ? "Information" : "معلومات"}
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{lang === "en" ? "Version" : "الإصدار"}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{app.version}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{lang === "en" ? "Updated on" : "تاريخ التحديث"}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{new Date(app.updateDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{lang === "en" ? "Downloads" : "التحميلات"}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{app.downloadCount}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">{lang === "en" ? "Category" : "الفئة"}</span>
                  <span className="font-medium text-brand-blue dark:text-brand-purple">{app.category}</span>
                </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
