import chartsFixture from "./fixtures/charts.json" with { type: "json" };
import panelsFixture from "./fixtures/panels.json" with { type: "json" };
import queryFixture from "./fixtures/query-results.json" with { type: "json" };
import usersFixture from "./fixtures/users.json" with { type: "json" };
import type {
  CustomModel,
  MostUsedChart,
  PanelRecord,
  QueryFixtures,
  UserRecord,
} from "./types/index.js";

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const applyAuthOverrides = (users: UserRecord[]): UserRecord[] => {
  const envUsername = process.env.MOCK_AUTH_USERNAME?.trim();
  const envPassword = process.env.MOCK_AUTH_PASSWORD?.trim();

  if (!envUsername && !envPassword) {
    return users;
  }

  const ensureUniqueId = (baseId: string) => {
    if (!users.some((item) => item.id === baseId)) return baseId;
    let suffix = 1;
    while (users.some((item) => item.id === `${baseId}-${suffix}`)) {
      suffix += 1;
    }
    return `${baseId}-${suffix}`;
  };

  const baseTemplate =
    users[0] ??
    ({
      id: "user-env",
      username: "env",
      password: "env",
      email: "env@mock.local",
      name: "Env User",
      customerUuid: "00000000-0000-0000-0000-000000000000",
      collaboratorUuid: "00000000-0000-0000-0000-000000000000",
      permissions: ["panels:read", "panels:write", "charts:read", "charts:write"],
      role: "admin",
      companies: [],
      preferences: {},
    } satisfies UserRecord);

  if (envUsername) {
    const existing = users.find((item) => item.username === envUsername);
    if (existing) {
      if (envPassword) {
        existing.password = envPassword;
      }
      return users;
    }

    const fallbackId = ensureUniqueId("user-env");
    const fallbackEmail = `${envUsername}@mock.local`;
    const envUser: UserRecord = {
      ...baseTemplate,
      id: fallbackId,
      username: envUsername,
      password: envPassword ?? baseTemplate.password,
      email: fallbackEmail,
      name: envUsername,
    };
    users.push(envUser);
    return users;
  }

  if (envPassword && users[0]) {
    users[0].password = envPassword;
  }

  return users;
};

const users = applyAuthOverrides(deepClone((usersFixture as { users: UserRecord[] }).users ?? []));
let panels = deepClone((panelsFixture as { panels: PanelRecord[] }).panels ?? []);
let customModels = deepClone((chartsFixture as { customModels: CustomModel[] }).customModels ?? []);
const mostUsed = deepClone((chartsFixture as { mostUsed: MostUsedChart[] }).mostUsed ?? []);
const queryFixtures = queryFixture as QueryFixtures;

const refreshTokens = new Map<string, string>();

export const store = {
  users,
  panels,
  customModels,
  mostUsed,
  queryFixtures,
  refreshTokens,
};

export const updatePanels = (next: PanelRecord[]) => {
  panels = next;
  store.panels = panels;
};

export const updateCustomModels = (next: CustomModel[]) => {
  customModels = next;
  store.customModels = customModels;
};
