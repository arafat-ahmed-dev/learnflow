import { NextResponse } from "next/server";

interface VideoInfo {
  videoId: string;
  title: string;
  durationSeconds: number;
  thumbnailUrl: string;
  position: number;
}

interface PlaylistInfo {
  playlistId: string;
  title: string;
  videos: VideoInfo[];
  totalDurationSeconds: number;
}

// Parse duration string like "10:30" or "1:30:45" to seconds
function parseDuration(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

async function fetchAllPlaylistVideos(
  playlistId: string
): Promise<PlaylistInfo> {
  const videos: VideoInfo[] = [];
  let playlistTitle = "Untitled Playlist";
  let continuationToken: string | null = null;
  let apiKey = "";
  let visitorData = "";

  // Step 1: Fetch initial page to get API key and first batch of videos
  const initialResponse = await fetch(
    `https://www.youtube.com/playlist?list=${playlistId}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      cache: "no-store", // Force fresh data, no caching
    }
  );

  if (!initialResponse.ok) {
    throw new Error("Failed to fetch playlist page");
  }

  const html = await initialResponse.text();

  // Extract API key
  const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  if (apiKeyMatch) {
    apiKey = apiKeyMatch[1];
  }

  // Extract visitor data for authentication
  const visitorDataMatch = html.match(/"visitorData":"([^"]+)"/);
  if (visitorDataMatch) {
    visitorData = visitorDataMatch[1];
  }

  // Extract initial data
  const ytInitialDataMatch = html.match(
    /var ytInitialData = ({.+?});<\/script>/
  );
  if (!ytInitialDataMatch) {
    throw new Error("Could not parse playlist data");
  }

  const ytData = JSON.parse(ytInitialDataMatch[1]);

  // Get playlist title
  playlistTitle =
    ytData?.metadata?.playlistMetadataRenderer?.title ||
    ytData?.header?.playlistHeaderRenderer?.title?.simpleText ||
    "Untitled Playlist";

  // Get playlist content
  const playlistContent =
    ytData?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer
      ?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer
      ?.contents?.[0]?.playlistVideoListRenderer?.contents;

  if (!playlistContent) {
    throw new Error("Could not find playlist videos");
  }

  // Process initial videos
  for (const item of playlistContent) {
    if (item?.playlistVideoRenderer) {
      const video = item.playlistVideoRenderer;

      // Skip unavailable videos
      if (video.isPlayable === false) {
        console.log(
          `[v0] Skipping unavailable video: ${
            video.title?.runs?.[0]?.text || "Unknown"
          }`
        );
        continue;
      }

      const videoId = video.videoId;
      const title = video.title?.runs?.[0]?.text || "Untitled";
      const durationText =
        video.lengthText?.simpleText ||
        video.lengthText?.accessibility?.accessibilityData?.label ||
        "0:00";

      // Parse duration - handle both "10:30" format and "10 minutes, 30 seconds" format
      let durationSeconds = 0;
      if (durationText.includes(":")) {
        durationSeconds = parseDuration(durationText);
      } else {
        // Parse accessibility label like "10 minutes, 30 seconds"
        const hourMatch = durationText.match(/(\d+)\s*hour/);
        const minMatch = durationText.match(/(\d+)\s*minute/);
        const secMatch = durationText.match(/(\d+)\s*second/);
        durationSeconds =
          (hourMatch ? Number.parseInt(hourMatch[1]) * 3600 : 0) +
          (minMatch ? Number.parseInt(minMatch[1]) * 60 : 0) +
          (secMatch ? Number.parseInt(secMatch[1]) : 0);
      }

      // Get best thumbnail
      const thumbnails = video.thumbnail?.thumbnails || [];
      const thumbnailUrl =
        thumbnails[thumbnails.length - 1]?.url ||
        `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

      videos.push({
        videoId,
        title,
        durationSeconds,
        thumbnailUrl: thumbnailUrl.startsWith("//")
          ? `https:${thumbnailUrl}`
          : thumbnailUrl,
        position: videos.length + 1,
      });
    } else if (item?.continuationItemRenderer) {
      continuationToken =
        item.continuationItemRenderer.continuationEndpoint?.continuationCommand
          ?.token || null;
    }
  }

  // Step 2: Fetch remaining videos using continuation tokens
  let pageCount = 0;
  const maxPages = 100; // Increased limit (100 pages * ~100 videos = 10000 videos max)

  while (continuationToken && pageCount < maxPages) {
    pageCount++;

    console.log(
      `[v0] Fetching page ${pageCount + 1}, current video count: ${
        videos.length
      }`
    );

    try {
      const continueResponse = await fetch(
        `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}&prettyPrint=false`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "X-Youtube-Client-Name": "1",
            "X-Youtube-Client-Version": "2.20231219.04.00",
            Origin: "https://www.youtube.com",
            Referer: `https://www.youtube.com/playlist?list=${playlistId}`,
          },
          body: JSON.stringify({
            context: {
              client: {
                hl: "en",
                gl: "US",
                clientName: "WEB",
                clientVersion: "2.20231219.04.00",
                visitorData: visitorData,
              },
            },
            continuation: continuationToken,
          }),
          cache: "no-store",
        }
      );

      if (!continueResponse.ok) {
        console.log(
          `[v0] Continuation request failed with status ${continueResponse.status}`
        );
        break;
      }

      const continueData = await continueResponse.json();
      const continuationContents =
        continueData?.onResponseReceivedActions?.[0]
          ?.appendContinuationItemsAction?.continuationItems || [];

      if (continuationContents.length === 0) {
        console.log(`[v0] No more continuation items found`);
        break;
      }

      let foundVideos = false;
      continuationToken = null; // Reset token

      for (const item of continuationContents) {
        if (item?.playlistVideoRenderer) {
          foundVideos = true;
          const video = item.playlistVideoRenderer;

          // Skip unavailable videos
          if (video.isPlayable === false) {
            console.log(
              `[v0] Skipping unavailable video: ${
                video.title?.runs?.[0]?.text || "Unknown"
              }`
            );
            continue;
          }

          const videoId = video.videoId;
          const title = video.title?.runs?.[0]?.text || "Untitled";
          const durationText =
            video.lengthText?.simpleText ||
            video.lengthText?.accessibility?.accessibilityData?.label ||
            "0:00";

          let durationSeconds = 0;
          if (durationText.includes(":")) {
            durationSeconds = parseDuration(durationText);
          } else {
            const hourMatch = durationText.match(/(\d+)\s*hour/);
            const minMatch = durationText.match(/(\d+)\s*minute/);
            const secMatch = durationText.match(/(\d+)\s*second/);
            durationSeconds =
              (hourMatch ? Number.parseInt(hourMatch[1]) * 3600 : 0) +
              (minMatch ? Number.parseInt(minMatch[1]) * 60 : 0) +
              (secMatch ? Number.parseInt(secMatch[1]) : 0);
          }

          const thumbnails = video.thumbnail?.thumbnails || [];
          const thumbnailUrl =
            thumbnails[thumbnails.length - 1]?.url ||
            `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

          videos.push({
            videoId,
            title,
            durationSeconds,
            thumbnailUrl: thumbnailUrl.startsWith("//")
              ? `https:${thumbnailUrl}`
              : thumbnailUrl,
            position: videos.length + 1,
          });
        } else if (item?.continuationItemRenderer) {
          continuationToken =
            item.continuationItemRenderer.continuationEndpoint
              ?.continuationCommand?.token || null;
        }
      }

      if (!foundVideos) {
        console.log(`[v0] No videos found in continuation, stopping`);
        break;
      }
    } catch (err) {
      console.error(`[v0] Error fetching continuation:`, err);
      break;
    }
  }

  console.log(`[v0] Total videos fetched: ${videos.length}`);
  console.log(`[v0] Fetched ${pageCount + 1} pages total`);

  // Calculate total duration
  const totalDurationSeconds = videos.reduce(
    (sum, v) => sum + v.durationSeconds,
    0
  );

  // Log detailed stats
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  console.log(
    `[v0] Total duration: ${totalHours}h ${totalMinutes}m (${totalDurationSeconds} seconds)`
  );

  return {
    playlistId,
    title: playlistTitle,
    videos,
    totalDurationSeconds,
  };
}

export async function POST(req: Request) {
  try {
    const { playlistId } = await req.json();

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID is required" },
        { status: 400 }
      );
    }

    console.log(`[v0] Fetching playlist: ${playlistId}`);

    const playlist = await fetchAllPlaylistVideos(playlistId);

    const hours = Math.floor(playlist.totalDurationSeconds / 3600);
    const minutes = Math.floor((playlist.totalDurationSeconds % 3600) / 60);

    console.log(
      `[v0] Playlist "${playlist.title}" - ${playlist.videos.length} videos, ${hours}h ${minutes}m (${playlist.totalDurationSeconds}s total)`
    );

    return NextResponse.json(playlist);
  } catch (error) {
    console.error("[v0] Error fetching playlist:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch playlist information",
      },
      { status: 500 }
    );
  }
}
