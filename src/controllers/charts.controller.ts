import type { FastifyReply, FastifyRequest } from "fastify";
import { v4 as uuid } from "uuid";
import { store, updateCustomModels } from "../store.js";
import type { CustomModel, SaveCustomChartData } from "../types/index.js";

export const listCustomModels = async (
  request: FastifyRequest<{ Querystring: { summary?: string } }>,
  reply: FastifyReply
) => {
  const { summary } = request.query;
  const models = store.customModels;

  if (summary === "true") {
    const summarized = models.map((model) => ({
      id: model.id,
      name: model.name,
      tags: model.tags,
      driver: model.driver,
    }));
    reply.send(summarized);
    return;
  }

  reply.send(models);
};

export const saveCustomModel = async (
  request: FastifyRequest<{ Body: SaveCustomChartData }>,
  reply: FastifyReply
) => {
  const payload = request.body;
  const model: CustomModel = { id: uuid(), ...payload };

  updateCustomModels([...store.customModels, model]);

  reply.send({ id: model.id });
};

export const deleteCustomModel = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  updateCustomModels(store.customModels.filter((model) => model.id !== request.params.id));
  reply.send({});
};

export const renameCustomModel = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { name?: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const { name } = request.body;

  const index = store.customModels.findIndex((model) => model.id === id);
  if (index === -1) {
    reply.status(404).send({ error: "Model not found" });
    return;
  }

  const nextModels = [...store.customModels];
  nextModels[index] = { ...nextModels[index], name: name ?? nextModels[index].name };
  updateCustomModels(nextModels);

  reply.send({});
};

export const mostUsedCharts = async (_request: FastifyRequest, reply: FastifyReply) => {
  reply.send(store.mostUsed);
};
