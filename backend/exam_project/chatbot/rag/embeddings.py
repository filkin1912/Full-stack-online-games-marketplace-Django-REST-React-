import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def _api_key():
    return (settings.AI_API_KEY or "").strip()


def _headers():
    return {
        "Authorization": f"Bearer {_api_key()}",
        "Content-Type": "application/json",
        "Referer": "http://localhost:3000",
        "X-Title": "GamesPlay Chatbot RAG",
    }


def embed_texts(texts):
    """
    Call OpenRouter embeddings API. Returns list of vectors or None on failure.
    """
    if not texts:
        return []

    api_key = _api_key()
    if not api_key or api_key == "your-openrouter-or-openai-key":
        logger.warning("RAG embeddings skipped: AI_API_KEY not configured")
        return None

    payload = {
        "model": settings.RAG_EMBEDDING_MODEL,
        "input": texts if len(texts) > 1 else texts[0],
    }

    try:
        response = requests.post(
            settings.OPENROUTER_EMBEDDINGS_URL,
            json=payload,
            headers=_headers(),
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        logger.warning("OpenRouter embeddings request failed: %s", exc)
        return None

    if "data" not in data:
        logger.warning("OpenRouter embeddings unexpected response: %s", data)
        return None

    ordered = sorted(data["data"], key=lambda row: row.get("index", 0))
    vectors = [row["embedding"] for row in ordered]
    if len(vectors) != len(texts):
        logger.warning(
            "OpenRouter embeddings count mismatch: sent %s got %s",
            len(texts),
            len(vectors),
        )
        return None

    return vectors


def embed_text(text):
    vectors = embed_texts([text])
    if not vectors:
        return None
    return vectors[0]
