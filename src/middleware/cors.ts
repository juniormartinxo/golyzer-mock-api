import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: true,
    credentials: true,
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Customer-ID",
      "X-Query-Format",
      "X-App-Name",
      "X-Request-ID",
      "X-Builder-Mode",
      "X-Span-Attributes",
    ],
  });
};

export default corsPlugin;
