import certifi
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


client = (
    AsyncIOMotorClient(
        settings.mongodb_uri,
        tls=True,
        tlsCAFile=certifi.where(),
    )
    if settings.mongodb_uri
    else None
)


def get_database():
    if client is None:
        return None

    return client[settings.database_name]