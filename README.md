# BeachPlease

BeachPlease is an early-stage app for planning beach days.

## Project Structure

```text
beachplease/
  frontend/
  backend/
  README.md
  PRD.md
  .gitignore
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs at `http://localhost:5173`.

## Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "BeachPlease API is running"
}
```
