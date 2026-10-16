import { logAudit } from "../services/admin/logs.service.js";

const accessLogMiddleware = () => (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      let resourceType = "unknown";
      if (req.path.includes("/play")) resourceType = "lesson_play";
      else if (req.path.includes("/stream")) resourceType = "lesson_stream";
      else if (req.path.includes("/download")) resourceType = "material_download";

      const resourceId = req.params.id || req.params.lessonId || req.params.materialId || null;
      const userId = req.user ? req.user.id : null;
      const description = `${req.method} ${req.originalUrl} user:${userId || 'guest'}`;
      const status = res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failed';

      await logAudit({
        adminId: req.user && req.user.role === 'admin' ? req.user.id : null,
        actionType: 'view',
        resourceType,
        resourceId,
        description,
        ipAddress: req.ip || (req.connection && req.connection.remoteAddress),
        userAgent: req.get('user-agent'),
        status,
        metadata: {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          userId,
          durationMs: Date.now() - start,
          query: req.query
        }
      });
    } catch (err) {
      console.error('Access log error:', err);
    }
  });

  next();
};

export default accessLogMiddleware;
