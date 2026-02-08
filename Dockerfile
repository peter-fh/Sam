FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm i
COPY frontend/ ./
RUN npm run build

FROM alpine:3.14 AS prompts
WORKDIR /app
RUN apk add --no-cache git
RUN git clone https://github.com/peter-fh/Sam-Prompts.git repo
RUN cp -r repo/prompts ./prompts

FROM python:3.12-slim
WORKDIR /app
COPY --from=frontend /app/frontend/dist ./static
COPY --from=prompts /app/prompts ./prompts
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 5000
CMD ["python", "-m", "uvicorn", "app:app", "--interface", "wsgi", "--host", "0.0.0.0", "--port", "5000"]
