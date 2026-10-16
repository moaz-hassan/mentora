import * as lessonService from "../../services/courses/lesson.service.js";


export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);

    // sanitize playback fields for users without access
    const isAuthorized = await lessonService.isUserAuthorizedForLesson(req.params.id, req.user);
    const sanitized = lesson && typeof lesson.toJSON === 'function' ? lesson.toJSON() : { ...lesson };
    if (!isAuthorized) {
      delete sanitized.video_url;
      delete sanitized.hls_url;
      delete sanitized.video_public_id;
    }

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

export const playLesson = async (req, res, next) => {
  try {
    const playback = await lessonService.getPlaybackUrl(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: playback,
    });
  } catch (error) {
    next(error);
  }
};

export const streamLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);

    // authorization: preview allowed even for unauthenticated users
    const allowed = await lessonService.isUserAuthorizedForLesson(req.params.id, req.user);
    if (!allowed) {
      const error = new Error('You are not authorized to access this lesson');
      error.statusCode = 403;
      throw error;
    }

    // If HLS playlist provided, fetch and rewrite segment URLs to proxy through this endpoint
    if (lesson.hls_url) {
      const { fetchText } = await import('../../utils/stream.util.js');
      const baseUrl = lesson.hls_url;
      const result = await fetchText(baseUrl);
      if (result.status !== 200) {
        const error = new Error('Failed to fetch playlist');
        error.statusCode = 502;
        throw error;
      }

      const playlist = result.text;
      const lines = playlist.split(/\r?\n/);
      const rewritten = lines.map((line) => {
        if (!line || line.startsWith('#')) {
          // also rewrite URIs inside EXT-X-KEY lines
          if (line && line.includes('URI="')) {
            return line.replace(/URI=\"([^\"]+)\"/g, (m, uri) => {
              try {
                const abs = new URL(uri, baseUrl).toString();
                const b64 = encodeURIComponent(Buffer.from(abs).toString('base64'));
                return `URI=\"${req.protocol}://${req.get('host')}/api/lessons/${lesson.id}/stream?segment=${b64}\"`;
              } catch (e) {
                return m;
              }
            });
          }
          return line;
        }

        // line is a segment or sub-playlist URL — resolve to absolute and proxy
        try {
          const abs = new URL(line, baseUrl).toString();
          const b64 = encodeURIComponent(Buffer.from(abs).toString('base64'));
          return `${req.protocol}://${req.get('host')}/api/lessons/${lesson.id}/stream?segment=${b64}`;
        } catch (e) {
          return line;
        }
      }).join('\n');

      res.setHeader('content-type', 'application/vnd.apple.mpegurl');
      return res.status(200).send(rewritten);
    }

    // If segment param present, proxy that segment
    if (req.query.segment) {
      const segmentB64 = decodeURIComponent(req.query.segment);
      const remote = Buffer.from(segmentB64, 'base64').toString('utf8');
      const { proxyStream } = await import('../../utils/stream.util.js');
      return await proxyStream(remote, req, res);
    }

    // fallback: progressive video (proxy with Range support)
    const playback = await lessonService.getPlaybackUrl(req.params.id, req.user);
    if (!playback || !playback.url) {
      const error = new Error('No video source available');
      error.statusCode = 404;
      throw error;
    }
    const { proxyStream } = await import('../../utils/stream.util.js');
    return await proxyStream(playback.url, req, res);
  } catch (error) {
    next(error);
  }
};

export const createLesson = async (req, res, next) => {
  try {
    
    const lesson = await lessonService.createLesson(
      req.body,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
  
    
    const lesson = await lessonService.updateLesson(req.params.id, req.body,req.user.id);
    
    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    const result = await lessonService.deleteLesson(req.params.id,req.user.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
