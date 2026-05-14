import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { YoutubeTranscript } from "youtube-transcript";
import { getSubtitles } from "youtube-captions-scraper";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route to get YouTube transcript
  app.get("/api/transcript", async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ error: "Missing video URL" });
    }

    try {
      // Clean video ID extraction
      const extractVideoId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : url;
      };
      
      const videoId = extractVideoId(url);
      console.log(`Fetching transcript for: ${videoId}`);
      
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        return res.json(transcript);
      } catch (firstError) {
        console.warn("YoutubeTranscript failed, trying fallback...", firstError);
        // Fallback to youtube-captions-scraper with multiple language attempts
        const langs = ['de', 'vi', 'en', 'fr'];
        let lastError: any = null;

        for (const lang of langs) {
          try {
            const fallbackTranscript = await getSubtitles({
              videoID: videoId,
              lang: lang
            });

            if (fallbackTranscript && fallbackTranscript.length > 0) {
              const mapped = fallbackTranscript.map((item: any) => ({
                text: item.text,
                duration: parseFloat(item.dur),
                offset: parseFloat(item.start)
              }));
              return res.json(mapped);
            }
          } catch (err: any) {
            lastError = err;
            continue;
          }
        }
        
        // If all languages fail but it was a specific error type
        if (lastError && (lastError.message?.includes('Transcript is disabled') || lastError.message?.includes('Could not find transcript'))) {
          throw lastError;
        }
        throw new Error("Không thể tìm thấy phụ đề trong bất kỳ ngôn ngữ nào (Đức, Việt, Anh).");
      }
    } catch (error: any) {
      console.error("Transcript Error for URL:", url, error);
      
      let errorMessage = "Không thể tải phụ đề cho video này.";
      if (error.message && error.message.includes("Transcript is disabled")) {
        errorMessage = "Video này không có phụ đề công khai. Vui lòng chọn video khác có bật CC.";
      }
      
      res.status(500).json({ 
        error: errorMessage, 
        details: error.message,
        videoId: url 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
