import struct, zlib, os

OUT = os.path.join(os.path.dirname(__file__), "..", "public")


def png(name, size, rgb):
    w = h = size
    raw = bytearray()
    r, g, b = rgb
    for _ in range(h):
        raw.append(0)
        for _ in range(w):
            raw += bytes((r, g, b))

    def chunk(t, d):
        c = t + d
        return struct.pack(">I", len(d)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    data = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )
    with open(os.path.join(OUT, name), "wb") as f:
        f.write(data)


STEEL = (63, 90, 134)  # #3f5a86
png("icon-192.png", 192, STEEL)
png("icon-512.png", 512, STEEL)
png("favicon.png", 32, STEEL)
print("steel icons written to", os.path.abspath(OUT))
