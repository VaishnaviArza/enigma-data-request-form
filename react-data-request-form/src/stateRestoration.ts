import { DataRequestOut, MetricEntry } from "./types/DataRequest";
import { MetricsData, Timepoint } from "./types/MetricsData";

interface MetricSummary {
  category: string;
  subcategory?: string;
  metricName: string;
  displayName: string;
  type: string;
  is_required?: boolean;
  inOrGroup?: boolean;
}

interface RestoredState {
  timepoint: Timepoint;
  behavioral: MetricsData;
  imaging: MetricsData;
  orGroups: string[][];
  orGroupsSummary: MetricSummary[][];
  notes: string;
  proposalStatus: string;
  viewMode: "basic" | "advanced";
}

export const parseJSONToState = (
  jsonData: any,
  currentBehavioral: MetricsData,
  currentImaging: MetricsData
): RestoredState => {
  // Extract the request object (handle both formats)
  const request = jsonData.request || jsonData;

  // Deep clone the current metrics to avoid mutation
  const restoredBehavioral = JSON.parse(JSON.stringify(currentBehavioral));
  const restoredImaging = JSON.parse(JSON.stringify(currentImaging));

  // Reset all metrics first
  Object.values(restoredBehavioral).forEach((subcategories: any) => {
    Object.values(subcategories).forEach((metrics: any) => {
      metrics.forEach((metric: any) => {
        metric.is_selected = false;
        metric.is_required = false;
        metric.filter_value1 = undefined;
        metric.filter_value2 = undefined;
      });
    });
  });

  Object.values(restoredImaging).forEach((subcategories: any) => {
    Object.values(subcategories).forEach((metrics: any) => {
      metrics.forEach((metric: any) => {
        metric.is_selected = false;
        metric.is_required = false;
        metric.filter_value1 = undefined;
        metric.filter_value2 = undefined;
      });
    });
  });

  // Helper function to find and update a metric
  const updateMetric = (
    metricsData: MetricsData,
    metricEntry: MetricEntry,
    isRequired: boolean
  ) => {
    const { metric_name, category, value1, value2 } = metricEntry;

    if (metricsData[category]) {
      Object.values(metricsData[category]).forEach((metrics: any) => {
        const metric = metrics.find((m: any) => m.metric_name === metric_name);
        if (metric) {
          metric.is_selected = true;
          metric.is_required = isRequired;
          if (value1 !== null && value1 !== undefined) {
            metric.filter_value1 = value1;
          }
          if (value2 !== null && value2 !== undefined) {
            metric.filter_value2 = value2;
          }
        }
      });
    }
  };
  // Helper function to find metric details for OR groups
  const findMetricDetails = (
    metricEntry: MetricEntry,
    metricsData: MetricsData
  ): MetricSummary | null => {
    const { metric_name, category, display_name, type } = metricEntry;

    if (metricsData[category]) {
      for (const [subcategory, metrics] of Object.entries(metricsData[category])) {
        const metric = (metrics as any[]).find((m: any) => m.metric_name === metric_name);
        if (metric) {
          return {
            category,
            subcategory: subcategory === "None" ? undefined : subcategory,
            metricName: metric_name,
            displayName: display_name || metric.name || metric_name,
            type: type || metric.variable_type,
            is_required: false,
            inOrGroup: true,
          };
        }
      }
    }
    return null;
  };


  // Restore behavioral metrics
  if (request.behavior) {
    request.behavior.required?.forEach((entry: MetricEntry) => {
      updateMetric(restoredBehavioral, entry, true);
    });
    request.behavior.optional?.forEach((entry: MetricEntry) => {
      updateMetric(restoredBehavioral, entry, false);
    });
  }

  // Restore imaging metrics
  if (request.imaging) {
    request.imaging.required?.forEach((entry: MetricEntry) => {
      updateMetric(restoredImaging, entry, true);
    });
    request.imaging.optional?.forEach((entry: MetricEntry) => {
      updateMetric(restoredImaging, entry, false);
    });
  }

  // Restore OR groups
  const orGroups: string[][] = [];
  const orGroupsSummary: MetricSummary[][] = [];
  if (request.or_groups && Array.isArray(request.or_groups)) {
    request.or_groups.forEach((group: any) => {
      const groupMetrics = group.metrics.map((m: MetricEntry) => m.metric_name);
      orGroups.push(groupMetrics);
      const groupSummary: MetricSummary[] = [];

      // Mark OR group metrics as selected but not required
      group.metrics.forEach((entry: MetricEntry) => {
        updateMetric(restoredBehavioral, entry, false);
        updateMetric(restoredImaging, entry, false);
        let metricSummary = findMetricDetails(entry, restoredBehavioral);
        if (!metricSummary) {
          metricSummary = findMetricDetails(entry, restoredImaging);
        }
        if (metricSummary) {
          groupSummary.push(metricSummary);
        }
      });
      orGroupsSummary.push(groupSummary);
    });
  }

  // Determine view mode based on OR groups
  const viewMode = orGroups.length > 0 ? "advanced" : "basic";

  return {
    timepoint: request.timepoint as Timepoint,
    behavioral: restoredBehavioral,
    imaging: restoredImaging,
    orGroups,
    orGroupsSummary,
    notes: request.notes || "",
    proposalStatus: request.proposal_status || "",
    viewMode,
  };
};

