import { base64ToBuffer, bufferToBase64 } from "../../src/utils/base64";

describe("base64 utils", () => {
  it("round-trips a buffer through a data URI", () => {
    const original = Buffer.from("hello world");
    const dataUri = bufferToBase64(original, "text/plain");
    expect(dataUri.startsWith("data:text/plain;base64,")).toBe(true);

    const back = base64ToBuffer(dataUri);
    expect(back.equals(original)).toBe(true);
  });

  it("strips the data URI prefix before decoding", () => {
    const raw = Buffer.from("abc").toString("base64");
    const withPrefix = `data:image/png;base64,${raw}`;
    expect(base64ToBuffer(withPrefix).toString()).toBe("abc");
  });

  it("decodes a raw base64 string without a prefix", () => {
    const raw = Buffer.from("abc").toString("base64");
    expect(base64ToBuffer(raw).toString()).toBe("abc");
  });
});
