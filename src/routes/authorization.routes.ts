import type { FastifyPluginAsync } from "fastify";
import { getDisplayMap } from "../controllers/authorization.controller.js";

const authorizationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/display-map", getDisplayMap);
};

export default authorizationRoutes;
