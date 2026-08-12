from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

STATIC_DIR = ROOT_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class Subscriber(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    source: str = "landing"
    created_at: str = Field(default_factory=_now_iso)


class SubscribeIn(BaseModel):
    email: EmailStr
    source: Optional[str] = "landing"


class DropNotify(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    product_id: str
    product_name: str
    created_at: str = Field(default_factory=_now_iso)


class DropNotifyIn(BaseModel):
    email: EmailStr
    product_id: str
    product_name: str


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "yiruda.api.alive"}


@api_router.post("/subscribe", response_model=Subscriber)
async def subscribe(payload: SubscribeIn):
    existing = await db.subscribers.find_one({"email": payload.email})
    if existing:
        existing.pop("_id", None)
        return Subscriber(**existing)
    sub = Subscriber(email=payload.email, source=payload.source or "landing")
    await db.subscribers.insert_one(sub.model_dump())
    return sub


@api_router.get("/subscribers", response_model=List[Subscriber])
async def list_subscribers():
    docs = await db.subscribers.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.post("/drops/notify", response_model=DropNotify)
async def drops_notify(payload: DropNotifyIn):
    existing = await db.drop_notifies.find_one(
        {"email": payload.email, "product_id": payload.product_id}
    )
    if existing:
        existing.pop("_id", None)
        return DropNotify(**existing)
    notify = DropNotify(
        email=payload.email,
        product_id=payload.product_id,
        product_name=payload.product_name,
    )
    await db.drop_notifies.insert_one(notify.model_dump())
    return notify


@api_router.get("/drops/notify", response_model=List[DropNotify])
async def list_drop_notifies():
    docs = await db.drop_notifies.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/drops")
async def list_drops():
    """Static catalog for now."""
    return {
        "drops": [
            {
                "id": "octopus-pink-01",
                "name": "Octopus Tee",
                "price": "$45",
                "image": "/static/products/octo-design-redo.png",
                "has_secret_variant": False,
                "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "sizes": ["S", "M", "L"],
                "colors": [{"name": "Blush Crimson", "hex": "#C9536A"}],
            },
        ]
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
