import type { FastifyReply, FastifyRequest } from "fastify";
import { store } from "../store.js";
import type { UserResponse } from "../types/index.js";

const toUserResponse = (user: (typeof store.users)[number]): UserResponse => {
  const { password, ...rest } = user;
  return rest;
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user ?? store.users[0];

  if (!user) {
    return reply.status(404).send({ error: "User not found" });
  }

  return reply.send(toUserResponse(user));
};
