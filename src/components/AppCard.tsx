import { Link } from "react-router-dom";
import { Application } from "../types";
import { Star, Download } from "lucide-react";
import React from "react";

const AppCard: React.FC<{ app: Application; lang: "en" | "ar" }> = ({ app, lang }) => {
  return (
    <Link to={`/app/${app.id}`} className="group block">
      <div className="glass-card rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-brand-blue/30 overflow-hidden relative">
        <div className="flex gap-4 items-start">
          <img 
            src={app.iconUrl} 
            alt={app.name} 
            className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:shadow-lg transition-all"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate text-slate-900 dark:text-white">
              {app.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {app.developerName}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {app.averageRating ? app.averageRating.toFixed(1) : "New"}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-brand-blue dark:text-brand-purple">
                <Download className="w-3 h-3" />
                {app.downloadCount > 1000 ? (app.downloadCount/1000).toFixed(1) + 'k' : app.downloadCount}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-1">
            {app.category}
          </span>
          <span className="text-xs text-slate-400">{app.size}</span>
        </div>
      </div>
    </Link>
  );
};

export default AppCard;
