// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

import { SignJWT } from "jose";
import { createSession, getSession } from "../auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-secret-key"
);

beforeEach(() => {
  vi.clearAllMocks();
});

test("createSession sets a cookie named auth-token", async () => {
  await createSession("user-1", "test@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  const [name] = mockCookieStore.set.mock.calls[0];
  expect(name).toBe("auth-token");
});

test("createSession cookie value is a valid JWT with userId and email", async () => {
  await createSession("user-123", "hello@example.com");

  const [, token] = mockCookieStore.set.mock.calls[0];
  expect(typeof token).toBe("string");
  expect(token.split(".").length).toBe(3);

  const { payload } = await jwtVerify(token, JWT_SECRET);
  expect(payload.userId).toBe("user-123");
  expect(payload.email).toBe("hello@example.com");
});

test("createSession sets httpOnly cookie", async () => {
  await createSession("user-1", "test@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  expect(options.httpOnly).toBe(true);
});

test("createSession sets sameSite lax", async () => {
  await createSession("user-1", "test@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  expect(options.sameSite).toBe("lax");
});

test("createSession sets path /", async () => {
  await createSession("user-1", "test@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  expect(options.path).toBe("/");
});

test("createSession sets expiry ~7 days in the future", async () => {
  const before = Date.now();
  await createSession("user-1", "test@example.com");
  const after = Date.now();

  const [, , options] = mockCookieStore.set.mock.calls[0];
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDays);
  expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDays);
});

test("createSession sets secure false outside production", async () => {
  await createSession("user-1", "test@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  expect(options.secure).toBe(false);
});

// ── getSession ─────────────────────────────────────────────────────────────────

test("getSession returns null when no cookie is present", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns session payload from a valid token", async () => {
  await createSession("user-42", "user@example.com");
  const [, token] = mockCookieStore.set.mock.calls[0];
  vi.clearAllMocks();
  mockCookieStore.get.mockReturnValue({ value: token });

  const session = await getSession();
  expect(session?.userId).toBe("user-42");
  expect(session?.email).toBe("user@example.com");
});

test("getSession returns null for an expired token", async () => {
  const expired = await new SignJWT({ userId: "user-1", email: "test@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("-1s")
    .setIssuedAt()
    .sign(JWT_SECRET);
  mockCookieStore.get.mockReturnValue({ value: expired });

  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns null for a malformed token", async () => {
  mockCookieStore.get.mockReturnValue({ value: "not.a.jwt" });

  const session = await getSession();
  expect(session).toBeNull();
});
