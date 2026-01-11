import type { FastifyPluginAsync } from "fastify";
import {
  createPanel,
  deletePanel,
  getPanelById,
  listPanels,
  updatePanel,
  uploadPanelImage,
} from "../controllers/panels.controller.js";
import { authPreHandler } from "../middleware/auth.js";
import type { SavePanelData, UpdatePanelData } from "../types/index.js";

const panelsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{
    Querystring: {
      page?: string;
      perPage?: string;
      limit?: string;
      search?: string;
      ownership?: string;
    };
  }>("/", { preHandler: authPreHandler }, listPanels);
  fastify.post<{ Body: SavePanelData }>("/", { preHandler: authPreHandler }, createPanel);
  fastify.get<{ Params: { id: string } }>("/:id", { preHandler: authPreHandler }, getPanelById);
  fastify.put<{ Params: { id: string }; Body: UpdatePanelData }>(
    "/:id",
    { preHandler: authPreHandler },
    updatePanel
  );
  fastify.delete<{ Params: { id: string } }>("/:id", { preHandler: authPreHandler }, deletePanel);
  fastify.put<{ Params: { id: string } }>(
    "/:id/images",
    { preHandler: authPreHandler },
    uploadPanelImage
  );
};

export default panelsRoutes;
