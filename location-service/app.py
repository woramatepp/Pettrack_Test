import os
import psycopg2
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS

# --- Setup ---
app = Flask(__name__)
CORS(app)

#DATABASE_URL = "postgresql://`user`:`password`@localhost:5432/pettrack" # 👈 แก้ไขตรงนี้

# --- Routes ---
@app.route('/')
def index():
    try:
        return render_template_string(open('index.html', encoding='utf-8').read())
    except FileNotFoundError:
        return "Error: index.html not found.", 404
    
@app.route('/locations/latest', methods=['GET'])
def get_latest_location():
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT latitude, longitude, timestamp FROM locations ORDER BY timestamp DESC LIMIT 1")
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row:
        return {"message": "No location found"}, 404
    latitude, longitude, timestamp = row
    return {"latitude": latitude, "longitude": longitude, "timestamp": timestamp}

@app.route('/log_location', methods=['POST'])
def log_location():
    """รับข้อมูลและบันทึกลง PostgreSQL"""
    conn = None
    try:
        data = request.get_json()
        if not data or 'lat' not in data or 'lon' not in data:
            return jsonify({"status": "error", "message": "Missing lat/lon data"}), 400

        lat = data['lat']
        lon = data['lon']

        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        sql = "INSERT INTO locations (latitude, longitude) VALUES (%s, %s)"
        cursor.execute(sql, (lat, lon))
        
        conn.commit()
        cursor.close()

        print(f"✅ Logged to PostgreSQL: Lat={lat}, Lon={lon}")
        return jsonify({"status": "success", "message": "Location logged successfully"})

    except Exception as e:
        print(f"❌ SERVER ERROR: {e}") 
        return jsonify({"status": "error", "message": "An internal server error occurred."}), 500
    finally:
        if conn is not None:
            conn.close()

# --- Run Application ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
