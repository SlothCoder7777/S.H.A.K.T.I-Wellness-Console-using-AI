
# Project Report — S.H.A.K.T.I Health Console

**Objective:** Deliver a production‑ready, multi‑page wellness assistant with consistent animated background, clear 4K UI, AI‑powered insights, and PDF export on each tab.

## Architecture
- **Frontend:** Jinja2 templates layered on a shared `base.html`; per‑page HTML for Survey, Chat, Dashboard, Insights; CSS & JS in `/static`.
- **Backend:** Flask app exposing `/api/survey` and `/api/chat`. Business prompts tuned for **non‑diagnostic guidance**.
- **Assets:** `CG_Heart.gif` heartbeat HUD, `food-bg.jpg` doodle background.
- **Persistence:** Client‑side (LocalStorage) for last insights; server‑side state is stateless.

## Security/Privacy
- No PII collected server‑side. Do not paste secrets. Keep `OPENAI_API_KEY` in environment variables.
- Enable HTTPS in deployment (e.g., behind Nginx/Cloudflare or on Render/Heroku with TLS).

## Deployment
- **Gunicorn** behind a reverse proxy:
  ```bash
  pip install gunicorn
  gunicorn -w 2 -b 0.0.0.0:5000 app:app
  ```
- Containerization (optional): Add a `Dockerfile` with a slim Python image.

## Testing
- Smoke tests for `/`, `/survey`, `/chat`, `/insights` responding `200`.
- Manual UI checks on desktop 1080p and 4K.

## Future Work
- Auth + user profiles, server‑side storage of history.
- Wearables API integration (Fitbit/Google Fit) via OAuth.
- Rate‑limit and caching for OpenAI calls.
