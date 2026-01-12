import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ApiTarget, ProxyConfig, Recording } from "../types/proxy.js";

const sanitizePath = (path: string): string => {
  return path
    .replace(/^\//, "")
    .replace(/\//g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "-");
};

const getRecordingPath = (
  config: ProxyConfig,
  target: ApiTarget,
  endpoint: string,
  method: string
): string => {
  const filename = `${sanitizePath(endpoint)}_${method.toUpperCase()}.json`;
  return join(config.recordingsDir, `${target}-api`, filename);
};

export const saveRecording = async (
  config: ProxyConfig,
  target: ApiTarget,
  recording: Recording
): Promise<void> => {
  const filePath = getRecordingPath(config, target, recording.endpoint, recording.method);
  const dir = dirname(filePath);

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(recording, null, 2), "utf-8");
};

export const loadRecording = async (
  config: ProxyConfig,
  target: ApiTarget,
  endpoint: string,
  method: string
): Promise<Recording | null> => {
  const filePath = getRecordingPath(config, target, endpoint, method);

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
  method: string
): Promise<boolean> => {
  const recording = await loadRecording(config, target, endpoint, method);
  return recording !== null;
};
