"""Backend tests for Yiruda landing + drops APIs."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Health
def test_root_alive(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("message") == "yiruda.api.alive"


# Subscribe
def test_subscribe_valid(session):
    email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
    r = session.post(f"{API}/subscribe", json={"email": email, "source": "landing"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == email
    assert data["source"] == "landing"
    assert "id" in data and isinstance(data["id"], str)
    assert "created_at" in data


def test_subscribe_idempotent(session):
    email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
    r1 = session.post(f"{API}/subscribe", json={"email": email})
    assert r1.status_code == 200
    r2 = session.post(f"{API}/subscribe", json={"email": email})
    assert r2.status_code == 200
    assert r1.json()["id"] == r2.json()["id"]


def test_subscribe_invalid_email(session):
    r = session.post(f"{API}/subscribe", json={"email": "not-an-email"})
    assert 400 <= r.status_code < 500


def test_list_subscribers(session):
    email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
    session.post(f"{API}/subscribe", json={"email": email})
    r = session.get(f"{API}/subscribers")
    assert r.status_code == 200
    emails = [d["email"] for d in r.json()]
    assert email in emails


# Drops catalog
def test_get_drops(session):
    r = session.get(f"{API}/drops")
    assert r.status_code == 200
    drops = r.json().get("drops", [])
    ids = [d["id"] for d in drops]
    assert "octopus-pink-01" in ids
    assert "lotus-bikini-01" in ids
    assert len(drops) == 2
    octo = next(d for d in drops if d["id"] == "octopus-pink-01")
    assert octo.get("has_secret_variant") is True
    assert octo.get("secret_image")


# Drop notify
def test_drops_notify_valid(session):
    email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": email, "product_id": "octopus-pink-01", "product_name": "Octopus Tee"}
    r = session.post(f"{API}/drops/notify", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == email
    assert data["product_id"] == "octopus-pink-01"


def test_drops_notify_idempotent(session):
    email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": email, "product_id": "lotus-bikini-01", "product_name": "Lotus Bikini"}
    r1 = session.post(f"{API}/drops/notify", json=payload)
    r2 = session.post(f"{API}/drops/notify", json=payload)
    assert r1.status_code == 200 and r2.status_code == 200
    assert r1.json()["id"] == r2.json()["id"]


def test_drops_notify_invalid_email(session):
    r = session.post(f"{API}/drops/notify", json={"email": "bad", "product_id": "x", "product_name": "y"})
    assert 400 <= r.status_code < 500


def test_list_drop_notifies(session):
    r = session.get(f"{API}/drops/notify")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
