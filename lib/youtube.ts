export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
}

export interface YouTubeFetchResult {
  title: string;
  description: string;
  videos: YouTubeVideo[];
}

function extractPlaylistId(url: string): string | null {
  const m = url.match(/[?&]list=([^&]+)/);
  return m ? m[1] : null;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseISODuration(d: string): number {
  const m = d.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!m) return 0;
  return (parseInt(m[1]?.replace('H', '') || '0') * 3600) +
    (parseInt(m[2]?.replace('M', '') || '0') * 60) +
    (parseInt(m[3]?.replace('S', '') || '0'));
}

async function getVideoDetails(videoId: string): Promise<{ duration: number; description: string }> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bot)' },
    });
    const html = await res.text();
    const match = html.match(/ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/);
    if (!match) return { duration: 0, description: '' };
    const data = JSON.parse(match[1]);
    const result = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents || [];
    const desc = '';
    let duration = 0;
    for (const item of result) {
      const dur = item?.videoPrimaryInfoRenderer?.lengthText?.runs?.[0]?.text;
      if (dur) {
        const parts = dur.split(':').map(Number);
        if (parts.length === 3) duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) duration = parts[0] * 60 + parts[1];
      }
    }
    return { duration, description: desc };
  } catch {
    return { duration: 0, description: '' };
  }
}

async function fetchPlaylistRSS(playlistId: string): Promise<YouTubeVideo[]> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`);
  if (!res.ok) throw new Error('Failed to fetch playlist');
  const xml = await res.text();
  const videos: YouTubeVideo[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let entryMatch;
  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const entry = entryMatch[1];
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title[^>]*>([^<]+)<\/title>/)?.[1];
    if (videoId && title) {
      videos.push({
        videoId,
        title: title.trim(),
        description: '',
        duration: 0,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      });
    }
  }
  return videos;
}

export async function fetchFromUrl(url: string): Promise<YouTubeFetchResult> {
  const playlistId = extractPlaylistId(url);
  if (playlistId) {
    const videos = await fetchPlaylistRSS(playlistId);
    const details = await Promise.all(videos.map(v => getVideoDetails(v.videoId)));
    videos.forEach((v, i) => {
      v.duration = details[i].duration;
      v.description = details[i].description;
    });
    return {
      title: videos[0]?.title || 'Untitled Playlist',
      description: '',
      videos,
    };
  }

  const videoId = extractVideoId(url);
  if (!videoId) throw new Error('Invalid YouTube URL');

  let title = 'Untitled';
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const oembed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (oembed.ok) {
      const data = await oembed.json();
      title = data.title || title;
      thumbnail = data.thumbnail_url || thumbnail;
    }
  } catch {}

  const details = await getVideoDetails(videoId);
  return {
    title,
    description: details.description,
    videos: [{
      videoId,
      title,
      description: details.description,
      duration: details.duration,
      thumbnail,
    }],
  };
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
