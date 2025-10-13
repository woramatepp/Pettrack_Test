import os
import psycopg2
import time
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from pyngrok import ngrok

# --------------------
# 1. INITIALIZATION
# --------------------
app = Flask(__name__)
CORS(app)

# Default to the docker-compose service name 'postgres_c'
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost:5432/pettrack")


# --------------------
# 2. DATABASE SETUP LOGIC
# --------------------
def setup_database(db_url):
    """
    Connects to the database and ensures the 'locations' table exists.
    Includes a retry mechanism for connecting to the database.
    """
    conn = None
    max_retries = 10
    
    print("Starting database setup...")
    
    # Retry loop to wait for the PostgreSQL container to be ready
    for i in range(max_retries):
        try:
            # Attempt to connect
            conn = psycopg2.connect(db_url, connect_timeout=5)
            print(f"✅ Database connection successful on attempt {i+1}.")
            
            cursor = conn.cursor()
            
            # SQL command to create the table if it does not exist
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS locations (
                id SERIAL PRIMARY KEY,
                device_id VARCHAR(255),
                latitude DECIMAL(10, 8) NOT NULL,
                longitude DECIMAL(11, 8) NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """
            cursor.execute(create_table_sql)
            conn.commit()
            cursor.close()
            print("✅ 'locations' table ensured to exist (created if not present).")
            return # Exit function successfully

        except psycopg2.OperationalError as e:
            if i < max_retries - 1:
                print(f"❌ Database not ready yet. Retrying in 2 seconds... ({i+1}/{max_retries})")
                time.sleep(2)
            else:
                print(f"❌ Failed to connect to database after {max_retries} attempts: {e}")
                raise e # Re-raise error if all attempts fail
        
        except Exception as e:
            print(f"❌ UNEXPECTED DATABASE SETUP ERROR: {e}")
            raise e
            
    finally:
        if conn is not None:
            conn.close()


# --------------------
# 3. ROUTES
# --------------------

@app.route('/')
def index():
    # Assuming index.html is in the same directory as app.py
    try:
        return render_template_string(open('index.html', encoding='utf-8').read())
    except FileNotFoundError:
        return "Error: index.html not found.", 404
        
@app.route('/locations/latest', methods=['GET'])
def get_latest_location():
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        cursor.execute("SELECT latitude, longitude, timestamp FROM locations ORDER BY timestamp DESC LIMIT 1")
        row = cursor.fetchone()
        cursor.close()
        
        if not row:
            return {"message": "No location found"}, 404
            
        latitude, longitude, timestamp = row
        return {"latitude": latitude, "longitude": longitude, "timestamp": timestamp}
        
    except Exception as e:
        print(f"❌ GET LOCATION ERROR: {e}")
        return jsonify({"status": "error", "message": "Database query failed."}), 500
    finally:
        if conn is not None:
            conn.close()


@app.route('/log_location', methods=['POST'])
def log_location():
    conn = None
    try:
        data = request.get_json()
        if not data or 'lat' not in data or 'lon' not in data:
            return jsonify({"status": "error", "message": "Missing lat/lon data"}), 400

        lat = data['lat']
        lon = data['lon']

        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # IMPORTANT: Ensure your POST request includes all necessary fields (lat, lon)
        sql = "INSERT INTO locations (latitude, longitude) VALUES (%s, %s)"
        cursor.execute(sql, (lat, lon))
        
        conn.commit()
        cursor.close()

        print(f"✅ Logged to PostgreSQL: Lat={lat}, Lon={lon}")
        return jsonify({"status": "success", "message": "Location logged successfully"})

    except Exception as e:
        print(f"❌ SERVER ERROR during logging: {e}")
        # Note: If this fails, the most common reason is that the 'locations' table 
        # was not created successfully during startup.
        return jsonify({"status": "error", "message": "An internal server error occurred."}), 500
    finally:
        if conn is not None:
            conn.close()


# --------------------
# 4. ENTRY POINT
# --------------------

if __name__ == '__main__':
    # 1. Set up the database (creates table if it doesn't exist)
    # This must run before the app starts serving requests.
    setup_database(DATABASE_URL)

    try:
        # 2. Initialize ngrok if NGROK_AUTHTOKEN is set
        if os.environ.get("NGROK_AUTHTOKEN"):
            listener = ngrok.connect(5000)
            print("-" * 50)
            print(f"*** NGROK TUNNEL ESTABLISHED ***")
            print(f"Public URL: {listener.public_url}")
            print("-" * 50)
        else:
            print("⚠️ NGROK_AUTHTOKEN not set. Running locally only.")
            
        # 3. Start the Flask application
        app.run(host='0.0.0.0', port=5000, debug=False)

    except Exception as e:
        print(f"❌ NGROK/FLASK STARTUP ERROR: {e}")
