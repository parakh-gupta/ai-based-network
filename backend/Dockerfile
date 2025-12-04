FROM python:3.11-slim

WORKDIR /app

# Copy and install Python dependencies (rasa is NOT in requirements)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

EXPOSE 5000

CMD ["python", "app.py"]
