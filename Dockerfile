# Frontend build stage
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci
RUN npm install next react react-dom

COPY frontend .
RUN npm run build

# Backend build stage
FROM python:3.10-slim-buster AS backend-builder

WORKDIR /app

# Install system dependencies required for building pygraphviz
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    graphviz \
    graphviz-dev \
    gcc \
    g++ \
    make \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.10-slim-buster

WORKDIR /app

# Install Node.js 18.x and other runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    graphviz \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from backend-builder
COPY --from=backend-builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy backend files
COPY . .

# Copy frontend build from frontend-builder
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json

EXPOSE 3000 8080

ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

CMD ["sh", "-c", "cd frontend && npm start & cd /app && python main.py"]