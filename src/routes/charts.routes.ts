import type { FastifyPluginAsync } from "fastify";
import {
  deleteCustomModel,
  listCustomModels,
  mostUsedCharts,
  renameCustomModel,
  saveCustomModel,
} from "../controllers/charts.controller.js";
import { authPreHandler } from "../middleware/auth.js";
import type { SaveCustomChartData } from "../types/index.js";

const chartsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: { summary?: string } }>(
    "/models/custom",
    { preHandler: authPreHandler },
    listCustomModels
  );
  fastify.post<{ Body: SaveCustomChartData }>(
    "/models/custom",
    { preHandler: authPreHandler },
    saveCustomModel
  );
  fastify.delete<{ Params: { id: string } }>(
    "/models/custom/:id",
    { preHandler: authPreHandler },
    deleteCustomModel
  );
  fastify.patch<{ Params: { id: string }; Body: { name?: string } }>(
    "/models/custom/rename/:id",
    { preHandler: authPreHandler },
    renameCustomModel
  );
  fastify.get("/most-used", { preHandler: authPreHandler }, mostUsedCharts);
};

export default chartsRoutes;
