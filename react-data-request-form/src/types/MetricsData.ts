// Define the basic structure for each metric
export type MetricTypeValue = "float" | "int" | "string";

export interface Metric {
  metric_name: string;
  name:string;
  variable_type: MetricTypeValue;
  description: string;
  is_required: boolean;
  is_selected: boolean;
  filter_value1: string | number | undefined;
  filter_value2: string | number | undefined;
  space?: "native" | "mni" | null;
  essential: boolean;
}

export interface MetricsData {
  [category: string]: {
    [subcategory: string]: Metric[]
  };
}

export interface GetMetricResponse {
  behavioral: MetricsData;
  imaging: MetricsData;
}

export type Timepoint = "baseline" | "multi";
