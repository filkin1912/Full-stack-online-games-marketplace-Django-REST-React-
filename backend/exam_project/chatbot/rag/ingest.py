import logging

from django.db import transaction
from exam_project.games.models import GameModel

from ..models import GameEmbeddingChunk
from .embeddings import embed_texts

logger = logging.getLogger(__name__)


def build_chunk_text(game):
    """Create the canonical embedding text payload for one game."""
    summary = (game.summary or "").strip() or "No summary."
    return (
        f"Title: {game.title}. "
        f"Category: {game.category}. "
        f"Price: ${game.price}. "
        f"Summary: {summary}"
    )


def upsert_game_chunk(game):
    """Create or update the vector chunk row for a game."""
    content = build_chunk_text(game)
    vectors = embed_texts([content])
    if vectors is None:
        return False

    GameEmbeddingChunk.objects.update_or_create(
        game=game,
        defaults={"content": content, "embedding": vectors[0]},
    )
    return True


def sync_all_games():
    """Rebuild embeddings for every game in the shop catalog."""
    synced = 0
    failed = 0
    for game in GameModel.objects.iterator():
        if upsert_game_chunk(game):
            synced += 1
        else:
            failed += 1
    return synced, failed


def ensure_rag_index():
    """
    Embed any game missing a chunk or updated after its chunk was built.
    """
    stale_ids = []
    for game in GameModel.objects.only("id", "updated_at", "title"):
        try:
            chunk = GameEmbeddingChunk.objects.get(pk=game.pk)
        except GameEmbeddingChunk.DoesNotExist:
            stale_ids.append(game.pk)
            continue
        if game.updated_at and chunk.updated_at and game.updated_at > chunk.updated_at:
            stale_ids.append(game.pk)

    if not stale_ids and GameEmbeddingChunk.objects.exists():
        return

    if not GameEmbeddingChunk.objects.exists():
        logger.info("RAG index empty; syncing full catalog")
        sync_all_games()
        return

    for game in GameModel.objects.filter(pk__in=stale_ids):
        upsert_game_chunk(game)


@transaction.atomic
def clear_rag_index():
    """Delete all stored game embedding chunks."""
    GameEmbeddingChunk.objects.all().delete()
