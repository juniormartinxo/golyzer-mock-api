import type { FastifyPluginAsync } from "fastify";

// Catch-all route for /v1/* endpoints
// These are handled by the proxy middleware
const v1Routes: FastifyPluginAsync = async (fastify) => {
  // GET /v1/*
  fastify.get("/*", async (_request, reply) => {
    // This will be intercepted by the proxy middleware
    // If we reach here, it means the proxy didn't handle it
    reply.status(404).send({ error: "Not found", message: "Route not handled by proxy" });
  });

  // POST /v1/*
  fastify.post("/*", async (_request, reply) => {
    reply.status(404).send({ error: "Not found", message: "Route not handled by proxy" });
  });

  // PUT /v1/*
  fastify.put("/*", async (_request, reply) => {
    reply.status(404).send({ error: "Not found", message: "Route not handled by proxy" });
  });

  // PATCH /v1/*
  fastify.patch("/*", async (_request, reply) => {
    reply.status(404).send({ error: "Not found", message: "Route not handled by proxy" });
  });

  // DELETE /v1/*
  fastify.delete("/*", async (_request, reply) => {
    reply.status(404).send({ error: "Not found", message: "Route not handled by proxy" });
  });
};

export default v1Routes;
