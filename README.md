
# S.H.A.K.T.I — Holistic Health Console (Flask, Multi‑Page)

Production‑ready, multi‑page version of your S.H.A.K.T.I wellness assistant.

## Features
- **Tabs as separate pages**: Dashboard, Survey, Chat, Insights (all share the same bright background UI).
- **Animations**: Floating food orbits, heartbeat HUD, soft glows.
- **AI endpoints**: `/api/survey` and `/api/chat` (OpenAI `gpt-4o-mini` used by default).
- **PDF download**: Survey insights, chat transcript, and saved insights.
- **Clean separation**: Shared layout in `templates/base.html`, page‑specific blocks in child templates.
- **4K‑ready fonts** and accessible color/contrast.

## Quickstart
```bash
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

export OPENAI_API_KEY="sk-..."                      # Windows PowerShell: $env:OPENAI_API_KEY="sk-..."
python app.py
# Open http://127.0.0.1:5000/
```

## Project Structure
```
shakti_health_console/
├── app.py
├── requirements.txt
├── templates/
│   ├── base.html
│   ├── dashboard.html
│   ├── survey.html
│   ├── chat.html
│   └── insights.html
└── static/
    ├── css/base.css
    ├── js/base.js
    ├── CG_Heart.gif
    └── food-bg.jpg
```

## GitHub Instructions
```bash
cd shakti_health_console
git init
git add .
git commit -m "feat: S.H.A.K.T.I multi-page production UI with PDF downloads"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
Replace `<your-username>/<your-repo>` with your GitHub path.

## Notes
- This app offers **educational wellness guidance only**; it is **not medical advice**.
- You can retheme gradients in `:root` variables inside `static/css/base.css`.
