import os
import sys

# Set environment variables
os.environ['DATABASE_URL'] = 'sqlite:///E:/MegiLance/backend/local.db'
os.environ['ENVIRONMENT'] = 'development'
os.environ['SECRET_KEY'] = 'dev-secret-key-for-testing-only-change-in-production-12345'
os.environ['TURSO_AUTH_TOKEN'] = ''

# Change to backend directory
os.chdir('E:/MegiLance/backend')
sys.path.insert(0, 'E:/MegiLance/backend')

# Start the server
import uvicorn
from main import app

if __name__ == "__main__":
    print("Starting MegiLance backend server...")
    print("Server will be available at http://localhost:8000")
    print("API docs at http://localhost:8000/api/docs")
    print("Press Ctrl+C to stop")
    print("-" * 50)
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info", timeout_keep_alive=30)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}")
        input("Press Enter to exit...")
