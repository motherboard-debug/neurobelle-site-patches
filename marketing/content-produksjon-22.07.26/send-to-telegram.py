#!/usr/bin/env python3
"""
Send content-produksjon 22.07.26 til Avida-boten på Telegram.

KJØRES PÅ MAC MINI (der bot-tokenet ligger). Cloud-sesjonen når ikke Telegram,
så dette skriptet er broen: det leser token fra maskinens egne miljøvariabler,
og sender hver reel + captions-dokumentet til boten.

Nøkler leses KUN fra env — aldri hardkodet, aldri printet.

Sett før kjøring (eller ha dem allerede i Mac mini-ens secrets):
    export TELEGRAM_BOT_TOKEN="<avida-bot-token>"
    export TELEGRAM_CHAT_ID="<chat/kanal-id for Avida>"

Kjør:
    python3 send-to-telegram.py
"""

import os
import sys
import time
import json
import mimetypes
from pathlib import Path
from urllib import request as urlrequest

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

if not TOKEN or not CHAT_ID:
    sys.exit("Mangler TELEGRAM_BOT_TOKEN og/eller TELEGRAM_CHAT_ID i miljøet. "
             "Sett dem (se toppen av filen) og kjør på nytt.")

HERE = Path(__file__).resolve().parent
API = f"https://api.telegram.org/bot{TOKEN}"

# Fil -> individuell caption (samme tekst som content-produksjon-22.07.26.md)
CAPTIONS = {
    "R_tremor.mp4":
        "Ufrivillige skjelvinger i hender eller armer bagatelliseres av mange – men det kan "
        "være kroppens måte å be om hjelp på. 🤝 Grundig nevrologisk utredning gir svar.\n\n"
        "👉 Bestill time: neurobelleklinikk.com/bestill-time\n#nevrologi #skjelvinger #tremor #Oslo #Neurobelle",
    "R_vaksine.mp4":
        "Sommer = reise, og nye reisemål kan bety nye helserisiko. ✈️🌍 Vi går gjennom "
        "destinasjon, risiko og anbefalte reisevaksiner – i god tid.\n\n"
        "👉 Bestill vaksinetime: neurobelleklinikk.com/bestill-time\n#reisevaksine #vaksine #reisehelse #Neurobelle",
    "R_resept.mp4":
        "Glemt å fornye resepten? 💊 Snakk med lege på video og få digital resept – klar på "
        "nærmeste apotek, ofte under en halvtime.\n\n"
        "👉 Bestill time: neurobelleklinikk.com/bestill-time\n#digitalresept #nettlege #telehelse #Neurobelle",
    "R_livsstil.mp4":
        "Å ta grep om helsen handler om jevne, gode valg over tid – ikke dramatiske endringer. 🌿 "
        "Vekt, energi og blodsukker henger sammen, og vi hjelper deg se helheten.\n\n"
        "👉 Bestill time: neurobelleklinikk.com/bestill-time\n#livsstil #helse #forebygging #Neurobelle",
    "R_telehelse.mp4":
        "Noen dager er det ikke tid til venteværelse. 💻 Møt legen din på video – fra kontoret, "
        "hjemmet eller hytta. Samme faglige kvalitet, uten reisevei.\n\n"
        "👉 Bestill time: neurobelleklinikk.com/bestill-time\n#nettlege #videokonsultasjon #telehelse #Neurobelle",
    "AVIDA_5vaner.mp4":
        "Hjernen din eldes – men du påvirker tempoet. 🧠 Fem godt dokumenterte vaner: beveg deg, "
        "sov 7–9 t, hold kontakten, lær noe nytt, spis hjernevennlig.\n\n"
        "👉 Bestill kognitiv helsesjekk: neurobelleklinikk.com/bestill-time\n#hjernehelse #hukommelse #forebygging #Neurobelle",
    "AVIDA_blodsukker.mp4":
        "Blodsukker som svinger opp og ned påvirker energi, humør og konsentrasjon. 🩸 Med jevne "
        "måltider, bevegelse og oppfølging kan kurven flate ut.\n\n"
        "👉 Bestill konsultasjon: neurobelleklinikk.com/bestill-time\n#blodsukker #kosthold #energi #Neurobelle",
}


def _post_multipart(method: str, fields: dict, file_field: str, file_path: Path):
    """Minimal multipart/form-data POST uten eksterne avhengigheter."""
    boundary = "----NeurobelleBoundary7MA4YWxkTrZu0gW"
    body = bytearray()
    for k, v in fields.items():
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode()
        body += f"{v}\r\n".encode()
    data = file_path.read_bytes()
    ctype = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
    body += f"--{boundary}\r\n".encode()
    body += (f'Content-Disposition: form-data; name="{file_field}"; '
             f'filename="{file_path.name}"\r\n').encode()
    body += f"Content-Type: {ctype}\r\n\r\n".encode()
    body += data + b"\r\n"
    body += f"--{boundary}--\r\n".encode()

    req = urlrequest.Request(f"{API}/{method}", data=bytes(body))
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    with urlrequest.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode())


def send_video(path: Path, caption: str):
    return _post_multipart("sendVideo",
                           {"chat_id": CHAT_ID, "caption": caption, "supports_streaming": "true"},
                           "video", path)


def send_document(path: Path, caption: str = ""):
    return _post_multipart("sendDocument",
                           {"chat_id": CHAT_ID, "caption": caption},
                           "document", path)


def main():
    # 1) Header-melding
    header = ("📦 *Content-produksjon 22.07.26 – Neurobelle*\n"
              "7 videoer (5 KLINIKK-reels + 2 AVIDA motion-graphics) + captions-dokument.\n"
              "Alle uten lyd – legg på rolig musikk. Ingen VO bakt inn.")
    urlrequest.urlopen(urlrequest.Request(
        f"{API}/sendMessage",
        data=json.dumps({"chat_id": CHAT_ID, "text": header, "parse_mode": "Markdown"}).encode(),
        headers={"Content-Type": "application/json"}), timeout=60)

    # 2) Videoer med individuelle captions
    order = ["R_tremor.mp4", "R_vaksine.mp4", "R_resept.mp4", "R_livsstil.mp4",
             "R_telehelse.mp4", "AVIDA_5vaner.mp4", "AVIDA_blodsukker.mp4"]
    for name in order:
        p = HERE / name
        if not p.exists():
            print(f"[hopp over] fant ikke {name}")
            continue
        cap = CAPTIONS.get(name, name)
        r = send_video(p, cap)
        ok = r.get("ok")
        print(f"[{'OK' if ok else 'FEIL'}] {name}" + ("" if ok else f"  -> {r}"))
        time.sleep(2)  # snill mot Telegram rate-limit

    # 3) Captions-dokumentet
    md = HERE / "content-produksjon-22.07.26.md"
    if md.exists():
        r = send_document(md, "📄 Alle captions + compliance-notat")
        print(f"[{'OK' if r.get('ok') else 'FEIL'}] captions-dokument")

    print("Ferdig.")


if __name__ == "__main__":
    main()
