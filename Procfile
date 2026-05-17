release: cd backend && python -m alembic upgrade head
web: cd frontend && npm start
api: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2 --loop uvloop
