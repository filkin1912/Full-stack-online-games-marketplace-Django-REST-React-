import pgvector.django
from django.db import migrations, models
import django.db.models.deletion
from pgvector.django import VectorExtension


class Migration(migrations.Migration):

    dependencies = [
        ("games", "0009_alter_gamemodel_updated_at"),
        ("chatbot", "0002_alter_chatmemory_options"),
    ]

    operations = [
        VectorExtension(),
        migrations.CreateModel(
            name="GameEmbeddingChunk",
            fields=[
                (
                    "game",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        primary_key=True,
                        related_name="rag_chunk",
                        serialize=False,
                        to="games.gamemodel",
                    ),
                ),
                ("content", models.TextField()),
                ("embedding", pgvector.django.VectorField(dimensions=1536)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Game embedding chunk",
                "verbose_name_plural": "Game embedding chunks",
            },
        ),
    ]
