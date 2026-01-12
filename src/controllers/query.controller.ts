import type { FastifyReply, FastifyRequest } from "fastify";
import type { RequestCreateChartProps } from "../types/index.js";
import { buildQueryResponse } from "../utils/query.js";

const toPositiveNumber = (value?: string | number | null): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const fetchQuery = (
  request: FastifyRequest<{
    Querystring: { page?: string; perPage?: string; limit?: string };
    Body: RequestCreateChartProps;
  }>,
  reply: FastifyReply
) => {
  const body: RequestCreateChartProps = request.body ?? {};
  const pagination = body.pagination;
  const pageParam =
    request.query.page ?? (pagination?.page !== undefined ? String(pagination.page) : undefined);
  const perPageParam =
    request.query.perPage ??
    request.query.limit ??
    (pagination?.perPage !== undefined ? String(pagination.perPage) : undefined);

  const page = toPositiveNumber(pageParam);
  const perPage = toPositiveNumber(perPageParam ?? body.limit);

  return reply.send(buildQueryResponse(body, page, perPage));
};
