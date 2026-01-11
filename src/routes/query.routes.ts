import type { FastifyPluginAsync } from "fastify";
import { fetchQuery } from "../controllers/query.controller.js";
import { authPreHandler } from "../middleware/auth.js";
import type { RequestCreateChartProps } from "../types/index.js";

const queryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Querystring: { page?: string; perPage?: string; limit?: string };
    Body: RequestCreateChartProps;
  }>("/fetch", { preHandler: authPreHandler }, fetchQuery);
};

export default queryRoutes;
