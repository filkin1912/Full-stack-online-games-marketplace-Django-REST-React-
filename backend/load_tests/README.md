# Locust Load Testing

This folder contains a baseline load test for the backend API.

## Prerequisites

- Backend running locally on `http://127.0.0.1:8000`
- PostgreSQL running
- Locust installed in backend venv

## Start Locust UI

```powershell
cd backend
.\venv\Scripts\locust -f load_tests\locustfile.py --host http://127.0.0.1:8000
```

Open [http://localhost:8089](http://localhost:8089), then set users/spawn rate and start.

## Headless runs (repeatable)

### Baseline

```powershell
.\venv\Scripts\locust -f load_tests\locustfile.py --host http://127.0.0.1:8000 --headless --users 20 --spawn-rate 5 --run-time 2m --csv load_tests\results\baseline
```

### Mid load

```powershell
.\venv\Scripts\locust -f load_tests\locustfile.py --host http://127.0.0.1:8000 --headless --users 80 --spawn-rate 10 --run-time 3m --csv load_tests\results\mid
```

### Stress

```powershell
.\venv\Scripts\locust -f load_tests\locustfile.py --host http://127.0.0.1:8000 --headless --users 200 --spawn-rate 20 --run-time 5m --csv load_tests\results\stress
```

## What this script simulates

- Signup + JWT login per virtual user
- Public games list and game details
- Authenticated profile fetch
- Authenticated comments list
- Authenticated buy attempts

## Optional tuning via environment variables

- `LOCUST_WAIT_MIN_SECONDS` (default `1`)
- `LOCUST_WAIT_MAX_SECONDS` (default `3`)
- `LOCUST_USER_PASSWORD` (default `StrongPass123!`)
