type MockPayload = {
  user_id?: string;
  username?: string;
  device_id?: string;
  site_id?: string;
  typ?: string;
};

// Used by user auth code (requireUserId)
export async function jwtVerify(token?: string): Promise<{ payload: MockPayload }> {
  const t = typeof token === "string" ? token : "";

  // Device tokens
  if (t.includes("device:")) {
    return {
      payload: {
        device_id: "00000000-0000-0000-0000-000000000010",
        site_id: "00000000-0000-0000-0000-000000000020",
        typ: "device",
      },
    };
  }

  const mocked = process.env.MOCK_USER_ID;
  if (mocked) {
    return {
      payload: {
        user_id: mocked,
        username: "testuser",
      },
    };
  }

  // Otherwise use token patterns
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

// Used by device auth code (SignJWT)
export class SignJWT {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_payload: Record<string, unknown>) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setProtectedHeader(_h: Record<string, unknown>) {
    return this;
  }

  setIssuedAt() {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setExpirationTime(_exp: string) {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sign(_key: Uint8Array) {
    // Token contents don’t matter for this unit test suite
    return "mock.device.jwt.token";
  }
}