import logging
import os
import time
from collections import defaultdict, deque
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse, PlainTextResponse


load_dotenv()

app = FastAPI(title="WeChat Bot Local RAG Demo Webhook")


# Adapted from classmate message filter logic:
# - Skip non-text payloads
# - Avoid bot self-loop responses
# - Only route analyzable text into AI backend
VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "")
ACCESS_TOKEN = os.getenv("WHATSAPP_PAGE_ACCESS_TOKEN", "")
LOCAL_RAG_URL = os.getenv("LOCAL_RAG_URL", "http://127.0.0.1:7860/api/analyze")
GRAPH_API_VERSION = os.getenv("WHATSAPP_GRAPH_API_VERSION", "v20.0")
GRAPH_BASE_URL = os.getenv("WHATSAPP_GRAPH_BASE_URL", "https://graph.facebook.com")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "25"))


# Simple in-memory sender rate limit for demo safety.
# Pattern equivalent to classmate's anti-spam guard intent, but explicit for webhook mode.
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "30"))
RATE_LIMIT_MAX_MESSAGES = int(os.getenv("RATE_LIMIT_MAX_MESSAGES", "5"))
MIN_MESSAGE_LENGTH = int(os.getenv("MIN_MESSAGE_LENGTH", "2"))
_sender_message_times: Dict[str, deque] = defaultdict(deque)
DEFAULT_CASES_FALLBACK_MESSAGE = (
    "1. No retrieved case titles were returned.\n"
    "2. The local backend may require retrieval output mapping.\n"
    "3. This is acceptable for demo fallback."
)


logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("whatsapp-webhook")


def _normalize_phone(raw_value: Optional[str]) -> str:
    if not raw_value:
        return ""
    return "".join(ch for ch in raw_value if ch.isdigit())


def _is_rate_limited(sender_id: str) -> bool:
    now = time.time()
    queue = _sender_message_times[sender_id]
    while queue and now - queue[0] > RATE_LIMIT_WINDOW_SECONDS:
        queue.popleft()
    if len(queue) >= RATE_LIMIT_MAX_MESSAGES:
        return True
    queue.append(now)
    return False


def _extract_messages(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    extracted: List[Dict[str, Any]] = []
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            metadata = value.get("metadata", {})
            business_phone_number = _normalize_phone(metadata.get("display_phone_number"))
            phone_number_id = metadata.get("phone_number_id")
            for msg in value.get("messages", []):
                extracted.append(
                    {
                        "message": msg,
                        "phone_number_id": phone_number_id,
                        "business_phone_number": business_phone_number,
                    }
                )
    return extracted


def _normalize_score(raw_result: Dict[str, Any]) -> float:
    if "fraud_score" in raw_result:
        value = float(raw_result["fraud_score"])
    else:
        probability = raw_result.get("probability", 0)
        probability = float(probability)
        if probability <= 1:
            value = probability * 10
        elif probability <= 100:
            value = probability / 10
        else:
            value = 10.0
    return max(0.0, min(10.0, value))


def _extract_top_cases(raw_result: Dict[str, Any]) -> List[str]:
    for key in ("top_cases", "retrieved_cases", "case_titles", "evidence_titles"):
        values = raw_result.get(key)
        if isinstance(values, list):
            cleaned = [str(v).strip() for v in values if str(v).strip()]
            if cleaned:
                return cleaned[:3]
    evidence = str(raw_result.get("evidence", "")).strip()
    if evidence:
        lines = [line.strip("-• \t") for line in evidence.splitlines() if line.strip()]
        return lines[:3]
    return []


def _build_demo_reply(raw_result: Dict[str, Any]) -> str:
    score = _normalize_score(raw_result)
    reason = str(raw_result.get("reason", "No justification was returned by the local RAG backend.")).strip()
    top_cases = _extract_top_cases(raw_result)
    if top_cases:
        cases_text = "\n".join([f"{idx + 1}. {title}" for idx, title in enumerate(top_cases)])
    else:
        cases_text = DEFAULT_CASES_FALLBACK_MESSAGE
    return (
        "🛡️ Fraud Detection Demo (Local RAG via ngrok)\n\n"
        f"Fraud Score (0-10): {score:.1f}\n\n"
        f"Justification:\n{reason}\n\n"
        f"Top-3 Retrieved Case Titles:\n{cases_text}\n\n"
        "Note: This endpoint is configured for presentation demo use, not production infrastructure."
    )


def _call_local_rag(user_text: str) -> Dict[str, Any]:
    try:
        response = requests.post(
            LOCAL_RAG_URL,
            json={"message": user_text},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.Timeout as exc:
        raise HTTPException(status_code=504, detail="Local RAG backend timed out.") from exc
    except requests.exceptions.ConnectionError as exc:
        raise HTTPException(
            status_code=503,
            detail="Local RAG backend is unreachable (ngrok/backend disconnect).",
        ) from exc
    except requests.exceptions.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Local RAG backend HTTP error: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Local RAG backend returned invalid JSON.") from exc

    if not isinstance(data, dict):
        raise HTTPException(status_code=502, detail="Local RAG backend returned non-object payload.")
    return data


def _send_whatsapp_text(phone_number_id: str, to: str, body: str) -> None:
    if not ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="Missing WHATSAPP_PAGE_ACCESS_TOKEN.")
    if not phone_number_id:
        raise HTTPException(status_code=400, detail="Missing WhatsApp phone_number_id in webhook payload.")

    url = f"{GRAPH_BASE_URL}/{GRAPH_API_VERSION}/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"preview_url": False, "body": body},
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=REQUEST_TIMEOUT_SECONDS)
        if resp.status_code == 429:
            raise HTTPException(status_code=429, detail="WhatsApp API rate limit reached.")
        resp.raise_for_status()
    except requests.exceptions.Timeout as exc:
        raise HTTPException(status_code=504, detail="WhatsApp send timeout.") from exc
    except requests.exceptions.ConnectionError as exc:
        raise HTTPException(status_code=503, detail="Network error while sending WhatsApp reply.") from exc
    except requests.exceptions.HTTPError as exc:
        body_text = ""
        try:
            body_text = resp.text
        except Exception:
            body_text = "(unavailable)"
        raise HTTPException(status_code=502, detail=f"WhatsApp API error: {exc}; body={body_text}") from exc


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/webhook")
def verify_webhook(
    hub_mode: str = Query(default="", alias="hub.mode"),
    hub_verify_token: str = Query(default="", alias="hub.verify_token"),
    hub_challenge: str = Query(default="", alias="hub.challenge"),
):
    # WhatsApp Cloud API verification flow (GET challenge)
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return PlainTextResponse(content=hub_challenge, status_code=200)
    raise HTTPException(status_code=403, detail="Webhook verification failed.")


