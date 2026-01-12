import type { FastifyReply, FastifyRequest } from "fastify";
import { store } from "../store.js";
import { verifyToken } from "../utils/auth.js";

const AUTH_REQUIRED = process.env.MOCK_AUTH_REQUIRED !== "false";

export const authPreHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!AUTH_REQUIRED) return;

  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    const payload = verifyToken(token);
    const userId = typeof payload.sub === "string" ? payload.sub : undefined;
    const username = typeof payload.username === "string" ? payload.username : undefined;
    const user = store.users.find((item) => item.id === userId || item.username === username);

    if (!user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    request.user = user;
  } catch (error) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
};
