FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for Pillow
RUN apt-get update && apt-get install -y \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# collectstatic runs before runtime env; .env.local is not in the image
ENV SECRET_KEY=build-collectstatic-placeholder
ENV DB_NAME=examdb
ENV DB_USER=examuser
ENV DB_PASSWORD=exampass
ENV DB_HOST=db
ENV DB_PORT=5432

# Collect static files during build (Cloud Run filesystem is read-only)
RUN python manage.py collectstatic --noinput

# Copy entrypoint script and ensure it's executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
