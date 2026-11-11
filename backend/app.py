"""Local-only image background removal API. No storage, no database."""
from __future__ import annotations

import io
import os
from functools import lru_cache

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image, ImageOps, UnidentifiedImageError
from rembg import new_session, remove

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
MAX_PIXELS = 20_000_000
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MODEL = os.environ.get("BG_MODEL", "u2net")
# Explicit allowlist prevents accidentally switching to a restricted-license model.
if MODEL not in {"u2net", "u2netp", "isnet-general-use"}:
    raise RuntimeError("BG_MODEL must be u2net, u2netp, or isnet-general-use")

app = FastAPI(title="ChanSeller local image worker", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["content-type"],
)

@lru_cache(maxsize=1)
def session():
    # First call may download model weights to the user's ~/.u2net cache.
    return new_session(MODEL)

@app.get("/health")
def health():
    return {"ok": True, "model": MODEL, "storage": "none", "database": "none"}

def process_image(data: bytes) -> bytes:
    with Image.open(io.BytesIO(data)) as source:
        if source.width * source.height > MAX_PIXELS:
            raise ValueError("Image is too large. Maximum 20 megapixels.")
        original = ImageOps.exif_transpose(source).convert("RGBA")
        result = remove(original, session=session())
        output = io.BytesIO()
        result.save(output, format="PNG", optimize=True)
        return output.getvalue()

@app.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, "Only JPG, PNG, and WebP are supported.")
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    await file.close()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Max upload is 8 MB.")
    if not data:
        raise HTTPException(400, "Empty image.")
    try:
        image = await run_in_threadpool(process_image, data)
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        # Avoid disclosing file contents, stack traces or local paths.
        raise HTTPException(503, "The local image model could not run. Check the worker terminal.") from exc
    return Response(image, media_type="image/png",
                    headers={"Cache-Control": "no-store"})
