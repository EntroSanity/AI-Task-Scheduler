# Use a Node.js base image for the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build

# Use a Python base image for the backend
FROM python:3.10-slim

WORKDIR /app

# Copy backend requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY . .

# Copy built frontend files from the previous stage
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next

# Install Node.js for serving the frontend
RUN apt-get update && apt-get install -y nodejs npm

# Expose ports for both frontend and backend
EXPOSE 3000 8080

# Start both frontend and backend
CMD ["sh", "-c", "cd frontend && npm start & python main.py"]