# Quick check script
import os
import requests
from dotenv import load_dotenv
load_dotenv()

# Use HTTP API directly
url = os.getenv('TURSO_DATABASE_URL').replace('libsql://', 'https://')
token = os.getenv('TURSO_AUTH_TOKEN')

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Query project statuses
query = {"statements": [{"q": "SELECT status, COUNT(*) as cnt FROM projects GROUP BY status"}]}
response = requests.post(url, headers=headers, json=query)
data = response.json()
print(f"Raw response: {data}")

print("\nProject Status Distribution:")
try:
    rows = data[0]["results"]["rows"]
    for row in rows:
        status = row[0]["value"] if isinstance(row[0], dict) else row[0]
        count = row[1]["value"] if isinstance(row[1], dict) else row[1]
        print(f"  {status}: {count}")
except Exception as e:
    print(f"  Error parsing: {e}")


