import { Timepoint, MetricsData } from "./MetricsData";

export interface DataRequestIn {
  file_name: string;
  time: Date;
  name: string;
  email: string;
  data: DataRequestOut;
  status: string;
  proposal_status?: string;
}

export interface MetricEntry {
  metric_name: string;
  display_name: string;
  value1?: string | number | null;
  value2?: string | number | null;
  type: string;
  category: string;
}

export interface ORGroup {
  group_id: number;
  metrics: MetricEntry[];
}

export interface DataRequestOut {
  requestor: User | undefined;
  timepoint: Timepoint;
  behavior: {
    required: MetricEntry[];
    optional: MetricEntry[];
  };
  imaging: {
    required: MetricEntry[];
    optional: MetricEntry[];
  };
  notes: string;
  or_groups?: ORGroup[];
  proposal_status?: string; 

}

export interface MetricOut {
  required: boolean;
  value1: string | number;
  value2: string | number;
  type: string;
  category: string;
  subcategory?: string;
  display_name?: string;
  space?: "native" | "mni" | null;
}

export interface DataRequestsResponse {
  requests: DataRequestIn[];
}

export interface User {
  name: string;
  email: string;
}

export interface Response {
  status: string;
  message: string;
  error: string;
}
