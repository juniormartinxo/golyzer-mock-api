import { store } from "../store.js";
import type { QueryResponse, RequestCreateChartProps, RequestMetric } from "../types/index.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 50;

const isDateMetric = (metric: RequestMetric) => {
  return Boolean(metric.timeGrain) || /date|time/i.test(metric.field);
};

const isRegionMetric = (metric: RequestMetric) => {
  const alias = metric.alias ?? "";
  return (
    /region|state|city|country|uf/i.test(metric.field) ||
    /region|state|city|country|uf/i.test(alias)
  );
};

const isNumericMetric = (metric: RequestMetric) => {
  return (
    Boolean(metric.agg) ||
    /count|total|value|amount|sum|avg|qty|quantity|price|revenue/i.test(metric.field)
  );
};

export const buildQueryResponse = (
  request: RequestCreateChartProps,
  pageParam?: number,
  perPageParam?: number
): QueryResponse => {
  const metrics = request.metrics ?? [];
  const labels = store.queryFixtures.labels.length ? store.queryFixtures.labels : ["Item"];
  const dates = store.queryFixtures.dates.length
    ? store.queryFixtures.dates
    : [new Date().toISOString()];
  const regions = store.queryFixtures.regions.length ? store.queryFixtures.regions : ["North"];
  const total = labels.length;

  const rows = Array.from({ length: total }, (_, index) => {
    const row: Record<string, unknown> = {};

    if (!metrics.length) {
      row.label = labels[index % labels.length];
      row.value = (index + 1) * 10;
      return row;
    }

    metrics.forEach((metric, metricIndex) => {
      const key = metric.alias ?? `${metric.dataset}_${metric.field}`;

      if (isDateMetric(metric)) {
        row[key] = dates[index % dates.length];
        return;
      }

      if (isRegionMetric(metric)) {
        row[key] = regions[index % regions.length];
        return;
      }

      if (!metric.agg && !isNumericMetric(metric)) {
        row[key] = labels[index % labels.length];
        return;
      }

      row[key] = (index + 1) * (metricIndex + 1) * 10;
    });

    return row;
  });

  const page = pageParam && pageParam > 0 ? pageParam : DEFAULT_PAGE;
  const perPage = perPageParam && perPageParam > 0 ? perPageParam : DEFAULT_PER_PAGE;
  const start = (page - 1) * perPage;
  const results = rows.slice(start, start + perPage);
  const pages = Math.max(1, Math.ceil(rows.length / perPage));

  return {
    results,
    page,
    pages,
    restricted: false,
  };
};
