const mongoose = require('mongoose');
const Playlist = require('../models/Playlist');
const Video = require('../models/Video');
const VideoProgress = require('../models/VideoProgress');
const User = require('../models/User');
const UserSkill = require('../models/UserSkill');
const { HttpError } = require('../middleware/errorHandler');

const DEFAULT_LANGUAGE_ORDER = ['HTML', 'CSS', 'JavaScript', 'React', 'Node', 'Express', 'MongoDB'];

// Returns the ordered language list for this user (custom or default)
async function getLanguageOrder(userId) {
  const skill = await UserSkill.findOne({ userId }).lean();
  if (skill?.startMode === 'custom' && Array.isArray(skill?.customLanguages) && skill.customLanguages.length > 0) {
    return skill.customLanguages;
  }
  return DEFAULT_LANGUAGE_ORDER;
}

async function assertPlaylistOwner(playlistId, userId) {
  const playlist = await Playlist.findOne({ _id: playlistId, userId });
  if (!playlist) throw new HttpError(404, 'Playlist not found');
  return playlist;
}

async function listJourneyVideos(req, res, next) {
  try {
    const { playlistId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      next(new HttpError(400, 'Invalid playlist id'));
      return;
    }

    const playlist = await assertPlaylistOwner(playlistId, req.userId);

    const videos = await Video.find({ playlistId }).sort({ order: 1 }).lean();
    const progress = await VideoProgress.find({ userId: req.userId, playlistId }).lean();
    const byVideo = new Map(progress.map((p) => [p.videoId.toString(), p]));

    res.json({
      success: true,
      playlist: {
        id: playlist._id,
        title: playlist.title,
        language: playlist.language || null,
      },
      videos: videos.map((v) => {
        const p = byVideo.get(v._id.toString());
        return {
          id: v._id,
          title: v.title,
          youtubeVideoId: v.youtubeVideoId,
          thumbnail: v.thumbnail,
          order: v.order,
          language: v.language || playlist.language || null,
          unlocked: !!p?.unlocked,
          completed: !!p?.completed,
        };
      }),
    });
  } catch (e) {
    next(e);
  }
}

async function mergePlaylistVideosForUser(playlist, language, userId) {
  const videos = await Video.find({ playlistId: playlist._id }).sort({ order: 1 }).lean();
  const progressRows = await VideoProgress.find({ userId, playlistId: playlist._id }).lean();
  const byVideo = new Map(progressRows.map((p) => [p.videoId.toString(), p]));
  return videos.map((v) => {
    const p = byVideo.get(v._id.toString());
    return {
      id: v._id,
      language: v.language || language,
      title: v.title,
      youtubeVideoId: v.youtubeVideoId,
      thumbnail: v.thumbnail,
      order: v.order,
      unlocked: p ? !!p.unlocked : !!v.unlocked,
      completed: p ? !!p.completed : !!v.completed,
    };
  });
}

async function completeVideo(req, res, next) {
  try {
    const { videoId, userId: bodyUserId } = req.body;
    if (bodyUserId && String(bodyUserId) !== String(req.userId)) {
      next(new HttpError(403, 'userId does not match authenticated user'));
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      next(new HttpError(400, 'Invalid videoId'));
      return;
    }

    const video = await Video.findById(videoId);
    if (!video) {
      next(new HttpError(404, 'Video not found'));
      return;
    }

    const playlist = await assertPlaylistOwner(video.playlistId, req.userId);
    const language = playlist.language || video.language || null;
    if (!language) {
      next(new HttpError(400, 'Playlist language not set'));
      return;
    }

    // Mark complete for this user (no requirements per product decision)
    const row = await VideoProgress.findOneAndUpdate(
      { userId: req.userId, videoId: video._id },
      {
        $set: {
          userId: req.userId,
          playlistId: playlist._id,
          videoId: video._id,
          language,
          completed: true,
          unlocked: true,
          completedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Unlock next by order
    const nextVideo = await Video.findOne({ playlistId: playlist._id, order: video.order + 1 });
    let nextUnlockedVideoId = null;
    if (nextVideo) {
      await VideoProgress.findOneAndUpdate(
        { userId: req.userId, videoId: nextVideo._id },
        {
          $set: {
            userId: req.userId,
            playlistId: playlist._id,
            videoId: nextVideo._id,
            language,
            unlocked: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      nextUnlockedVideoId = nextVideo._id;
    }

    // Check language completion (all videos completed)
    const total = await Video.countDocuments({ playlistId: playlist._id });
    const completedCount = await VideoProgress.countDocuments({
      userId: req.userId,
      playlistId: playlist._id,
      completed: true,
    });
    const languageCompleted = total > 0 && completedCount >= total;

    let nextLanguage = null;
    if (languageCompleted) {
      const user = await User.findById(req.userId);
      if (user) {
        const completed = Array.isArray(user.completedLanguages) ? user.completedLanguages : [];
        if (!completed.includes(language)) completed.push(language);
        user.completedLanguages = completed;

        // Use the user's actual language order (custom or default)
        const languageOrder = await getLanguageOrder(req.userId);
        const idx = languageOrder.indexOf(language);
        nextLanguage = idx >= 0 && idx < languageOrder.length - 1 ? languageOrder[idx + 1] : null;
        user.currentLanguage = nextLanguage;
        user.upcomingLanguages = nextLanguage
          ? languageOrder.slice(idx + 2)
          : [];
        await user.save();

        // Also update UserSkill.currentLanguage for custom journeys
        await UserSkill.findOneAndUpdate(
          { userId: req.userId },
          { $set: { currentLanguage: nextLanguage } },
        ).catch(() => {});
      }
    }

    const updatedVideos = await mergePlaylistVideosForUser(playlist, language, req.userId);

    res.json({
      success: true,
      videos: updatedVideos,
      playlistId: playlist._id,
      language,
      completedVideoId: row.videoId,
      nextUnlockedVideoId,
      languageCompleted,
      nextLanguage,
    });
  } catch (e) {
    next(e);
  }
}

// ── GET /api/journey/status/:language ────────────────────────────────────
// Returns completion status for a language and what the next language is.
async function getLanguageStatus(req, res, next) {
  try {
    const language = (req.params.language || '').trim();
    if (!language) { next(new HttpError(400, 'language is required')); return; }

    const playlist = await Playlist.findOne({ userId: req.userId, language }).sort({ createdAt: -1 });
    if (!playlist) {
      return res.json({ success: true, language, hasPlaylist: false, languageCompleted: false, nextLanguage: null });
    }

    const totalVideos     = await Video.countDocuments({ playlistId: playlist._id });
    const completedVideos = await VideoProgress.countDocuments({ userId: req.userId, playlistId: playlist._id, completed: true });
    const languageCompleted = totalVideos > 0 && completedVideos >= totalVideos;

    const languageOrder = await getLanguageOrder(req.userId);
    const idx = languageOrder.indexOf(language);
    const nextLanguage = idx >= 0 && idx < languageOrder.length - 1 ? languageOrder[idx + 1] : null;

    // Check if next language already has a playlist
    let nextHasPlaylist = false;
    if (nextLanguage) {
      const nextPlaylist = await Playlist.findOne({ userId: req.userId, language: nextLanguage });
      nextHasPlaylist = !!nextPlaylist;
    }

    res.json({
      success: true,
      language,
      hasPlaylist: true,
      totalVideos,
      completedVideos,
      languageCompleted,
      nextLanguage,
      nextHasPlaylist,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { listJourneyVideos, completeVideo, getLanguageStatus };

