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

export async function jwtVerify(_token: string, _secret: Uint8Array) {
  // Minimal shape that your verify helper expects
  return { payload: { user_id: "test-user-id", username: "testuser" } };
}
