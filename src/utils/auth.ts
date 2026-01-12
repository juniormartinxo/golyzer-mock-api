import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import type { UserRecord } from "../types/index.js";

const SECRET = process.env.JWT_SECRET ?? "mock-secret-key";
const DEFAULT_TOKEN_TTL: jwt.SignOptions["expiresIn"] = "1h";

const parseTokenTtl = (value?: string): jwt.SignOptions["expiresIn"] => {
  if (!value) return DEFAULT_TOKEN_TTL;
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_TOKEN_TTL;

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  const msPattern = /^\d+(\.\d+)?\s*(ms|s|m|h|d|w|y)$/i;
  if (msPattern.test(trimmed)) {
    return trimmed as jwt.SignOptions["expiresIn"];
  }

  return DEFAULT_TOKEN_TTL;
};

const TOKEN_TTL = parseTokenTtl(process.env.TOKEN_TTL);

export const issueTokens = (user: UserRecord) => {
  const payload = {
    sub: user.id,
    username: user.username,
    permissions: user.permissions,
  };

  const IdToken = jwt.sign(payload, SECRET, {
    expiresIn: TOKEN_TTL,
  });
  const AccessToken = jwt.sign({ ...payload, type: "access" }, SECRET, {
    expiresIn: TOKEN_TTL,
  });
  const RefreshToken = uuid();

  return { IdToken, AccessToken, RefreshToken };
};

export const verifyToken = (token: string) => {
  const payload = jwt.verify(token, SECRET);
  if (typeof payload === "string") {
    throw new Error("Invalid token payload");
  }
  return payload;
};
