import { buildServer } from "./server.js";

const parsedPort = Number.parseInt(process.env.PORT ?? "3001", 10);
const port = Number.isFinite(parsedPort) ? parsedPort : 3001;
const host = process.env.HOST ?? "0.0.0.0";

const app = await buildServer();

try {
  await app.listen({ port, host });
} catch (error: unknown) {
  app.log.error(error);
  process.exit(1);
}
