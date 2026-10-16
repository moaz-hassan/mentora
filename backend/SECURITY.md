Security checklist for distribution
=================================

Short checklist to include with the package before selling on CodeCanyon.

- Rotate all provider keys (Cloudinary, Supabase, SMTP, Stripe, etc.) and ensure no secrets are committed.
- Remove committed `.env` files from the repository and add an example `.env.example` with placeholders.
- Apply per-route rate-limiting for sensitive endpoints (playback, stream, downloads) — already added.
- Enable access logging/audit for playback and download endpoints and store logs off‑site or in DB — audit entries are written to `audit_logs`.
- Limit playback/download signed URL TTLs (short lived) and verify server-side enrollment checks before issuing URLs.
- Use TLS (HTTPS) for frontend and backend endpoints; ensure `CLIENT_URL` CORS policy is locked to expected origins.
- Sanitize responses: do not return raw storage or credential information in API responses.
- Add monitoring and alerts (rate-limit breaches, high bandwidth, unusual download patterns).
- Add IP-based abuse mitigations and consider CDN signed URLs or DRM for high-value videos.
- Provide clear upgrade and revoke instructions (how to rotate keys and invalidate old tokens).
- Include a short security section in README that lists required env vars, recommended TTLs, and where logs are stored.

What was changed in this commit:
- Added route-level rate limiters for playback/stream/download.
- Added `accessLogMiddleware` which writes access entries to `audit_logs`.
