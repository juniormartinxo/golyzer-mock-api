import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { loadRecording, saveRecording } from "../services/recorder.js";
import {
  type ApiTarget,
  type ProxyConfig,
  type Recording,
  getProxyConfig,
  getTargetUrl,
} from "../types/proxy.js";

const resolveApiTarget = (url: string): ApiTarget | null => {
  if (url.startsWith("/authentication") || url.startsWith("/v1/")) return "base";
  if (url.startsWith("/query")) return "data";
  if (
    url.startsWith("/me") ||
    url.startsWith("/panels") ||
    url.startsWith("/charts") ||
    url.startsWith("/authorization")
  ) {
    return "golyzer";
  }
  return null;
};

const applyCorsHeaders = (request: FastifyRequest, reply: FastifyReply) => {
  const origin = request.headers.origin;
  if (typeof origin === "string" && origin.length > 0) {
    reply.header("access-control-allow-origin", origin);
    reply.header("access-control-allow-credentials", "true");
    reply.header("vary", "origin");
  }

  const requestHeaders = request.headers["access-control-request-headers"];
  if (typeof requestHeaders === "string" && requestHeaders.length > 0) {
    reply.header("access-control-allow-headers", requestHeaders);
  }

  const requestMethod = request.headers["access-control-request-method"];
  if (typeof requestMethod === "string" && requestMethod.length > 0) {
    reply.header("access-control-allow-methods", requestMethod);
  }
};

const forwardRequest = async (
  request: FastifyRequest,
  config: ProxyConfig,
  target: ApiTarget
): Promise<{ status: number; headers: Record<string, string>; body: unknown }> => {
  const targetUrl = getTargetUrl(config, target);
  const url = new URL(request.url, targetUrl);

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string" && !["host", "connection"].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    fetchOptions.body = JSON.stringify(request.body);
    headers["content-type"] = "application/json";
  }

  const response = await fetch(url.toString(), fetchOptions);
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  let body: unknown;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  return { status: response.status, headers: responseHeaders, body };
};

const proxyPlugin: FastifyPluginAsync = async (fastify) => {
  const config = getProxyConfig();

  fastify.log.info(`Proxy mode: ${config.mode.toUpperCase()}`);

  // Ensure CORS headers are always present on API responses
  fastify.addHook("onSend", async (request: FastifyRequest, reply: FastifyReply) => {
    const target = resolveApiTarget(request.url);
    if (!target) return;

    const origin = request.headers.origin ?? "*";
    reply.header("access-control-allow-origin", origin);
    reply.header("access-control-allow-credentials", "true");
    reply.header("access-control-allow-methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    reply.header(
      "access-control-allow-headers",
      "Authorization, Content-Type, X-Customer-ID, X-Query-Format, X-App-Name, X-Request-ID, X-Builder-Mode, X-Span-Attributes"
    );
  });

  fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    const target = resolveApiTarget(request.url);
    if (!target) return;

    // Handle preflight OPTIONS requests
    if (request.method === "OPTIONS") {
      applyCorsHeaders(request, reply);
      reply.header("access-control-allow-methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      reply.status(204).send();
      return;
    }

    const endpoint = request.url.split("?")[0];
    const method = request.method;

    // No modo replay ou record, tenta usar gravação existente
    if (config.mode === "replay" || config.mode === "record") {
      const existing = await loadRecording(config, target, endpoint, method, request.body);
      if (existing) {
        fastify.log.info(`[REPLAY] ${method} ${endpoint}`);
        applyCorsHeaders(request, reply);
        reply.status(existing.statusCode).send(existing.body);
        return;
      }

      // No modo replay puro, se não tiver gravação retorna 404
      if (config.mode === "replay") {
        fastify.log.warn(`[MISSING] ${method} ${endpoint} - no recording found`);
        applyCorsHeaders(request, reply);
        reply.status(404).send({
          error: "Recording not found",
          message: `No recording for ${method} ${endpoint}`,
          hint: "Run with PROXY_MODE=record to record this endpoint",
        });
        return;
      }
    }

    // Modos record, force-record e passthrough fazem proxy para a API real
    try {
      fastify.log.info(`[PROXY] ${method} ${endpoint} -> ${target}`);
      const result = await forwardRequest(request, config, target);

      if (config.mode === "record" || config.mode === "force-record") {
        const recording: Recording = {
          endpoint,
          method,
          statusCode: result.status,
          headers: result.headers,
          body: result.body,
          timestamp: new Date().toISOString(),
          query: Object.fromEntries(new URL(request.url, "http://localhost").searchParams),
          requestBody: request.body,
        };
        await saveRecording(config, target, recording);
        fastify.log.info(`[RECORDED] ${method} ${endpoint}`);
      }

      applyCorsHeaders(request, reply);
      reply.status(result.status).send(result.body);
    } catch (error) {
      fastify.log.error(error, `Proxy error for ${method} ${endpoint}`);
      applyCorsHeaders(request, reply);
      reply.status(502).send({ error: "Proxy error", message: String(error) });
    }
  });
};

export default fp(proxyPlugin);
