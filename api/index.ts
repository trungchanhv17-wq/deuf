import express from "express";
import path from "path";
import { YoutubeTranscript } from "youtube-transcript";
import { getSubtitles } from "youtube-captions-scraper";

const app = express();
app.use(express.json());

// API route to get YouTube transcript
app.get("/api/transcript", async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: "Missing video URL" });
  }

  try {
    const extractVideoId = (url: string) => {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : url;
    };
    
    const videoId = extractVideoId(url);
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      return res.json(transcript);
    } catch (firstError) {
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
      throw lastError || new Error("No subtitles found");
    }
  } catch (error: any) {
    res.status(500).json({ error: "Không thể tải phụ đề.", details: error.message });
  }
});

// For Vercel, we don't need a catch-all route here if we configure vercel.json correctly
// to serve the static dist folder for other routes.

export default app;
