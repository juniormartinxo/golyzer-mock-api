import type { FastifyPluginAsync } from "fastify";
import { login, refreshToken } from "../controllers/auth.controller.js";

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: { username?: string; password?: string } }>("/", login);
  fastify.get<{ Params: { token: string } }>("/refresh-token/:token", refreshToken);
};

export default authRoutes;
