import type { FastifyPluginAsync } from "fastify";
import { login, refreshToken } from "../controllers/auth.controller.js";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Rota catch-all para permitir o proxy gravar da API real
  // O preHandler do proxy vai interceptar e fazer o proxy para a API real
  fastify.post("/", async (_request, reply) => {
    reply.status(404).send({ error: "Not handled by proxy" });
  });
  fastify.get<{ Params: { token: string } }>("/refresh-token/:token", refreshToken);
};

export default authRoutes;
