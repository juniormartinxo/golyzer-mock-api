import type { FastifyReply, FastifyRequest } from "fastify";
import { v4 as uuid } from "uuid";
import { store, updatePanels } from "../store.js";
import type {
  ApiCollaborator,
  ApiPage,
  ApiPanelData,
  ApiPanelPagesData,
  SavePanelData,
  UpdatePanelData,
} from "../types/index.js";

const mapUserToCollaborator = (user: (typeof store.users)[number]): ApiCollaborator => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    level: user.role === "admin" ? "owner" : "read",
  };
};

const defaultCollaborator: ApiCollaborator = {
  id: "system",
  name: "System",
  level: "owner",
};

const normalizePage = (page: ApiPage, index: number): ApiPage => {
  const items = (page.items ?? []).map((item) => ({
    ...item,
    id: item.id ?? uuid(),
  }));

  return {
    ...page,
    id: page.id ?? uuid(),
    position: typeof page.position === "number" ? page.position : index,
    items,
  };
};

const normalizePanel = (
  panel: ApiPanelPagesData,
  user?: (typeof store.users)[number]
): ApiPanelPagesData => {
  const requestOwner = user ? mapUserToCollaborator(user) : undefined;
  const storeOwner = store.users[0] ? mapUserToCollaborator(store.users[0]) : undefined;
  const owner = panel.owner ?? requestOwner ?? storeOwner ?? defaultCollaborator;
  const pages = (panel.pages ?? []).map((page, index) => normalizePage(page, index));
  const lastUpdateUser = panel.lastUpdate?.user ?? requestOwner ?? owner;

  return {
    ...panel,
    owner,
    pages,
    appearance: panel.appearance ?? { colors: [] },
    sharingSummary: panel.sharingSummary ?? { total: 0, users: [] },
    lastUpdate: {
      date: new Date().toISOString(),
      user: lastUpdateUser,
    },
  };
};

const stripPanelPages = (panel: ApiPanelPagesData): ApiPanelData => {
  const { pages, ...rest } = panel;
  return rest;
};

export const listPanels = async (
  request: FastifyRequest<{
    Querystring: {
      page?: string;
      perPage?: string;
      limit?: string;
      search?: string;
      ownership?: string;
    };
  }>,
  reply: FastifyReply
) => {
  const { page = "1", perPage, limit, search = "", ownership } = request.query;
  const currentPage = Number(page) || 1;
  const pageLength = Number(perPage ?? limit ?? "10") || 10;
  const term = search.toLowerCase();

  let filtered = store.panels.filter((panel) => panel.name.toLowerCase().includes(term));

  if (ownership && request.user) {
    if (ownership === "own") {
      filtered = filtered.filter((panel) => panel.owner?.id === request.user?.id);
    }

    if (ownership === "shared") {
      filtered = filtered.filter((panel) => panel.owner?.id !== request.user?.id);
    }
  }

  const start = (currentPage - 1) * pageLength;
  const data = filtered.slice(start, start + pageLength).map(stripPanelPages);

  reply.send({
    data,
    pagination: {
      total: filtered.length,
      currentPage,
      pageLength,
    },
  });
};

export const getPanelById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const panel = store.panels.find((item) => item.id === request.params.id);
  if (!panel) {
    reply.status(404).send({ error: "Panel not found" });
    return;
  }

  reply.send(panel);
};

export const createPanel = async (
  request: FastifyRequest<{ Body: SavePanelData }>,
  reply: FastifyReply
) => {
  const payload = request.body;
  const payloadId =
    typeof payload.id === "string" && payload.id.trim().length > 0 ? payload.id.trim() : undefined;

  if (payloadId && store.panels.some((panel) => panel.id === payloadId)) {
    return reply.status(409).send({ error: "Panel already exists" });
  }

  const id = payloadId ?? uuid();
  const fallbackUser = request.user ?? store.users[0];
  const owner = payload.owner ?? (fallbackUser ? mapUserToCollaborator(fallbackUser) : undefined);

  const panel = normalizePanel(
    {
      ...payload,
      id,
      owner,
      pages: payload.pages ?? [],
      lastUpdate: { date: new Date().toISOString(), user: owner },
    },
    request.user
  );

  updatePanels([...store.panels, panel]);

  reply.send({ id });
};

export const updatePanel = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdatePanelData }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  if (request.body.pages !== undefined && !Array.isArray(request.body.pages)) {
    reply.status(400).send({ error: "Expected pages array" });
    return;
  }

  const index = store.panels.findIndex((panel) => panel.id === id);

  if (index === -1) {
    reply.status(404).send({ error: "Panel not found" });
    return;
  }

  const current = store.panels[index];
  const owner = request.body.owner ?? current.owner;
  const updated = normalizePanel(
    {
      ...current,
      ...request.body,
      id,
      owner,
      pages: request.body.pages ?? current.pages,
    },
    request.user
  );

  const nextPanels = [...store.panels];
  nextPanels[index] = updated;
  updatePanels(nextPanels);

  reply.send({});
};

export const deletePanel = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  updatePanels(store.panels.filter((panel) => panel.id !== id));

  reply.send({});
};

export const uploadPanelImage = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const panel = store.panels.find((item) => item.id === request.params.id);
  if (!panel) {
    reply.status(404).send({ error: "Panel not found" });
    return;
  }

  if (!request.isMultipart()) {
    reply.status(400).send({ error: "Expected multipart/form-data" });
    return;
  }

  try {
    const parts = request.parts();

    for await (const part of parts) {
      if (part.type === "file") {
        for await (const chunk of part.file) {
          void chunk;
        }
      }
    }
  } catch (error) {
    return reply.status(400).send({ error: "Invalid multipart data" });
  }

  reply.send({});
};
