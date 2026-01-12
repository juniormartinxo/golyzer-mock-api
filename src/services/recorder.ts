import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ApiTarget, ProxyConfig, Recording } from "../types/proxy.js";

const sanitizePath = (path: string): string => {
  return path
    .replace(/^\//, "")
    .replace(/\//g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "-");
};

/**
 * Generates a short hash from the request body for unique identification.
 * Used for POST/PUT/PATCH requests where the same endpoint can have different payloads.
 */
const hashBody = (body: unknown): string => {
  if (!body) return "";
  const str = typeof body === "string" ? body : JSON.stringify(body);
  return createHash("md5").update(str).digest("hex").substring(0, 8);
};

const getRecordingPath = (
  config: ProxyConfig,
  target: ApiTarget,
  endpoint: string,
  method: string,
  requestBody?: unknown
): string => {
  const bodyHash = requestBody ? `_${hashBody(requestBody)}` : "";
  const filename = `${sanitizePath(endpoint)}_${method.toUpperCase()}${bodyHash}.json`;
  return join(config.recordingsDir, `${target}-api`, filename);
};

export const saveRecording = async (
  config: ProxyConfig,
  target: ApiTarget,
  recording: Recording
): Promise<void> => {
  const filePath = getRecordingPath(
    config,
    target,
    recording.endpoint,
    recording.method,
    recording.requestBody
  );
  const dir = dirname(filePath);

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(recording, null, 2), "utf-8");
};

export const loadRecording = async (
  config: ProxyConfig,
  target: ApiTarget,
  endpoint: string,
  method: string,
  requestBody?: unknown
): Promise<Recording | null> => {
  const filePath = getRecordingPath(config, target, endpoint, method, requestBody);

  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as Recording;
  } catch {
    return null;
  }
};

export const hasRecording = async (
  config: ProxyConfig,
  target: ApiTarget,
  endpoint: string,
  method: string,
  requestBody?: unknown
): Promise<boolean> => {
  const recording = await loadRecording(config, target, endpoint, method, requestBody);
  return recording !== null;
};
