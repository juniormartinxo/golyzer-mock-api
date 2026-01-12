export interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  customerUuid: string;
  collaboratorUuid: string;
  permissions: string[];
}

export interface CompanyData {
  id: string;
  name: string;
  unit_id: string;
  unit_name: string;
}

export interface UserRecord extends UserData {
  password: string;
  role: string;
  companies: CompanyData[];
  preferences: Record<string, unknown>;
  authId?: number;
  uuid?: string;
  lastName?: string;
  admissionDate?: string;
  status?: boolean;
  user?: boolean;
  picture?: Record<string, unknown> | string | null;
  theme?: string;
  sysadmin?: boolean;
  departmentId?: number | null;
  collaboratorPositionId?: number | null;
  isMobileUser?: boolean;
  cognitoSub?: string | null;
  firebaseUid?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  phone?: string;
  subscription?: Record<string, unknown> | null;
}

export type UserResponse = Omit<UserRecord, "password">;

export interface ApiCollaborator {
  id: string;
  name: string;
  email?: string;
  avatar?: { url: string } | null;
  level?: string;
}

export interface SharingSummary {
  total: number;
  users: Array<{
    id: string;
    name: string;
    email?: string;
    permission?: string;
    avatar?: { url: string };
    permissions?: { [action: string]: boolean };
  }>;
}

export interface ApiPanelData {
  id: string;
  name: string;
  owner: ApiCollaborator;
  appearance?: { colors: string[] };
  sharingSummary?: SharingSummary;
  lastUpdate: { date: string; user?: ApiCollaborator };
}

export interface BgImageProps {
  active?: boolean;
  bg?: string;
  transparency?: number;
  position?: string;
  repeat?: string;
  size?: string;
  id?: string;
  name?: string;
}

export interface ApiPage {
  id: string;
  name: string;
  items: ApiChart[];
  position: number;
  appearance?: {
    background?: { hex: string };
    format?: string;
    image?: BgImageProps;
    grid?: "lg" | "md" | "sm" | "hidden";
  };
}

export interface ApiPanelPagesData extends ApiPanelData {
  pages: ApiPage[];
}

export interface ApiChart {
  id: string;
  name: string;
  type: string;
  position: Record<string, unknown>;
  appearance?: Record<string, unknown>;
  source?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  modelId?: string;
}

export interface ApiListPanelData {
  pagination: { total: number; currentPage: number; pageLength: number };
  data: ApiPanelData[];
}

export type SavePanelData = Omit<ApiPanelData, "id" | "lastUpdate"> & {
  pages: ApiPage[];
  id?: string;
};

export type UpdatePanelData = Omit<ApiPanelData, "lastUpdate"> & {
  pages: ApiPage[];
};

export interface SaveCustomChartData {
  name: string;
  appearance: Record<string, unknown>;
  tags: string[];
  parameters: Record<string, unknown>;
  driver: "echarts";
}

export interface CustomModel extends SaveCustomChartData {
  id: string;
}

export interface MostUsedChart {
  times_used: number;
  type: string;
  template_uuid: string | null;
}

export interface RequestMetric {
  alias?: string;
  dataset: string;
  field: string;
  agg?: string;
  timeGrain?: string;
  filters?: unknown[];
}

export interface RequestCreateChartProps {
  dataset?: string;
  metrics?: RequestMetric[];
  grouping?: string[];
  filters?: unknown[];
  sorting?: unknown[];
  limit?: number | null;
  pagination?: { page: number; perPage?: number };
  caching?: boolean;
  spanAttributes?: Record<string, unknown>;
  query_source?: string;
}

export interface QueryResponse {
  results: Record<string, unknown>[];
  page?: number;
  pages?: number;
  restricted?: boolean;
}

export interface QueryFixtures {
  labels: string[];
  dates: string[];
  regions: string[];
}

export type PanelRecord = ApiPanelPagesData;
