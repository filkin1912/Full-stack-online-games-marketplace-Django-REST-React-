from django.core.management.base import BaseCommand

from exam_project.chatbot.rag.ingest import sync_all_games


class Command(BaseCommand):
    """Syncs the chatbot RAG index from the current game catalog."""
    help = "Embed all shop games into pgvector for chatbot RAG."


    def handle(self, *args, **options): 
        """Run the sync and print success/failure counts."""
        synced, failed = sync_all_games()
        self.stdout.write(
            self.style.SUCCESS(
                f"RAG index sync complete: {synced} ok, {failed} failed."
            )
        )
        if failed:
            self.stdout.write(
                self.style.WARNING(
                    "Failures usually mean AI_API_KEY is missing or embeddings API error."
                )
            )
