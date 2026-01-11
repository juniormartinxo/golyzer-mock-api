import type { FastifyPluginAsync } from "fastify";

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

export default loggerPlugin;
