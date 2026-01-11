import "fastify";
import type { UserRecord } from "./index.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: UserRecord;
  }
}
