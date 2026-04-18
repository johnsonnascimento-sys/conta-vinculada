const SESSION_SECRET = process.env.AUTH_SECRET ?? "conta-vinculada-dev-secret";

function encodeBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

async function signValue(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return Buffer.from(signature)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createSignedToken(payload: string) {
  const body = encodeBase64Url(payload);
  const signature = await signValue(body);
  return `${body}.${signature}`;
}

export async function verifySignedToken(token: string) {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = await signValue(body);

  if (expected !== signature) {
    return null;
  }

  return decodeBase64Url(body);
}
