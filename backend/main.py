from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import ASCENDING

from app.config import settings
from app.database import get_database
from app.routes.ai_routes import router as ai_router
from app.routes.auth_routes import router as auth_router
from app.routes.beach_routes import router as beach_router
from app.routes.condition_routes import router as condition_router
from app.routes.plan_routes import router as plan_router
from app.routes.rank_routes import router as rank_router
from app.routes.user_routes import router as user_router

app = FastAPI(title="BeachPlease API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(beach_router)
app.include_router(condition_router)
app.include_router(rank_router)
app.include_router(ai_router)
app.include_router(plan_router)


@app.on_event("startup")
async def create_indexes():
    db = get_database()
    if db is not None:
        await db.users.create_index([("email", ASCENDING)], unique=True)
        await db.beaches.create_index([("slug", ASCENDING)], unique=True)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "BeachPlease API is running",
    }


@app.get("/db-check")
async def db_check():
    db = get_database()

    if db is None:
        return {
            "database": "error",
            "message": "MONGODB_URI is not configured",
        }

    try:
        await db.command("ping")
        return {
            "database": "connected",
        }
    except Exception as error:
        return {
            "database": "error",
            "message": f"MongoDB connection failed: {error}",
        }
