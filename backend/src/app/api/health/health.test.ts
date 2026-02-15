import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns ok true and timestamp", async () => {
    const res = await GET();
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(typeof json.timestamp).toBe("string");
  });
});