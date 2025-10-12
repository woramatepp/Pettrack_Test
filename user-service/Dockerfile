FROM python:3.9
WORKDIR /app
COPY user-service/ .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["tail", "-f", "/dev/null"]
