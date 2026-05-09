import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import ASCENDING

try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
except ImportError:
    AsyncIOScheduler = None

from app.config import settings
from app.database import get_database
from app.routes.ai_routes import router as ai_router
from app.routes.auth_routes import router as auth_router
from app.routes.beach_routes import router as beach_router
from app.routes.cluster_routes import router as cluster_router
from app.routes.condition_routes import router as condition_router
from app.routes.plan_routes import router as plan_router
from app.routes.rank_routes import router as rank_router
from app.routes.user_routes import router as user_router
from app.services.conditions_cache import refresh_conditions_cache

app = FastAPI(title="BeachPlease API")
logger = logging.getLogger("beachplease")
conditions_scheduler = (
    AsyncIOScheduler(timezone="Australia/Sydney")
    if AsyncIOScheduler is not None
    else None
)

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
app.include_router(cluster_router)


async def refresh_conditions_safely():
    db = get_database()
    if db is None:
        logger.warning("Skipping conditions refresh because MONGODB_URI is not configured")
        return

    try:
        await refresh_conditions_cache(db)
        logger.info("Conditions cache refreshed")
    except Exception as error:
        logger.exception("Conditions cache refresh failed: %s", error)


@app.on_event("startup")
async def startup():
    db = get_database()
    if db is not None:
        await db.users.create_index([("email", ASCENDING)], unique=True)
        await db.beaches.create_index([("slug", ASCENDING)], unique=True)
        await db.mood_clusters.create_index([("user_id", ASCENDING)])

    await refresh_conditions_safely()

    if conditions_scheduler is None:
        logger.warning("APScheduler is not installed; conditions cache will refresh on demand only")
        return

    if not conditions_scheduler.running:
        conditions_scheduler.add_job(
            refresh_conditions_safely,
            "interval",
            minutes=30,
            id="refresh_conditions_cache",
            replace_existing=True,
        )
        conditions_scheduler.start()


@app.on_event("shutdown")
async def shutdown():
    if conditions_scheduler is not None and conditions_scheduler.running:
        conditions_scheduler.shutdown(wait=False)


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
