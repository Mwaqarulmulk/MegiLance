# OpenAPI Export

> @AI-HINT: Instructions for exporting and using the auto-generated API specification

## Exporting the OpenAPI Spec

The backend auto-generates an OpenAPI 3.x specification from FastAPI route decorators and Pydantic schemas.

### Quick Export

```bash
# Start the backend
cd backend && uvicorn main:app --port 8000

# Download the spec
curl http://localhost:8000/openapi.json -o docs/api/openapi.json
```

### Interactive Docs

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Raw JSON**: http://localhost:8000/openapi.json

### Importing into Postman

1. Open Postman → **Import** → **Link**
2. Enter: `http://localhost:8000/openapi.json`
3. All endpoints with request/response schemas will be imported

### Importing into Insomnia

1. Open Insomnia → **Import** → **From URL**
2. Enter: `http://localhost:8000/openapi.json`

## Notes

- The spec is generated at runtime — always export from a running server to get the latest
- Auth endpoints require JWT bearer token (set in Postman via `Authorization` tab)
- Rate-limited endpoints include `X-RateLimit-*` response headers
