import re
import requests
from django.conf import settings
from .models import ChatMemory


# -----------------------------
# MEMORY HELPERS
# -----------------------------

def save_memory(user, key, value):
    ChatMemory.objects.create(
        user=user,
        key=key,
        value=value
    )


def load_memory(user):
    memories = ChatMemory.objects.filter(user=user)
    if not memories.exists():
        return "No stored preferences."

    return "\n".join([f"{m.key}: {m.value}" for m in memories])


def clear_memory(user):
    ChatMemory.objects.filter(user=user).delete()


def detect_and_save_preferences(user, message):
    message_lower = message.lower()

    # Detect budget
    if "budget" in message_lower or "$" in message_lower:
        match = re.search(r"\$?(\d+)", message_lower)
        if match:
            save_memory(user, "budget", match.group(1))

    # Detect genre
    genres = ["action", "adventure", "puzzle", "strategy", "sports", "board"]
    for g in genres:
        if g in message_lower:
            save_memory(user, "preferred_genre", g.capitalize())


# -----------------------------
# MAIN LLM FUNCTION
# -----------------------------

def ask_llm(user, message, game_data):
    url = "https://openrouter.ai/api/v1/chat/completions"

    # Detect and store preferences
    detect_and_save_preferences(user, message)

    # Load memory
    memory_text = load_memory(user)

    headers = {
        "Authorization": f"Bearer {settings.AI_API_KEY}",
        "Content-Type": "application/json",
        "Referer": "http://localhost:3000",
        "X-Title": "GamesPlay Chatbot",
    }

    payload = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a game recommendation assistant. "
                    "Your output MUST follow this exact formatting:\n\n"
                    "1) Start with ONE short intro line.\n"
                    "2) Then list ALL matching games.\n"
                    "3) EACH GAME MUST BE ON ITS OWN LINE.\n"
                    "4) Format each line EXACTLY like this:\n"
                    "- Game Title ($Price)\n\n"
                    "STRICT RULES:\n"
                    "- NEVER put multiple games on the same line.\n"
                    "- NEVER merge lines.\n"
                    "- NEVER add explanations.\n"
                    "- NEVER add extra text.\n"
                    "- If no games match, respond ONLY with: No games found."
                )
            },
            {
                "role": "user",
                "content": f"""
User: {user.email}

Known preferences:
{memory_text}

Message:
{message}

Available games:
{game_data}

Respond following the strict formatting rules above.
"""
            }
        ]
    }

    response = requests.post(url, json=payload, headers=headers)
    data = response.json()

    print("OPENROUTER RESPONSE:", data)

    if "choices" not in data:
        return "AI service error: " + str(data)

    return data["choices"][0]["message"]["content"]
