import type { FastifyReply, FastifyRequest } from "fastify";
import { store } from "../store.js";
import { verifyToken } from "../utils/auth.js";

const AUTH_REQUIRED = process.env.MOCK_AUTH_REQUIRED !== "false";

export const authPreHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!AUTH_REQUIRED) return;

  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    reply.status(401).send({ error: "Unauthorized" });
    return;
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    const payload = verifyToken(token);
    const userId = payload.sub as string | undefined;
    const username = payload.username as string | undefined;
    const user = store.users.find((item) => item.id === userId || item.username === username);

    if (!user) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    request.user = user;
  } catch (error) {
    reply.status(401).send({ error: "Unauthorized" });
  }
};
