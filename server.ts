import express from "express";
import path from "path";
import fs from "fs";

import multer from "multer";
import jwt from "jsonwebtoken";
import cors from "cors";
import { eq, desc, name } from "drizzle-orm";
import { db } from "./src/db";
import { applications, comments, screenshots } from "./src/db/schema";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_H12M_KEY";
const DEV_PASSWORD = "H12M";

// Ensure upload directory exists
const uploadDir = process.env.NODE_ENV === "production" ? "/tmp/uploads" : path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function extractFileSize(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    const megaBytes = stats.size / (1024 * 1024);
    return megaBytes.toFixed(2) + " MB";
  } catch (e) {
    return "Unknown";
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  
  // Serve static uploads
  app.use("/uploads", express.static(uploadDir));

  // API: Developer Login
  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    if (password === DEV_PASSWORD) {
      const token = jwt.sign({ role: "developer" }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  // API: Get all applications
  app.get("/api/apps", async (req, res) => {
    const { category, search, featured, trending, latest } = req.query;
    try {
      let queryLogs = await db.select().from(applications).orderBy(desc(applications.updateDate)).execute();
      
      if (category) {
        queryLogs = queryLogs.filter(a => a.category === category);
      }
      if (search) {
        const s = (search as string).toLowerCase();
        queryLogs = queryLogs.filter(a => a.name.toLowerCase().includes(s) || a.developerName.toLowerCase().includes(s));
      }
      if (featured === "true") {
        queryLogs = queryLogs.filter(a => a.isFeatured === 1);
      }
      if (latest === "true") {
        queryLogs = queryLogs.slice(0, 10);
      }
      if (trending === "true") {
        queryLogs = [...queryLogs].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 10);
      }
      
      res.json(queryLogs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch apps" });
    }
  });

  // API: Get single application by ID
  app.get("/api/apps/:id", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const appResult = await db.select().from(applications).where(eq(applications.id, appId)).limit(1).execute();
      if (appResult.length === 0) return res.status(404).json({ error: "App not found" });

      const screenshotsResult = await db.select().from(screenshots).where(eq(screenshots.appId, appId)).execute();
      const commentsResult = await db.select().from(comments).where(eq(comments.appId, appId)).orderBy(desc(comments.id)).execute();

      // Calculate average rating
      let avgRating = 0;
      if (commentsResult.length > 0) {
        const sum = commentsResult.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = sum / commentsResult.length;
      }

      res.json({
        ...appResult[0],
        screenshots: screenshotsResult,
        comments: commentsResult,
        averageRating: avgRating,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch app details" });
    }
  });

  // API: Increment download count
  app.post("/api/apps/:id/download", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const appResult = await db.select().from(applications).where(eq(applications.id, appId)).limit(1).execute();
      
      if (appResult.length > 0) {
        const newCount = appResult[0].downloadCount + 1;
        await db.update(applications).set({ downloadCount: newCount }).where(eq(applications.id, appId)).execute();
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Error updating download stats" });
    }
  });

  // API: Add comment
  app.post("/api/apps/:id/comments", async (req, res) => {
    try {
      const appId = parseInt(req.params.id);
      const { userName, content, rating } = req.body;
      
      if (!userName || !content || typeof rating !== 'number') {
        return res.status(400).json({ error: "Invalid comment data" });
      }

      await db.insert(comments).values({
        appId,
        userName,
        content,
        rating,
        createdAt: new Date().toISOString()
      }).execute();
      
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  // API: Developer Upload App
  app.post("/api/admin/apps", authenticateToken, upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'apk', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 }
  ]), async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { name, developerName, description, version, category, isFeatured } = req.body;

      if (!files.icon || !files.apk) {
         res.status(400).json({ error: "Icon and APK are required" });
         return;
      }

      const iconUrl = "/uploads/" + files.icon[0].filename;
      const apkUrl = "/uploads/" + files.apk[0].filename;
      const size = extractFileSize(files.apk[0].path);

      const result = await db.insert(applications).values({
        name,
        developerName,
        description,
        version,
        size,
        updateDate: new Date().toISOString(),
        category,
        iconUrl,
        apkUrl,
        isFeatured: isFeatured === "true" ? 1 : 0,
      }).returning({ insertedId: applications.id }).execute();

      const newAppId = result[0].insertedId;

      if (files.screenshots && files.screenshots.length > 0) {
        const screenshotInsertData = files.screenshots.map(file => ({
          appId: newAppId,
          url: "/uploads/" + file.filename
        }));
        await db.insert(screenshots).values(screenshotInsertData).execute();
      }

      res.status(201).json({ success: true, appId: newAppId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to upload app" });
    }
  });

  // API: Developer Edit App
  app.put("/api/admin/apps/:id", authenticateToken, upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'apk', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 }
  ]), async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const appId = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const { name, developerName, description, version, category, isFeatured } = req.body;

      const appData = await db.select().from(applications).where(eq(applications.id, appId)).limit(1).execute();
      if (appData.length === 0) { res.status(404).json({ error: "App not found" }); return; }

      const updateData: any = {
        name,
        developerName,
        description,
        version,
        category,
        isFeatured: isFeatured === "true" || isFeatured === 1 ? 1 : 0,
        updateDate: new Date().toISOString(), // Update date on edit
      };

      if (files?.icon) {
        updateData.iconUrl = "/uploads/" + files.icon[0].filename;
      }
      if (files?.apk) {
        updateData.apkUrl = "/uploads/" + files.apk[0].filename;
        updateData.size = extractFileSize(files.apk[0].path);
      }

      await db.update(applications).set(updateData).where(eq(applications.id, appId)).execute();

      // Only adding new screenshots for simplicity, or we can just append
      if (files?.screenshots && files?.screenshots.length > 0) {
        const screenshotInsertData = files.screenshots.map(file => ({
          appId,
          url: "/uploads/" + file.filename
        }));
        await db.insert(screenshots).values(screenshotInsertData).execute();
      }

      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to edit app" });
    }
  });

  // API: Developer Delete App
  app.delete("/api/admin/apps/:id", authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const appId = parseInt(req.params.id);
      await db.delete(applications).where(eq(applications.id, appId)).execute();
      // sqlite CASCADE will handle deleting screenshots and comments
      // Ideally we would also delete files from disk but skipped for simplicity
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete app" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
