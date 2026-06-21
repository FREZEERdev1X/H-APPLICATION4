import { useEffect, useState } from "react";
import { Search, Star } from "lucide-react";
import { Application, CATEGORIES } from "../types";
import AppCard from "../components/AppCard";
import { motion, AnimatePresence } from "motion/react";

export default function Home({ lang }: { lang: "en" | "ar" }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, [activeCategory, searchQuery]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      let url = "/api/apps?";
      if (activeCategory !== "All") url += `category=${encodeURIComponent(activeCategory)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      
      const res = await fetch(url);
      const data = await res.json();
      setApps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredList = (list: Application[], filterType: "featured" | "trending" | "latest") => {
    if (filterType === "featured") return list.filter(a => a.isFeatured === 1);
    if (filterType === "trending") return [...list].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 8);
    if (filterType === "latest") return [...list].sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime()).slice(0, 10);
    return list;
  };

  const featuredApps = getFilteredList(apps, "featured");
  const trendingApps = getFilteredList(apps, "trending");
  const latestApps = getFilteredList(apps, "latest");

  // If there's an active category or search query, we show a flat list instead of sections
  const showFlatList = activeCategory !== "All" || searchQuery.trim() !== "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Hero Search Section */}
      <section className="text-center space-y-6 pt-12 pb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black theme-gradient-text"
        >
          {lang === "en" ? "Discover Amazing Apps" : "اكتشف تطبيقات مذهلة"}
        </motion.h1>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand-purple transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 rounded-full glass-input transition-all text-lg placeholder:text-slate-400"
              placeholder={lang === "en" ? "Search applications and games..." : "ابحث عن تطبيقات، ألعاب..."}
            />
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-purple">
            {lang === "en" ? "Categories" : "الفئات"}
          </h2>
          <div className="flex gap-2">
            <div className="w-8 h-1 bg-brand-purple rounded-full"></div>
            <div className="w-2 h-1 bg-slate-300 dark:bg-white/20 rounded-full"></div>
            <div className="w-2 h-1 bg-slate-300 dark:bg-white/20 rounded-full"></div>
          </div>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar">
          <button
            onClick={() => setActiveCategory("All")}
            className={`flex-shrink-0 px-6 py-2.5 rounded-full font-medium transition-all ${
              activeCategory === "All" 
                ? "bg-brand-purple/20 border border-brand-purple/50 text-brand-purple cursor-pointer" 
                : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
            }`}
          >
            {lang === "en" ? "All" : "الكل"}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full font-medium transition-all ${
                activeCategory === cat 
                  ? "bg-brand-purple/20 border border-brand-purple/50 text-brand-purple cursor-pointer" 
                  : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full"></div>
        </div>
      ) : showFlatList ? (
        <section>
          <h2 className="text-2xl font-bold mb-6">{lang === "en" ? "Search Results" : "نتائج البحث"}</h2>
          {apps.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              {lang === "en" ? "No applications found." : "لم يتم العثور على تطبيقات."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {apps.map(app => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                  >
                    <AppCard app={app} lang={lang} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-16">
          {featuredApps.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                {lang === "en" ? "Featured" : "مميز"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredApps.map(app => <AppCard key={app.id} app={app} lang={lang} />)}
              </div>
            </section>
          )}

          {trendingApps.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-brand-purple rounded-full"></span>
                {lang === "en" ? "Trending Now" : "الأكثر رواجاً"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trendingApps.map(app => <AppCard key={app.id} app={app} lang={lang} />)}
              </div>
            </section>
          )}

          {latestApps.length > 0 && (
             <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-brand-blue rounded-full"></span>
                {lang === "en" ? "Latest Uploads" : "أحدث الإضافات"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {latestApps.map(app => <AppCard key={app.id} app={app} lang={lang} />)}
              </div>
            </section>
          )}

          {apps.length === 0 && (
             <div className="text-center py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/[0.02]">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400 dark:text-white/20" />
              </div>
              <h3 className="text-gray-500 font-medium mb-1">{lang === "en" ? "No applications found" : "المتجر فارغ"}</h3>
              <p className="text-xs text-gray-600">{lang === "en" ? "Platform is currently empty. Content will appear here once uploaded." : "لم يتم رفع أي تطبيقات بعد."}</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
