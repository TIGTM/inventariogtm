import os
import time
import secrets
import hashlib
import threading
from collections import deque
from contextvars import ContextVar
from urllib.parse import urlsplit
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware

COOKIE = "patrimonio_session"
SESSION_SECONDS = 60 * 60 * 8
SESSIONS = {}
ATTEMPTS = {}
LOCK = threading.RLock()
AUDIT = ContextVar("audit", default={})
SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
ORIGIN = os.getenv("PUBLIC_ORIGIN", "http://localhost:8000").rstrip("/")
ALLOWED = {ORIGIN}
if not SECURE:
    ALLOWED.update({"http://localhost:8000", "http://127.0.0.1:8000"})

def session_for(request):
    token = request.cookies.get(COOKIE, "")
    with LOCK:
        record = SESSIONS.get(token)
        if not record or record["expires"] <= time.time():
            SESSIONS.pop(token, None)
            raise HTTPException(401, "Sessao expirada. Entre novamente.")
        return token, record

def require_sector(request, sector):
    token, record = session_for(request)
    if record["sector"] != sector:
        raise HTTPException(403, "Este acesso nao tem permissao para esta area.")
    AUDIT.set({"sector": sector, "session": hashlib.sha256(token.encode()).hexdigest()[:16],
               "ip": request.client.host if request.client else "unknown"})
    return token

def valid_password(password, encoded):
    try:
        algorithm, iterations, salt, digest = encoded.split(":")
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), int(iterations))
        return secrets.compare_digest(actual, bytes.fromhex(digest))
    except (ValueError, TypeError, AttributeError, UnicodeError):
        return False

def validate_fields(data, required=()):
    if not isinstance(data, dict) or len(data) > 80:
        raise HTTPException(422, "Dados invalidos.")
    for key, value in data.items():
        if not isinstance(key, str) or len(key) > 64 or not isinstance(value, str) or len(value) > 4000 or "\x00" in value:
            raise HTTPException(422, "Os campos devem conter textos de ate 4000 caracteres.")
        try:
            key.encode("utf-8")
            value.encode("utf-8")
        except UnicodeError:
            raise HTTPException(422, "Texto com codificacao invalida.")
    if any(not data.get(key, "").strip() for key in required):
        raise HTTPException(422, "Preencha patrimonio, categoria, marca e modelo.")
    return data

def valid_id(value):
    if not str(value).isascii() or not str(value).isdigit() or not 0 < int(value) < 9223372036854775807:
        raise HTTPException(422, "Identificador invalido.")

def install_security(app):
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=list({"localhost", "127.0.0.1", urlsplit(ORIGIN).hostname}))

    @app.middleware("http")
    async def protections(request, call_next):
        response = None
        if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            origin = request.headers.get("origin")
            if request.headers.get("x-gtm-request") != "1" or (origin and origin not in ALLOWED):
                response = JSONResponse({"detail": "Origem da requisicao recusada."}, status_code=403)
            else:
                body = bytearray()
                async for part in request.stream():
                    body.extend(part)
                    if len(body) > 131072:
                        response = JSONResponse({"detail": "Requisicao muito grande."}, status_code=413)
                        break
                if response is None:
                    request._body = bytes(body)
        if response is None:
            response = await call_next(request)
        response.headers.update({
            "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY",
            "Referrer-Policy": "no-referrer", "Cache-Control": "no-store",
            "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; connect-src 'self'",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()"})
        if SECURE:
            response.headers["Strict-Transport-Security"] = "max-age=31536000"
        return response

    @app.post("/api/login")
    def login(credentials: dict, request: Request):
        sector, password = credentials.get("setor"), credentials.get("senha")
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        with LOCK:
            for key in list(ATTEMPTS):
                while ATTEMPTS[key] and ATTEMPTS[key][0] <= now - 900:
                    ATTEMPTS[key].popleft()
                if not ATTEMPTS[key]:
                    del ATTEMPTS[key]
            for key in list(SESSIONS):
                if SESSIONS[key]["expires"] <= now:
                    del SESSIONS[key]
            key = ip
            if len(ATTEMPTS.get(key, ())) >= 10 or len(ATTEMPTS) >= 10000 or len(SESSIONS) >= 10000:
                raise HTTPException(429, "Muitas tentativas. Aguarde 15 minutos.", headers={"Retry-After": "900"})
            ATTEMPTS.setdefault(key, deque()).append(now)
        if sector not in ("TI", "MARKETING") or not isinstance(password, str) or len(password) > 512:
            raise HTTPException(401, "Setor ou senha incorretos.")
        if not valid_password(password, os.getenv(sector + "_PASSWORD_HASH", "")):
            raise HTTPException(401, "Setor ou senha incorretos.")
        token = secrets.token_urlsafe(32)
        with LOCK:
            old = request.cookies.get(COOKIE)
            SESSIONS.pop(old, None)
            SESSIONS[token] = {"sector": sector, "expires": now + SESSION_SECONDS}
        response = JSONResponse({"setor": sector})
        response.set_cookie(COOKIE, token, max_age=SESSION_SECONDS, httponly=True, secure=SECURE, samesite="strict", path="/")
        return response

    @app.get("/api/session")
    def session(request: Request):
        _, record = session_for(request)
        return {"setor": record["sector"]}

    @app.post("/api/logout")
    def logout(request: Request):
        with LOCK:
            SESSIONS.pop(request.cookies.get(COOKIE, ""), None)
        response = JSONResponse({"ok": True})
        response.delete_cookie(COOKIE, path="/", httponly=True, secure=SECURE, samesite="strict")
        return response
