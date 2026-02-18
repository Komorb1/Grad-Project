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

export async function jwtVerify(): Promise<{ payload: MockPayload }> {
  return {
    payload: {
      user_id: "test-user-id",
      username: "testuser",
    },
  };
}

