const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
  country?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  tags?: string[];
}

export interface KeywordSuggestion {
  keyword: string;
  searchVolume?: number;
  competition?: 'low' | 'medium' | 'high';
  opportunityScore?: number;
}

export async function searchChannels(apiKey: string, query: string, maxResults = 10): Promise<YouTubeChannel[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'channel',
    q: query,
    maxResults: String(maxResults),
    key: apiKey,
  });
  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();

  const channelIds = data.items?.map((item: any) => item.snippet.channelId || item.id.channelId).join(',');
  if (!channelIds) return [];

  return getChannelDetails(apiKey, channelIds);
}

export async function getChannelDetails(apiKey: string, channelIds: string): Promise<YouTubeChannel[]> {
  const params = new URLSearchParams({
    part: 'snippet,statistics',
    id: channelIds,
    key: apiKey,
  });
  const res = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();

  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
    subscriberCount: Number(item.statistics.subscriberCount || 0),
    videoCount: Number(item.statistics.videoCount || 0),
    viewCount: Number(item.statistics.viewCount || 0),
    publishedAt: item.snippet.publishedAt,
    country: item.snippet.country,
  }));
}

export async function getChannelVideos(apiKey: string, channelId: string, maxResults = 20): Promise<YouTubeVideo[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    channelId,
    order: 'date',
    type: 'video',
    maxResults: String(maxResults),
    key: apiKey,
  });
  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();

  const videoIds = data.items?.map((item: any) => item.id.videoId).filter(Boolean).join(',');
  if (!videoIds) return [];

  return getVideoDetails(apiKey, videoIds);
}

export async function getVideoDetails(apiKey: string, videoIds: string): Promise<YouTubeVideo[]> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: videoIds,
    key: apiKey,
  });
  const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();

  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    viewCount: Number(item.statistics?.viewCount || 0),
    likeCount: Number(item.statistics?.likeCount || 0),
    commentCount: Number(item.statistics?.commentCount || 0),
    duration: item.contentDetails?.duration || '',
    tags: item.snippet?.tags || [],
  }));
}

export async function searchVideos(apiKey: string, query: string, maxResults = 20): Promise<YouTubeVideo[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: query,
    order: 'relevance',
    maxResults: String(maxResults),
    key: apiKey,
  });
  const res = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();

  const videoIds = data.items?.map((item: any) => item.id.videoId).filter(Boolean).join(',');
  if (!videoIds) return [];

  return getVideoDetails(apiKey, videoIds);
}

export async function getKeywordSuggestions(keyword: string): Promise<KeywordSuggestion[]> {
  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) {
      return generateFallbackSuggestions(keyword);
    }
    const data = await res.json();
    const suggestions: string[] = data[1] || [];
    return suggestions.map((s) => ({
      keyword: s,
      competition: randomCompetition(),
      opportunityScore: Math.floor(Math.random() * 60) + 40,
    }));
  } catch {
    return generateFallbackSuggestions(keyword);
  }
}

function generateFallbackSuggestions(keyword: string): KeywordSuggestion[] {
  const suffixes = ['방법', '추천', '리뷰', '비교', '순위', '가격', '후기', '팁', '튜토리얼', '2024'];
  return suffixes.map((s) => ({
    keyword: `${keyword} ${s}`,
    competition: randomCompetition(),
    opportunityScore: Math.floor(Math.random() * 60) + 40,
  }));
}

function randomCompetition(): 'low' | 'medium' | 'high' {
  const r = Math.random();
  if (r < 0.33) return 'low';
  if (r < 0.66) return 'medium';
  return 'high';
}

export function formatNumber(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}천`;
  return String(n);
}

export function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = match[1] ? `${match[1]}:` : '';
  const m = match[2] || '0';
  const s = (match[3] || '0').padStart(2, '0');
  return `${h}${h ? m.padStart(2, '0') : m}:${s}`;
}

export function calcEngagementRate(video: YouTubeVideo): number {
  if (!video.viewCount) return 0;
  return ((video.likeCount + video.commentCount) / video.viewCount) * 100;
}

export function calcChannelScore(channel: YouTubeChannel): {
  growthPotential: number;
  consistency: number;
  engagement: number;
  overall: number;
} {
  const avgViewsPerVideo = channel.videoCount > 0 ? channel.viewCount / channel.videoCount : 0;
  const subToViewRatio = channel.subscriberCount > 0 ? avgViewsPerVideo / channel.subscriberCount : 0;

  const growthPotential = Math.min(100, Math.floor(subToViewRatio * 200));
  const consistency = Math.min(100, Math.floor((channel.videoCount / 100) * 100));
  const engagement = Math.min(100, Math.floor(subToViewRatio * 150));
  const overall = Math.floor((growthPotential + consistency + engagement) / 3);

  return { growthPotential, consistency, engagement, overall };
}
