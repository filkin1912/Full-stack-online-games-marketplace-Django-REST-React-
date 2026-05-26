import os
import random
import uuid

from locust import HttpUser, between, task


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if not value:
        return default
    try:
        return int(value)
    except ValueError:
        return default


class GamesApiUser(HttpUser):
    wait_time = between(
        _env_int("LOCUST_WAIT_MIN_SECONDS", 1),
        _env_int("LOCUST_WAIT_MAX_SECONDS", 3),
    )

    def on_start(self):
        self.token = None
        self.auth_headers = {}
        self.game_ids = []

        # Create an isolated user for each virtual user to avoid collisions.
        email = f"loadtest_{uuid.uuid4().hex[:10]}@example.com"
        password = os.getenv("LOCUST_USER_PASSWORD", "StrongPass123!")

        signup_payload = {
            "email": email,
            "password": password,
            "first_name": "Load",
            "last_name": "Test",
        }
        self.client.post("/api/accounts/signup/", json=signup_payload, name="auth.signup")

        token_res = self.client.post(
            "/api/auth/token/",
            json={"email": email, "password": password},
            name="auth.token",
        )
        if token_res.status_code == 200:
            self.token = token_res.json().get("access")
            if self.token:
                self.auth_headers = {"Authorization": f"Bearer {self.token}"}

        self.refresh_game_ids()

    def refresh_game_ids(self):
        res = self.client.get("/api/games/?page=1", name="games.list")
        if res.status_code != 200:
            return
        data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
        results = data.get("results", [])
        self.game_ids = [game.get("id") for game in results if game.get("id")]

    def pick_game_id(self):
        if not self.game_ids:
            self.refresh_game_ids()
        return random.choice(self.game_ids) if self.game_ids else None

    @task(5)
    def list_games(self):
        self.client.get("/api/games/?page=1", name="games.list")

    @task(3)
    def game_details(self):
        game_id = self.pick_game_id()
        if not game_id:
            return
        self.client.get(f"/api/games/{game_id}/", name="games.detail")

    @task(2)
    def my_profile(self):
        if not self.auth_headers:
            return
        self.client.get("/api/accounts/me/", headers=self.auth_headers, name="accounts.me")

    @task(1)
    def list_comments(self):
        game_id = self.pick_game_id()
        if not game_id or not self.auth_headers:
            return
        self.client.get(
            f"/api/common/comments/{game_id}/",
            headers=self.auth_headers,
            name="comments.list",
        )

    @task(1)
    def buy_game(self):
        game_id = self.pick_game_id()
        if not game_id or not self.auth_headers:
            return
        with self.client.post(
            f"/api/games/{game_id}/buy/",
            headers=self.auth_headers,
            name="games.buy",
            catch_response=True,
        ) as response:
            # In load tests, many buy attempts are expected to fail
            # (already purchased, insufficient funds, etc.). Treat these
            # business-rule outcomes as successful request handling.
            if response.status_code in (200, 201, 400):
                response.success()
