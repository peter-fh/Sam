FROM node:20 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm i
COPY frontend/ ./
RUN npm run build

FROM python:3.12
WORKDIR /app
COPY --from=frontend /app/frontend/dist ./static
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 5000
CMD ["python", "-m", "uvicorn", "server:app", "--interface", "wsgi", "--host", "0.0.0.0", "--port", "5000"]
