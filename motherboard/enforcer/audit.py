#!/usr/bin/env python3
"""
KaviyOS Batch-Enforcer — revisjonsfasen (§3).
Mekanisk verifisering fra disk og logger. Runnerens påstander ignoreres.

Kjøres:  python3 audit.py <batch-mappe> [--logs <produksjonslogg.jsonl>]
Output:  AVVIK.md i batch-mappen + exit code (0=GRØNN, 1=RØD)
         Oppdaterer motherboard/state/batch-state.json atomisk.

Prinsipp (§3.7): Tvil = RØD. Dette skriptet kan aldri "runde opp" til grønn.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

# ── kvoter (§2) ───────────────────────────────────────────────────────────────
QUOTAS = {
    "heygen_avatar_reels_min": 2,
    "kling_videos_min": 2,
    "canva_designs_min": 4,
    "bloom_max_pct": 40.0,
    "vo_coverage_pct": 100.0,   # ElevenLabs VO på alle videoer
}
KAVIYAN_VOICE_ID = "C1c7CqjK4oN7wzaohHfr"

# Video-definisjon (§2, hard): >=2 scener, lydspor, ellers teller den ikke.
SCENE_THRESHOLD = 0.30      # ffmpeg scene-score
MIN_SCENES = 2              # distinkte scener (1 sceneskifte => 2 scener)
DUR_MIN, DUR_MAX = 15.0, 90.0   # anbefalt 25–45; hard grense romsligere

VALID_ENGINES = {"heygen", "kling", "canva", "bloom", "elevenlabs",
                 "ffmpeg", "hyperframes", "local-engine"}

BLOCKLIST_PAT = re.compile(
    r"pollen|gress|blomster|vaffel|frokost|mat-?flat|kaffe|stearinlys|candle|"
    r"spa|såpe|soap|skog|forest|hav\b|ocean|fjell|mountain|fjord|natur",
    re.IGNORECASE,
)


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=300)


def ffprobe_meta(path):
    """Varighet + har lydspor."""
    r = sh(["ffprobe", "-v", "error", "-show_entries",
            "format=duration:stream=codec_type", "-of", "json", str(path)])
    if r.returncode != 0:
        return None
    d = json.loads(r.stdout)
    dur = float(d.get("format", {}).get("duration", 0) or 0)
    has_audio = any(s.get("codec_type") == "audio" for s in d.get("streams", []))
    return {"duration": dur, "has_audio": has_audio}


def count_scenes(path):
    """Teller sceneskift via ffmpeg select=gt(scene,T). Returnerer antall scener."""
    r = sh(["ffmpeg", "-hide_banner", "-i", str(path),
            "-vf", f"select='gt(scene,{SCENE_THRESHOLD})',showinfo",
            "-f", "null", "-"])
    cuts = len(re.findall(r"showinfo.*pts_time", r.stderr))
    return cuts + 1  # N kutt => N+1 scener


def load_logs(log_path):
    """Produksjonslogg: JSONL med {engine, api_ref, timestamp, file}."""
    entries = []
    if log_path and Path(log_path).exists():
        for line in Path(log_path).read_text().splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return entries


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", dir=path.parent, delete=False) as tmp:
        json.dump(data, tmp, indent=2, ensure_ascii=False)
        tmpname = tmp.name
    os.replace(tmpname, path)


def main():
    if len(sys.argv) < 2:
        sys.exit("bruk: audit.py <batch-mappe> [--logs <logg.jsonl>]")
    batch = Path(sys.argv[1]).resolve()
    log_path = None
    if "--logs" in sys.argv:
        log_path = sys.argv[sys.argv.index("--logs") + 1]

    fails, warns = [], []
    manifest_path = batch / "manifest.json"

    # ── 3.1 manifest finnes + skjema ──────────────────────────────────────────
    if not manifest_path.exists():
        fails.append("3.1 manifest.json mangler i batch-mappen — alt annet er uverifiserbart")
        assets = []
    else:
        try:
            manifest = json.loads(manifest_path.read_text())
            assets = manifest.get("assets", [])
        except json.JSONDecodeError as e:
            fails.append(f"3.1 manifest.json er ugyldig JSON: {e}")
            assets = []
        for i, a in enumerate(assets):
            missing = [k for k in ("file", "engine", "api_ref", "timestamp",
                                   "format_id", "tema") if k not in a]
            if missing:
                fails.append(f"3.1 asset[{i}] ({a.get('file','?')}) mangler felt: {missing}")
            if a.get("engine") not in VALID_ENGINES:
                fails.append(f"3.1 asset[{i}] ukjent engine «{a.get('engine')}»")

    # ── 3.2 manifest ↔ disk ───────────────────────────────────────────────────
    disk_files = {p.relative_to(batch).as_posix()
                  for p in batch.rglob("*")
                  if p.is_file() and p.suffix.lower() in
                  {".mp4", ".png", ".jpg", ".jpeg", ".mp3", ".wav", ".webm", ".mov"}}
    man_files = {a["file"] for a in assets if "file" in a}
    for f in sorted(man_files - disk_files):
        fails.append(f"3.2 i manifest men IKKE på disk: {f}")
    for f in sorted(disk_files - man_files):
        fails.append(f"3.2 spøkelsesfil på disk uten manifest-oppføring: {f}")

    # ── 3.3 engine-påstand ↔ logg ────────────────────────────────────────────
    logs = load_logs(log_path)
    logged = {(e.get("engine"), e.get("file")) for e in logs}
    api_engines = {"heygen", "kling", "canva", "bloom", "elevenlabs"}
    for a in assets:
        eng = a.get("engine")
        if eng in api_engines and (eng, a.get("file")) not in logged:
            fails.append(f"3.3 LØGN-DETEKSJON: manifest sier «{eng}» for "
                         f"{a.get('file')} men ingen logglinje bekrefter det")

    # ── 3.6 video-definisjon (kjøres før 3.4 så kvotene teller riktig) ───────
    qualifying_videos, disqualified = [], []
    for a in assets:
        f = a.get("file", "")
        if not f.lower().endswith((".mp4", ".webm", ".mov")):
            continue
        p = batch / f
        if not p.exists():
            continue
        meta = ffprobe_meta(p)
        if meta is None:
            disqualified.append((f, "ffprobe feilet"))
            continue
        scenes = count_scenes(p)
        reasons = []
        if scenes < MIN_SCENES:
            reasons.append(f"{scenes} scene(r) < {MIN_SCENES}")
        if not meta["has_audio"]:
            reasons.append("stum (ingen lydspor)")
        if not (DUR_MIN <= meta["duration"] <= DUR_MAX):
            reasons.append(f"varighet {meta['duration']:.1f}s utenfor {DUR_MIN}-{DUR_MAX}s")
        # Kaviyans spec-endring 2026-08-07 (beskjed i story-motion-mappen):
        # story-motion-videoer skal ha bakgrunnsmusikk, IKKE voice-over.
        # Lydspor-kravet består; vo_voice_id kreves kun utenfor story-motion/.
        if not f.startswith("story-motion/"):
            vo = a.get("vo_voice_id")
            if vo != KAVIYAN_VOICE_ID:
                reasons.append(f"VO mangler/feil voice_id ({vo or 'ingen'})")
        if reasons:
            disqualified.append((f, "; ".join(reasons)))
        else:
            qualifying_videos.append(a)

    # ── 3.4 kvoter ────────────────────────────────────────────────────────────
    n = {"heygen": 0, "kling": 0, "canva": 0, "bloom": 0}
    for a in assets:
        eng = a.get("engine")
        if eng in n:
            n[eng] += 1
    heygen_videos = sum(1 for a in qualifying_videos if a.get("engine") == "heygen")
    kling_videos = sum(1 for a in qualifying_videos if a.get("engine") == "kling")
    total = len(assets)
    bloom_pct = (n["bloom"] / total * 100) if total else 0.0

    if heygen_videos < QUOTAS["heygen_avatar_reels_min"]:
        fails.append(f"3.4 KVOTE heygen: {heygen_videos}/{QUOTAS['heygen_avatar_reels_min']} kvalifiserende avatar-reels")
    if kling_videos < QUOTAS["kling_videos_min"]:
        fails.append(f"3.4 KVOTE kling: {kling_videos}/{QUOTAS['kling_videos_min']} kvalifiserende motion-videoer")
    if n["canva"] < QUOTAS["canva_designs_min"]:
        fails.append(f"3.4 KVOTE canva: {n['canva']}/{QUOTAS['canva_designs_min']} design med eksportfil på disk")
    if bloom_pct > QUOTAS["bloom_max_pct"]:
        fails.append(f"3.4 KVOTE bloom: {bloom_pct:.0f}% > maks {QUOTAS['bloom_max_pct']:.0f}%")
    all_videos = [a for a in assets
                  if a.get("file", "").lower().endswith((".mp4", ".webm", ".mov"))]
    if all_videos and len(qualifying_videos) < len(all_videos):
        fails.append(f"3.4 VO-dekning: {len(qualifying_videos)}/{len(all_videos)} "
                     f"videoer oppfyller video-definisjonen (se 3.6-listen)")

    # ── 3.5 blokkliste-heuristikk på tema/filnavn ────────────────────────────
    for a in assets:
        blob = f"{a.get('file','')} {a.get('tema','')}"
        m = BLOCKLIST_PAT.search(blob)
        if m:
            warns.append(f"3.5 mulig blokkliste-treff «{m.group(0)}» i {a.get('file')} — krever manuell G6-sjekk")

    # ── resultat ──────────────────────────────────────────────────────────────
    status = "green" if not fails else "red"
    now = datetime.now(timezone.utc).isoformat()

    avvik = [f"# AVVIK.md — batch-revisjon {batch.name}",
             f"Kjørt: {now} · Resultat: **{'GRØNN' if status=='green' else 'RØD'}**", ""]
    if fails:
        avvik.append("## Feil (blokkerer leveranse)")
        avvik += [f"- ❌ {f}" for f in fails]
    if disqualified:
        avvik.append("\n## 3.6 Diskvalifiserte videoer (teller ikke mot kvote)")
        avvik += [f"- 🚫 `{f}` — {r}" for f, r in disqualified]
    if warns:
        avvik.append("\n## Advarsler (manuell sjekk)")
        avvik += [f"- ⚠️ {w}" for w in warns]
    avvik.append(f"\n## Telling\n"
                 f"- Totalt assets: {total}\n"
                 f"- heygen: {n['heygen']} (kvalifiserende video: {heygen_videos})\n"
                 f"- kling: {n['kling']} (kvalifiserende video: {kling_videos})\n"
                 f"- canva: {n['canva']}\n"
                 f"- bloom: {n['bloom']} ({bloom_pct:.0f}% — cap {QUOTAS['bloom_max_pct']:.0f}%)\n"
                 f"- kvalifiserende videoer totalt: {len(qualifying_videos)}")
    (batch / "AVVIK.md").write_text("\n".join(avvik), encoding="utf-8")

    state_path = Path(__file__).resolve().parent.parent / "state" / "batch-state.json"
    state = {}
    if state_path.exists():
        try:
            state = json.loads(state_path.read_text())
        except json.JSONDecodeError:
            state = {}
    state[batch.name] = {
        "batch": batch.name,
        "status": "auditing",
        "counts": {**n, "bloom_pct": round(bloom_pct, 1),
                   "qualifying_videos": len(qualifying_videos)},
        "audit": status,
        "audited_at": now,
    }
    atomic_write(state_path, state)

    print(f"AUDIT: {'GRØNN ✅' if status=='green' else 'RØD ❌'} "
          f"({len(fails)} feil, {len(warns)} advarsler) → {batch/'AVVIK.md'}")
    sys.exit(0 if status == "green" else 1)


if __name__ == "__main__":
    main()
