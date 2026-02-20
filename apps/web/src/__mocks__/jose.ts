export class SignJWT {
  private payload: unknown;

  constructor(payload: unknown) {
    this.payload = payload;
  }

  setProtectedHeader() {
    return this;
  }

  setExpirationTime() {
    return this;
  }

  setIssuedAt() {
    return this;
  }

  async sign() {
    // return a deterministic fake token
    return "test.jwt.token";
  }
}

type MockPayload = {
  user_id: string;
  username: string;
};

export async function jwtVerify(token?: string): Promise<{ payload: MockPayload }> {
  // token is the string passed from your code: jwtVerify(token, ...)
  const t = typeof token === "string" ? token : "";

  // Encode user choice in token value for tests
  // - "user:0002" -> ...0002
  // - default -> ...0001
  const user_id = t.includes("user:0002")
    ? "00000000-0000-0000-0000-000000000002"
    : t.includes("user:0003")
      ? "00000000-0000-0000-0000-000000000003"
      : "00000000-0000-0000-0000-000000000001";

  return {
    payload: {
      user_id,
      username: "testuser",
    },
  };
}

