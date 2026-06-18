// Single place that converts between base64 strings (HTTP layer) and Buffers (DB layer).
// The frontend sends files as data URIs (e.g. "data:image/jpeg;base64,/9j/...").

/** Strips an optional `data:<mime>;base64,` prefix and returns the raw bytes. */
export function base64ToBuffer(base64: string): Buffer {
  const commaIndex = base64.indexOf(",");
  const raw = base64.startsWith("data:") && commaIndex !== -1
    ? base64.slice(commaIndex + 1)
    : base64;
  return Buffer.from(raw, "base64");
}

/** Builds a data URI from a Buffer so the frontend can render/download it directly. */
export function bufferToBase64(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
