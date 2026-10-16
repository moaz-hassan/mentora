import fetch from 'node-fetch';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipe = promisify(pipeline);

export const proxyStream = async (remoteUrl, req, res) => {
  const headers = {};
  if (req.headers.range) headers.Range = req.headers.range;

  const upstream = await fetch(remoteUrl, { headers });

  // forward status
  res.status(upstream.status);

  // copy relevant headers
  const hopByHop = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'transfer-encoding',
    'upgrade',
  ]);

  upstream.headers.forEach((value, name) => {
    if (!hopByHop.has(name.toLowerCase())) {
      res.setHeader(name, value);
    }
  });

  try {
    await pipe(upstream.body, res);
  } catch (err) {
    // If client aborted, upstream pipe will error — ensure response ends
    try {
      res.end();
    } catch (e) {}
  }
};

export const fetchText = async (url, opts = {}) => {
  const resp = await fetch(url, opts);
  const text = await resp.text();
  return { text, status: resp.status, headers: resp.headers };
};

export default { proxyStream, fetchText };