@app.post("/webhook")
async def receive_webhook(request: Request):
    # Adapted from classmate routing: parse inbound message payload, skip invalid/non-text messages,
    # prevent bot self-loop, then route text to local RAG and return response to original sender.
    try:
        payload = await request.json()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.") from exc

    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Payload must be a JSON object.")

    messages = _extract_messages(payload)
    if not messages:
        return JSONResponse(content={"status": "ignored", "reason": "No inbound messages"}, status_code=200)

    processed = 0
    ignored = 0
    errors: List[str] = []

    for item in messages:
        msg = item["message"]
        phone_number_id = item["phone_number_id"]
        business_phone_number = item["business_phone_number"]

        msg_type = msg.get("type")
        sender = _normalize_phone(msg.get("from"))
        text_obj = msg.get("text", {})
        user_text = str(text_obj.get("body", "")).strip() if isinstance(text_obj, dict) else ""

        if msg_type != "text" or not user_text:
            ignored += 1
            continue

        # Self-loop prevention: ignore if sender appears to be the same business account.
        if sender and business_phone_number and sender == business_phone_number:
            ignored += 1
            continue

        if len(user_text) < MIN_MESSAGE_LENGTH:
            ignored += 1
            continue

        if _is_rate_limited(sender):
            try:
                _send_whatsapp_text(
                    phone_number_id=phone_number_id,
                    to=sender,
                    body="Rate limit reached. Please retry in a short while.",
                )
            except HTTPException as exc:
                errors.append(f"rate-limit-notice-failed:{sender}:{exc.detail}")
            ignored += 1
            continue

        try:
            rag_output = _call_local_rag(user_text)
            reply_text = _build_demo_reply(rag_output)
            _send_whatsapp_text(phone_number_id=phone_number_id, to=sender, body=reply_text)
            processed += 1
        except HTTPException as exc:
            logger.exception("Message processing failed for sender=%s", sender)
            errors.append(f"{sender}:{exc.detail}")
        except Exception as exc:
            logger.exception("Unexpected processing error for sender=%s", sender)
            errors.append(f"{sender}:unexpected-error:{str(exc)}")

    result = {
        "status": "ok",
        "processed": processed,
        "ignored": ignored,
        "errors": errors,
    }
    return JSONResponse(content=result, status_code=200)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
