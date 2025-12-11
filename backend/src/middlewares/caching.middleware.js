import { getFromCache } from "../caching/cache.manager.js";

async function cachingMiddleware(req, res, next) {
  try {
    const cachedData = await getFromCache(req);
    if (cachedData) {
      return res.json({
        success: true,
        ...cachedData,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}

export default cachingMiddleware;
