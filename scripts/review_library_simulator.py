"""Run native Library verification on a temporary card with generated books."""
import argparse
import io
import os
from pathlib import Path
import subprocess
import tempfile
from xml.sax.saxutils import escape
import zipfile

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def fixture(path, number):
    series = ("Garden Tales", "The Reading Room", "Little Adventures", "Quiet Days")[number % 4]
    title = f"{series}: Volume {number // 4 + 1:02}"
    author = ("Avery Stone", "Robin Reed", "Morgan Page")[number % 3] if number != 37 else ""
    creator = f"<dc:creator>{author}</dc:creator>" if author else ""
    image = Image.new("1", (150, 225), number % 2 == 0)
    ink = int(number % 2 != 0)
    draw = ImageDraw.Draw(image)
    draw.rectangle((4, 4, 145, 220), outline=ink, width=2)
    draw.rectangle((8, 8, 141, 216), outline=ink)
    font = ImageFont.truetype(str(ROOT / "lib/EpdFont/scalableFonts/bitter_regular.ttf"), 14)
    for line_number, line in enumerate(series.split(" ", 1)):
        draw.text((75, 50 + line_number * 19), line, font=font, fill=ink, anchor="mt")
    draw.ellipse((61, 107, 89, 137), outline=ink, width=2)
    draw.line((75, 137, 75, 161), fill=ink, width=2)
    draw.text((75, 180), f"Volume {number // 4 + 1:02}", font=font, fill=ink, anchor="mt")
    cover = io.BytesIO()
    image.save(cover, format="PNG")
    opf = f'''<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="id">crossink-library-review-{number}</dc:identifier><dc:title>{escape(title)}</dc:title>
{creator}<dc:language>en</dc:language><dc:subject>Fiction</dc:subject>
<dc:description><![CDATA[<p>A gentle <b>garden adventure</b>, shared with friends &amp; family.</p>]]></dc:description>
<meta name="calibre:series" content="{series}"/><meta name="calibre:series_index" content="{number // 4 + 1}"/>
<meta name="cover" content="cover"/><meta property="dcterms:modified">2026-01-01T00:00:00Z</meta></metadata>
<manifest><item id="cover" href="cover.png" media-type="image/png" properties="cover-image"/>
<item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/></manifest>
<spine><itemref idref="chapter"/></spine></package>'''
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as book:
        book.writestr("mimetype", "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        book.writestr("META-INF/container.xml", '''<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles>
<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>''')
        book.writestr("OEBPS/content.opf", opf)
        book.writestr("OEBPS/cover.png", cover.getvalue())
        book.writestr("OEBPS/chapter.xhtml", f'''<html xmlns="http://www.w3.org/1999/xhtml"><head>
<title>{escape(title)}</title></head><body><h1>{escape(title)}</h1><p>Generated Library review fixture.</p></body></html>''')
        book.writestr("OEBPS/nav.xhtml", '''<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="chapter.xhtml">Chapter</a></li></ol></nav></body></html>''')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--env", default="x4-pro-simulator")
    parser.add_argument("--output", default="artifacts/native-library-review")
    parser.add_argument("--fixtures-only", action="store_true", help="Check the generated card before compiling")
    args = parser.parse_args()
    program = ROOT / ".pio/build" / args.env / "program"
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="crossink-library-review-") as temporary:
        card = Path(temporary)
        for i in range(38):
            fixture(card / "fs_/LibraryReview" / ("Fables" if i % 2 else "Stories") / f"book-{i:02}.epub", i)
        (card / "fs_/My Clippings.txt").write_text("Generated clipping export, not a book.\n", encoding="utf-8")
        (card / "fs_/LibraryReview/Fables/Notes.txt").write_text("Generated legitimate TXT book.\n", encoding="utf-8")
        if args.fixtures_only:
            print("Generated 38 EPUB fixtures, a TXT book and a clipping export successfully")
            return
        environment = dict(os.environ, SDL_VIDEODRIVER="dummy", CROSSINK_SIMULATOR_SMOKE_TEST="1",
                           CROSSINK_LIBRARY_REVIEW=str(output))
        try:
            result = subprocess.run([str(program)], cwd=card, env=environment, stdout=subprocess.PIPE,
                                    stderr=subprocess.STDOUT, text=True, timeout=420)
        except subprocess.TimeoutExpired as error:
            log = error.stdout or b""
            if isinstance(log, bytes):
                log = log.decode("utf-8", errors="replace")
            (output / "review.log").write_text(log, encoding="utf-8")
            print("\n".join(log.splitlines()[-20:]))
            raise SystemExit("Native Library review exceeded 420 seconds") from None
        (output / "review.log").write_text(result.stdout, encoding="utf-8")
        print("\n".join(result.stdout.splitlines()[-12:]))
        if result.returncode or "LIBRARY REVIEW PASS:" not in result.stdout:
            raise SystemExit(result.returncode or 1)
    for capture in output.glob("*.pgm"):
        with Image.open(capture) as image:
            image.save(capture.with_suffix(".png"))
        capture.unlink()


if __name__ == "__main__":
    main()
