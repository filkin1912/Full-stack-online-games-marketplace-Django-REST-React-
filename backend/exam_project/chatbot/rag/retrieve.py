from django.conf import settings
from pgvector.django import CosineDistance

from ..models import GameEmbeddingChunk
from .embeddings import embed_text


def game_to_dict(game):
    return {
        "title": game.title,
        "summary": game.summary,
        "price": game.price,
        "category": game.category,
    }


def retrieve_shop_games(message, top_k=None):
    """
    Return top-k shop games by semantic similarity to the user message.
    Only games in GameModel / GameEmbeddingChunk — never external titles.
    """
    k = top_k or settings.RAG_TOP_K
    query = (message or "").strip()
    if not query:
        return []

    query_vector = embed_text(query)
    if query_vector is None:
        return []

    chunks = (
        GameEmbeddingChunk.objects.select_related("game")
        .order_by(CosineDistance("embedding", query_vector))[:k]
    )

    games = []
    for chunk in chunks:
        games.append(game_to_dict(chunk.game))
    return games
