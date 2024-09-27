# Use a Node.js base image for the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies including Next.js
RUN npm ci
RUN npm install next react react-dom

# Copy frontend files
COPY frontend .

# Build the Next.js app
RUN npm run build

# Use a Python base image for the backend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including graphviz and Node.js
RUN apt-get update && \
    apt-get install -y \
    graphviz \
    graphviz-dev \
    gcc \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY . .

# Copy built frontend files and node_modules from the previous stage
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json

# Expose ports for both frontend and backend
EXPOSE 3000 8080

# Set environment variable for API URL
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Start both frontend and backend
CMD ["sh", "-c", "cd frontend && npm start & cd /app && python main.py"]