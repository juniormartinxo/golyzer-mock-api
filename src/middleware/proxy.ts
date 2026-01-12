import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { loadRecording, saveRecording } from "../services/recorder.js";
import {
  type ApiTarget,
  type ProxyConfig,
  type Recording,
  getProxyConfig,
  getTargetUrl,
} from "../types/proxy.js";

const resolveApiTarget = (url: string): ApiTarget | null => {
  if (url.startsWith("/authentication")) return "base";
  if (url.startsWith("/query")) return "data";
  if (url.startsWith("/me") || url.startsWith("/panels") || url.startsWith("/charts")) {
    return "golyzer";
  }
  return null;
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

  if (config.mode === "replay") {
    fastify.log.info("Proxy mode: REPLAY - using recorded fixtures");
    return;
  }

  fastify.log.info(`Proxy mode: ${config.mode.toUpperCase()}`);

  fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const target = resolveApiTarget(request.url);
    if (!target) return;

    const endpoint = request.url.split("?")[0];
    const method = request.method;

    if (config.mode === "record") {
      const existing = await loadRecording(config, target, endpoint, method);
      if (existing) {
        fastify.log.info(`[REPLAY] ${method} ${endpoint}`);
        reply.status(existing.statusCode).send(existing.body);
        return;
      }
    }

    try {
      fastify.log.info(`[PROXY] ${method} ${endpoint} -> ${target}`);
      const result = await forwardRequest(request, config, target);

      if (config.mode === "record") {
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

      reply.status(result.status).send(result.body);
    } catch (error) {
      fastify.log.error(error, `Proxy error for ${method} ${endpoint}`);
      reply.status(502).send({ error: "Proxy error", message: String(error) });
    }
  });
};

export default proxyPlugin;
