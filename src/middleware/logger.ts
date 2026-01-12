import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const loggerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onResponse", (request, reply, done) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.getResponseTime(),
      },
      "request completed"
    );
    done();
  });
};

export default fp(loggerPlugin);
