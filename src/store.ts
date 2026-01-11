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

const users = (usersFixture as { users: UserRecord[] }).users ?? [];
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
