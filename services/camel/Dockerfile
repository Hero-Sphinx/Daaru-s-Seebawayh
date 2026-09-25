# CAMeL Tools morphology service — deployable to any container host
# (Render, Railway, Fly.io, Cloud Run…). The ~40MB MSA morphology database is
# downloaded at build time, so the container starts with no network access
# needed and no volume to mount.
#
#   docker build -t dsb-camel services/camel
#   docker run -p 8001:8001 dsb-camel
#
# Then point the web app at it: CAMEL_SERVICE_URL=https://<your-host>
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CAMELTOOLS_DATA=/opt/camel_tools

WORKDIR /app
COPY requirements.txt .
# camel_data doesn't create its data directory itself (fails copying catalogue.json).
RUN mkdir -p "$CAMELTOOLS_DATA" \
 && pip install --no-cache-dir -r requirements.txt \
 && camel_data -i morphology-db-msa-r13

COPY app.py .

# Hosts that assign a port pass it as $PORT; 8001 locally.
EXPOSE 8001
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8001}"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD python -c "import urllib.request,os; urllib.request.urlopen(f'http://localhost:{os.environ.get(\"PORT\",\"8001\")}/health')"
