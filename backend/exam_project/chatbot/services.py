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
    budget = extract_budget(message_lower)
    if budget is not None:
        save_memory(user, "budget", str(budget))

    # Detect genre
    genres = ["action", "adventure", "puzzle", "strategy", "sports", "board"]
    for g in genres:
        if g in message_lower:
            save_memory(user, "preferred_genre", g.capitalize())


def extract_budget(message):
    budget_filter = extract_budget_filter(message)
    if budget_filter is None:
        return None
    return budget_filter[0]


def extract_budget_filter(message):
    message_lower = (message or "").lower()
    budget_patterns = (
        (r"(?:under|below|less than|cheaper than|price.*under|price.*below)\s*\$?\s*(\d+(?:\.\d+)?)", False),
        (r"(?:max(?:imum)?|up to|budget|price|cost)\s*\$?\s*(\d+(?:\.\d+)?)", True),
        (r"\$?\s*(\d+(?:\.\d+)?)\s*(?:usd|dollars?)", True),
        (r"\$\s*(\d+(?:\.\d+)?)", True),
    )

    for pattern, inclusive in budget_patterns:
        match = re.search(pattern, message_lower)
        if match:
            return float(match.group(1)), inclusive

    if any(word in message_lower for word in ("budget", "price", "cost", "cheap")):
        match = re.search(r"(\d+(?:\.\d+)?)", message_lower)
        if match:
            return float(match.group(1)), True

    return None


def game_price(game):
    try:
        return float(game.get("price") or 0)
    except (TypeError, ValueError):
        return 0


def matches_budget(game, budget, inclusive):
    price = game_price(game)
    if inclusive:
        return price <= budget
    return price < budget


def fallback_recommendation(message, game_data):
    message_lower = (message or "").lower()
    genres = ["action", "adventure", "puzzle", "strategy", "sports", "board", "other"]
    selected_genre = next((genre for genre in genres if genre in message_lower), None)
    budget_filter = extract_budget_filter(message_lower)

    games = game_data
    if selected_genre:
        games = [
            game for game in game_data
            if (game.get("category") or "").lower() == selected_genre
        ]
    if budget_filter is not None:
        budget, inclusive = budget_filter
        games = [
            game for game in games
            if matches_budget(game, budget, inclusive)
        ]

    games = sorted(games, key=game_price, reverse=True)

    if not games:
        return "No games found."

    intro = "Here are games matching your request:"
    lines = [
        f"- {game.get('title')} (${game.get('price')})"
        for game in games[:8]
    ]
    return "\n".join([intro, *lines])


# -----------------------------
# MAIN LLM FUNCTION
# -----------------------------

def ask_llm(user, message, game_data):
    url = "https://openrouter.ai/api/v1/chat/completions"

    # Detect and store preferences
    detect_and_save_preferences(user, message)

    # Load memory
    memory_text = load_memory(user)

    api_key = (settings.AI_API_KEY or "").strip()
    if not api_key or api_key == "your-openrouter-or-openai-key":
        return fallback_recommendation(message, game_data)

    headers = {
        "Authorization": f"Bearer {api_key}",
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

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        data = response.json()
    except requests.RequestException as exc:
        return f"AI service error: {exc}"

    print("OPENROUTER RESPONSE:", data)

    if "choices" not in data:
        return "AI service error: " + str(data)

    return data["choices"][0]["message"]["content"]
