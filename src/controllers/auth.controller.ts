import type { FastifyReply, FastifyRequest } from "fastify";
import { store } from "../store.js";
import { issueTokens } from "../utils/auth.js";

type AuthBody = { username?: string; password?: string };

export const login = async (request: FastifyRequest<{ Body: AuthBody }>, reply: FastifyReply) => {
  const { username, password } = request.body ?? {};

  if (!username || !password) {
    reply.status(400).send({ error: "Missing credentials" });
    return;
  }

  const user = store.users.find((item) => item.username === username);
  if (!user || user.password !== password) {
    reply.status(401).send({ error: "Invalid credentials" });
    return;
  }

  const tokens = issueTokens(user);
  store.refreshTokens.set(tokens.RefreshToken, user.id);

  reply.send({
    ...tokens,
    token: tokens.IdToken,
    refreshToken: tokens.RefreshToken,
    customerUuid: user.customerUuid,
    collaboratorUuid: user.collaboratorUuid,
    username: user.username,
  });
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
    IdToken: tokens.IdToken,
    AccessToken: tokens.AccessToken,
  });
};
