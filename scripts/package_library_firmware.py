#!/usr/bin/env python3
"""Package a successfully built custom X4 Pro app with its exact source patch."""

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess


ROOT = Path(__file__).resolve().parents[1]
BASE = "9914146eeae7b46b300f475a16c32426fc02ec1f"
SDK = "699370183fa3a0e33c9cb83a36f701bbb6022095"
NAME = "firmware-x4-pro-v1.6.1-library.5.bin"


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def main() -> None:
    subprocess.run(["git", "merge-base", "--is-ancestor", BASE, "HEAD"], cwd=ROOT, check=True)
    if git("rev-parse", "HEAD:freeink-sdk") != SDK:
        raise SystemExit("Refusing to package: the FreeInk SDK revision changed")
    image = ROOT / ".pio/build/x4-pro/firmware.bin"
    if not image.is_file():
        raise SystemExit("Build the x4-pro environment before packaging")
    data = image.read_bytes()
    if len(data) < 1024 or len(data) > 6553600 or data[0] != 0xE9:
        raise SystemExit("Refusing to package: invalid ESP application image or size")
    output = ROOT / "artifacts"
    output.mkdir(exist_ok=True)
    patch = subprocess.check_output(["git", "diff", "--binary", BASE, "--", "."], cwd=ROOT)
    (output / "source.patch").write_bytes(patch)
    shutil.copyfile(image, output / NAME)
    digest = hashlib.sha256(data).hexdigest()
    (output / "SHA256SUMS.txt").write_text(f"{digest}  {NAME}\n", encoding="utf-8")
    manifest = {
        "device": "Xteink X4 Pro",
        "platformio_environment": "x4-pro",
        "base_version": "CrossInk 1.6.1",
        "custom_version": "1.6.1-library.5-x4-pro",
        "base_commit": BASE,
        "sdk_commit": SDK,
        "source_commit": git("rev-parse", "HEAD"),
        "source_patch_sha256": hashlib.sha256(patch).hexdigest(),
        "firmware": NAME,
        "firmware_bytes": len(data),
        "firmware_sha256": digest,
        "workflow_run": os.environ.get("GITHUB_RUN_ID", "local"),
        "hardware_tested": False,
    }
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    shutil.copyfile(ROOT / "docs/custom-library-x4-pro.md", output / "README.md")
    print(f"Packaged {NAME}: {len(data)} bytes, SHA-256 {digest}")


if __name__ == "__main__":
    main()
