import multipart from "@fastify/multipart";
import Fastify from "fastify";
import corsPlugin from "./middleware/cors.js";
import loggerPlugin from "./middleware/logger.js";
import proxyPlugin from "./middleware/proxy.js";
import authRoutes from "./routes/auth.routes.js";
import chartsRoutes from "./routes/charts.routes.js";
import panelsRoutes from "./routes/panels.routes.js";
import queryRoutes from "./routes/query.routes.js";
import userRoutes from "./routes/user.routes.js";

export const buildServer = async () => {
  const app = Fastify({ logger: true });

  await app.register(corsPlugin);
  await app.register(multipart);
  await app.register(loggerPlugin);
  await app.register(proxyPlugin);

  await app.register(authRoutes, { prefix: "/authentication" });
  await app.register(userRoutes, { prefix: "/me" });
  await app.register(panelsRoutes, { prefix: "/panels" });
  await app.register(chartsRoutes, { prefix: "/charts" });
  await app.register(queryRoutes, { prefix: "/query" });

  return app;
};
