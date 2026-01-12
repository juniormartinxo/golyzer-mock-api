// Proxy configuration types

export type ProxyMode = "record" | "force-record" | "replay" | "passthrough";

export interface ProxyConfig {
  mode: ProxyMode;
  baseApiUrl: string;
  golyzerApiUrl: string;
  dataApiUrl: string;
  recordingsDir: string;
}

export type ApiTarget = "base" | "golyzer" | "data";

export interface Recording {
  endpoint: string;
  method: string;
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  timestamp: string;
  query?: Record<string, string>;
  requestBody?: unknown;
}

export const getProxyConfig = (): ProxyConfig => {
  const mode = (process.env.PROXY_MODE ?? "replay") as ProxyMode;

  return {
    mode,
    baseApiUrl: process.env.BASE_API_URL ?? "https://edge-api-base-platform.dev.goapice.com",
    golyzerApiUrl:
      process.env.GOLYZER_API_URL ?? "https://edge-api-painel-de-controle.dev.goapice.com",
    dataApiUrl: process.env.DATA_API_URL ?? "https://api-bi-engine.dev.goapice.com",
    recordingsDir: process.env.RECORDINGS_DIR ?? "recordings",
  };
};

export const getTargetUrl = (config: ProxyConfig, target: ApiTarget): string => {
  switch (target) {
    case "base":
      return config.baseApiUrl;
    case "golyzer":
      return config.golyzerApiUrl;
    case "data":
      return config.dataApiUrl;
  }
};
