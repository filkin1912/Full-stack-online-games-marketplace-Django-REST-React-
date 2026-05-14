import os
import cloudinary.uploader
from django.conf import settings
from exam_project.games.models import GameModel
from exam_project.accounts.models import AppUser


def upload_file_to_cloudinary(local_path, folder, public_id):
    result = cloudinary.uploader.upload(
        local_path,
        folder=folder,
        public_id=public_id,
        overwrite=True,
    )
    return result["secure_url"]


def upload_missing_game_images():
    game_media_dir = settings.MEDIA_ROOT / "game_pics"

    print("\n=== Uploading missing GAME images ===")

    for game in GameModel.objects.all():
        if game.game_picture:  # Already Cloudinary
            continue

        possible_files = [
            f for f in os.listdir(game_media_dir)
            if game.title.lower().replace(" ", "") in f.lower().replace(" ", "")
            or str(game.id) in f
        ]

        if not possible_files:
            print(f"[SKIP] No local image found for game: {game.title}")
            continue

        local_file = game_media_dir / possible_files[0]
        print(f"[UPLOAD] {game.title} → {local_file}")

        url = upload_file_to_cloudinary(
            local_path=local_file,
            folder="game_pics",
            public_id=f"game_{game.id}"
        )

        game.game_picture = url
        game.save()

        print(f"[OK] Uploaded → {url}")


def upload_missing_profile_images():
    profile_media_dir = settings.MEDIA_ROOT / "profile_pics"

    print("\n=== Uploading missing PROFILE images ===")

    for user in AppUser.objects.all():
        if user.profile_picture:  # Already Cloudinary
            continue

        possible_files = [
            f for f in os.listdir(profile_media_dir)
            if str(user.id) in f
            or user.email.split("@")[0].lower() in f.lower()
        ]

        if not possible_files:
            print(f"[SKIP] No local image found for user: {user.email}")
            continue

        local_file = profile_media_dir / possible_files[0]
        print(f"[UPLOAD] {user.email} → {local_file}")

        url = upload_file_to_cloudinary(
            local_path=local_file,
            folder="profile_pics",
            public_id=f"profile_{user.id}"
        )

        user.profile_picture = url
        user.save()

        print(f"[OK] Uploaded → {url}")


def run():
    upload_missing_game_images()
    upload_missing_profile_images()
    print("\n=== DONE ===")
