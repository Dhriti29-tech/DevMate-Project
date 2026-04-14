const { extractPlaylistId } = require('./youtubeParser');

const BASE = 'https://www.googleapis.com/youtube/v3';

// Fetch video durations in batches of 50 (YouTube API limit)
async function fetchVideoDurations(videoIds, key) {
  const durations = {};
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      part: 'contentDetails',
      id: batch.join(','),
      key,
    });
    try {
      const res  = await fetch(`${BASE}/videos?${params}`);
      const data = await res.json();
      for (const item of data.items || []) {
        durations[item.id] = iso8601ToSeconds(item.contentDetails?.duration || '');
      }
    } catch { /* non-fatal — leave duration as 0 */ }
  }
  return durations;
}

// Convert ISO 8601 duration (PT4M13S) → seconds
function iso8601ToSeconds(iso) {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  return h * 3600 + m * 60 + s;
}

/**
 * Fetch ALL playlist items via YouTube Data API v3 (handles pagination).
 * Also fetches video durations in a second pass.
 */
async function fetchPlaylistItems(playlistUrlOrId) {
  const playlistId =
    typeof playlistUrlOrId === 'string' && playlistUrlOrId.startsWith('PL')
      ? playlistUrlOrId
      : extractPlaylistId(playlistUrlOrId);

  const key = process.env.YOUTUBE_API_KEY;

  if (!playlistId || !key) {
    console.warn('[YouTube] Missing playlistId or YOUTUBE_API_KEY — returning empty items');
    return { playlistId, items: [] };
  }

  const allItems = [];
  let pageToken  = '';

  // Paginate through all results (each page = up to 50 items)
  do {
    const params = new URLSearchParams({
      part:       'snippet,contentDetails',
      maxResults: '50',
      playlistId,
      key,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res  = await fetch(`${BASE}/playlistItems?${params}`);
    const data = await res.json();

    if (data.error) {
      console.error('[YouTube] API error:', data.error.message);
      return { playlistId, items: [], error: data.error.message };
    }

    for (const item of data.items || []) {
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      if (!videoId) continue;
      allItems.push({
        title:         item.snippet?.title || `Video ${allItems.length + 1}`,
        youtubeVideoId: videoId,
        thumbnail:     item.snippet?.thumbnails?.medium?.url
                    || item.snippet?.thumbnails?.default?.url
                    || '',
        order:         allItems.length,
        duration:      0, // filled in next pass
      });
    }

    pageToken = data.nextPageToken || '';
  } while (pageToken);

  // Second pass — fetch durations for all videos
  if (allItems.length > 0) {
    const videoIds = allItems.map(v => v.youtubeVideoId);
    const durations = await fetchVideoDurations(videoIds, key);
    for (const item of allItems) {
      item.duration = durations[item.youtubeVideoId] || 0;
    }
  }

  console.log(`[YouTube] Fetched ${allItems.length} videos for playlist ${playlistId}`);
  return { playlistId, items: allItems };
}

module.exports = { fetchPlaylistItems };