export const createDownloadableState = (
  metricsData: any,
  timepoint: Timepoint
): any => {
  const makeMetricEntry = (metric: any, category: string) => ({
    metric_name: metric.metric_name,
    display_name:
      metric.name && metric.name.toLowerCase() !== "none"
        ? metric.name
        : metric.metric_name,
    value1: metric.filter_value1 || null,
    value2: metric.filter_value2 || null,
    type: metric.variable_type,
    category,
  });

  const data: any = {
    timepoint: timepoint,
    behavior: { required: [], optional: [] },
    imaging: { required: [], optional: [] },
    or_groups: [],
    notes: "",
  };

  // Collect OR group metric names
  const orMetricNames = new Set<string>();
  if (metricsData.orGroups && metricsData.orGroups.length > 0) {
    data.or_groups = metricsData.orGroups.map((group: string[], idx: number) => {
      const groupMetrics = group.map((metricName) => {
        orMetricNames.add(metricName);
        
        // Find the metric in behavioral or imaging
        let metricData = null;
        let category = "";

        // Search in behavioral
        for (const [cat, subcats] of Object.entries(metricsData.behavioralMetrics)) {
          for (const metrics of Object.values(subcats as any)) {
            const found = (metrics as any[]).find((m: any) => m.metric_name === metricName);
            if (found) {
              metricData = found;
              category = cat;
              break;
            }
          }
          if (metricData) break;
        }

        // Search in imaging if not found
        if (!metricData) {
          for (const [cat, subcats] of Object.entries(metricsData.imagingMetrics)) {
            for (const metrics of Object.values(subcats as any)) {
              const found = (metrics as any[]).find((m: any) => m.metric_name === metricName);
              if (found) {
                metricData = found;
                category = cat;
                break;
              }
            }
            if (metricData) break;
          }
        }

        return {
          metric_name: metricName,
          display_name: metricData?.name && metricData.name.toLowerCase() !== "none"
            ? metricData.name
            : metricName,
          type: metricData?.variable_type || "string",
          category: category,
        };
      });
      return { group_id: idx + 1, metrics: groupMetrics };
    });
  }

  // Process behavioral metrics
  Object.entries(metricsData.behavioralMetrics).forEach(([category, subcats]: [string, any]) => {
    Object.values(subcats).forEach((metrics: any) => {
      metrics
        .filter((m: any) => m.is_selected)
        .forEach((metric: any) => {
          if (orMetricNames.has(metric.metric_name)) return;
          const entry = makeMetricEntry(metric, category);
          if (metric.is_required) data.behavior.required.push(entry);
          else data.behavior.optional.push(entry);
        });
    });
  });

  // Process imaging metrics
  Object.entries(metricsData.imagingMetrics).forEach(([category, subcats]: [string, any]) => {
    Object.values(subcats).forEach((metrics: any) => {
      metrics
        .filter((m: any) => m.is_selected)
        .forEach((metric: any) => {
          if (orMetricNames.has(metric.metric_name)) return;
          const entry = makeMetricEntry(metric, category);
          if (metric.is_required) data.imaging.required.push(entry);
          else data.imaging.optional.push(entry);
        });
    });
  });

  return {
    request: data,
    status: "pending",
  };
};