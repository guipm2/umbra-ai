import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

def test_conn():
    url = os.getenv("DATABASE_URL")
    print(f"Connecting to: {url.split('@')[1] if url else 'None'}")
    try:
        with psycopg.connect(url) as conn:
            print("Connected successfully!")
            with conn.cursor() as cur:
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                print("Vector extension ensured.")
                conn.commit()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_conn()
