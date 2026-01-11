import type { FastifyPluginAsync } from "fastify";
import { getMe } from "../controllers/user.controller.js";
import { authPreHandler } from "../middleware/auth.js";

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", { preHandler: authPreHandler }, getMe);
};

export default userRoutes;
