import type { FastifyReply, FastifyRequest } from "fastify";
import { store } from "../store.js";
import type { UserRecord } from "../types/index.js";
import { issueTokens } from "../utils/auth.js";

type AuthBody = { username: string; password: string };

const resolveLastName = (user: UserRecord): string => {
  const trimmed = user.lastName?.trim();
  if (trimmed) return trimmed;

  const name = user.name?.trim() ?? "";
  if (!name) return "";

  const parts = name.split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : "";
};

const resolveAdmissionDate = (user: UserRecord): string => {
  return user.admissionDate ?? user.createdAt ?? new Date().toISOString();
};

const resolveUuid = (user: UserRecord): string => {
  return user.uuid ?? user.collaboratorUuid ?? user.id;
};

const buildAuthResponse = (user: UserRecord, tokens: ReturnType<typeof issueTokens>) => {
  const uuid = resolveUuid(user);
  const admissionDate = resolveAdmissionDate(user);
  const createdAt = user.createdAt ?? admissionDate;

  return {
    token: tokens.IdToken,
    refreshToken: tokens.RefreshToken,
    accessToken: tokens.AccessToken,
    id: user.authId ?? user.id,
    uuid,
    name: user.name,
    lastName: resolveLastName(user),
    admissionDate,
    email: user.email,
    status: user.status ?? true,
    user: user.user ?? true,
    picture: user.picture ?? null,
    theme: user.theme ?? "light",
    sysadmin: user.sysadmin ?? user.role === "admin",
    customerUuid: user.customerUuid,
    departmentId: user.departmentId ?? null,
    collaboratorPositionId: user.collaboratorPositionId ?? null,
    isMobileUser: user.isMobileUser ?? false,
    cognitoSub: user.cognitoSub ?? uuid,
    firebaseUid: user.firebaseUid ?? null,
    createdAt,
    updatedAt: user.updatedAt ?? null,
    deletedAt: user.deletedAt ?? null,
    phone: user.phone ?? "",
    collaboratorUuid: user.collaboratorUuid,
    username: user.username,
    subscription: user.subscription ?? null,
    IdToken: tokens.IdToken,
    AccessToken: tokens.AccessToken,
    RefreshToken: tokens.RefreshToken,
  };
};

export const login = async (request: FastifyRequest<{ Body: AuthBody }>, reply: FastifyReply) => {
  const { username, password } = request.body ?? {};

  if (!username || !password) {
    reply.status(400).send({ error: "Missing credentials" });
    return;
  }

  const user = store.users.find((item) => item.username === username || item.email === username);
  if (!user || user.password !== password) {
    reply.status(401).send({ error: "Invalid credentials" });
    return;
  }

  const tokens = issueTokens(user);
  store.refreshTokens.set(tokens.RefreshToken, user.id);

  reply.send(buildAuthResponse(user, tokens));
};

export const refreshToken = async (
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply
) => {
  const { token } = request.params;
  const userId = store.refreshTokens.get(token);

  if (!userId) {
    reply.status(401).send({ error: "Invalid refresh token" });
    return;
  }

  const user = store.users.find((item) => item.id === userId);
  if (!user) {
    reply.status(401).send({ error: "Invalid refresh token" });
    return;
  }

  const tokens = issueTokens(user);

  reply.send({
    token: tokens.IdToken,
    accessToken: tokens.AccessToken,
    IdToken: tokens.IdToken,
    AccessToken: tokens.AccessToken,
  });
};
