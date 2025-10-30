
# pyright: reportMissingImports=false

import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Set OPENAI_API_KEY in your environment before running:
#   export OPENAI_API_KEY="sk-..."
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SURVEY_SYSTEM_PROMPT = (
    "You are S.H.A.K.T.I., an AI holistic wellness guide. "
    "You analyze user lifestyle, hydration, sleep, stress, diet, and goals. "
    "You respond in clear, supportive, practical language. "
    "You are NOT a doctor. Include gentle safety disclaimers instead of diagnosis. "
    "Give concrete habit suggestions for the next 24-48 hours."
)
CHAT_SYSTEM_PROMPT = (
    "You are S.H.A.K.T.I., an empathetic holistic health assistant. "
    "You answer like a calm wellness coach, not a doctor. You can talk about stress, "
    "sleep, hydration, cravings, self-care and lifestyle balance. Always remind them "
    "to seek real medical care for emergencies or serious concerns."
)

# ---------- Page routes ----------
@app.route("/")
def dashboard():
    return render_template("dashboard.html")

@app.route("/survey")
def survey_page():
    return render_template("survey.html")

@app.route("/chat")
def chat_page():
    return render_template("chat.html")

@app.route("/insights")
def insights_page():
    # Simple page that can render last insights from client-side storage
    return render_template("insights.html")

# ---------- API routes ----------
@app.route("/api/survey", methods=["POST"])
def api_survey():
    data = request.get_json(force=True)
    summary_parts = [
        f"Age: {data.get('age','')}",
        f"Height(cm): {data.get('height','')}",
        f"Weight(kg): {data.get('weight','')}",
        f"Sleep last night(hrs): {data.get('sleepHours','')}",
        f"Water today(L): {data.get('waterIntake','')}",
        f"Stress level: {data.get('stressLevel','')}",
        f"Goal: {data.get('goal','')}",
        f"Symptoms / how they feel: {data.get('symptoms','')}",
        f"Diet type: {data.get('dietType','')}",
    ]
    survey_summary = "\n".join(summary_parts)

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SURVEY_SYSTEM_PROMPT},
                {"role": "user", "content": (
                    "Here is the user's current self-report / survey:\n\n"
                    f"{survey_summary}\n\n"
                    "Please provide:\n"
                    "1) Hydration/nutrition guidance today.\n"
                    "2) Sleep and recovery advice for next 1-2 nights.\n"
                    "3) Stress / mood self-care steps.\n"
                    "4) Small habit goals for next 24 hours.\n"
                    "Keep it short, supportive, and actionable."
                )},
            ],
            temperature=0.6,
            max_tokens=600,
        )
        answer_text = completion.choices[0].message.content.strip()
    except Exception as e:
        answer_text = (
            "I couldn't generate insights right now. Please try again in a moment. "
            "If you're feeling unwell or in danger, seek in-person medical help."
        )
    return jsonify({"answer": answer_text})

@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(force=True)
    user_msg = data.get("message", "").strip()
    if not user_msg:
        return jsonify({"answer": "Please type a message so I can help ❤️"})
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": CHAT_SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.7,
            max_tokens=500,
        )
        answer_text = completion.choices[0].message.content.strip()
    except Exception as e:
        answer_text = (
            "I'm having trouble replying right now. Please try again. "
            "If this is urgent or you're feeling unsafe, get in-person help immediately."
        )
    return jsonify({"answer": answer_text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
