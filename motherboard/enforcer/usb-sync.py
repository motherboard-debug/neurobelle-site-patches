#!/usr/bin/env python3
"""
KaviyOS Batch-Enforcer — USB-leveranse (§4). KJØRES PÅ MAC MINI.

- Finner "Store 'n' Go"-USB under /Volumes/, pinner stien i state/usb-config.json
- USB ikke montert → synker fra motherboard/staging/ neste gang den detekteres
- Status "LEVERT" settes KUN etter vellykket USB-synk (§4.1)
- Struktur per §4.2; chmod-sjekk per §4.5

bruk: usb-sync.py <batch-mappe> <måned-slug f.eks. 2026-08-august>
"""
import json, os, shutil, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path

STATE_DIR = Path(__file__).resolve().parent.parent / "state"
USB_CFG = STATE_DIR / "usb-config.json"
STAGING = Path(__file__).resolve().parent.parent / "staging"


def find_usb():
    if USB_CFG.exists():
        pinned = json.loads(USB_CFG.read_text()).get("mount")
        if pinned and Path(pinned).is_dir():
            return Path(pinned)
    vol = Path("/Volumes")
    if vol.is_dir():
        for d in vol.iterdir():
            if "store" in d.name.lower() and d.is_dir():
                STATE_DIR.mkdir(parents=True, exist_ok=True)
                USB_CFG.write_text(json.dumps({"mount": str(d),
                                               "pinned_at": datetime.now(timezone.utc).isoformat()}))
                return d
    return None


def sync(src: Path, dst: Path):
    dst.mkdir(parents=True, exist_ok=True)
    subprocess.run(["rsync", "-a", "--delete", f"{src}/", f"{dst}/"], check=True)
    # §4.5: alt lesbart for Kaviyan
    subprocess.run(["chmod", "-R", "u+rwX,go+rX", str(dst)], check=True)


def main():
    if len(sys.argv) < 3:
        sys.exit("bruk: usb-sync.py <batch-mappe> <måned-slug>")
    batch, slug = Path(sys.argv[1]).resolve(), sys.argv[2]
    if not (batch / "AVVIK.md").exists():
        sys.exit("Nekter: kjør audit.py først (AVVIK.md mangler).")
    avvik = (batch / "AVVIK.md").read_text()
    if "**GRØNN**" not in avvik:
        sys.exit("Nekter: revisjonen er RØD. §5-korreksjon først.")

    usb = find_usb()
    target_rel = Path("neurobelle-content") / slug
    if usb is None:
        stage = STAGING / target_rel
        sync(batch, stage)
        print(f"USB ikke montert → staget i {stage}. Synkes automatisk neste kjøring med USB inne.")
        return
    # synk ev. tidligere staging først
    if (STAGING / "neurobelle-content").is_dir():
        sync(STAGING / "neurobelle-content", usb / "neurobelle-content")
        shutil.rmtree(STAGING / "neurobelle-content")
    dst = usb / target_rel
    sync(batch, dst)

    state_path = STATE_DIR / "batch-state.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {}
    key = batch.name
    state.setdefault(key, {})
    state[key].update({"status": "delivered", "usb_synced": True,
                       "delivered_at": datetime.now(timezone.utc).isoformat()})
    tmp = state_path.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2, ensure_ascii=False))
    os.replace(tmp, state_path)
    print(f"LEVERT ✅ → {dst}")


if __name__ == "__main__":
    main()
