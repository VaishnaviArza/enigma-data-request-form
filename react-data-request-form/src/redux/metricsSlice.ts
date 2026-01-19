// src/features/metrics/metricsSlice.ts
import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
  SerializedError,
} from "@reduxjs/toolkit";
import ApiUtils from "../api/ApiUtils";
import HttpClient from "../api/HttpClient"; // Import HttpClient
import { DataFrame, Row } from "../types/DataTypes";
import {
  GetMetricResponse,
  MetricsData,
  Metric,
  Timepoint,
} from "../types/MetricsData";
import { RecordCountResponse } from "../types/RecordCountResponse";
import { RootState } from "./store";
import TimepointSelection from "../components/TimepointSelection";

export const fetchMetrics = createAsyncThunk<
  GetMetricResponse,
  void,
  { rejectValue: string }
>("metrics/fetchMetrics", async (_, { rejectWithValue }) => {
  try {
    const response = await HttpClient.get<GetMetricResponse>("metrics");
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "An unknown error occurred");
  }
});

export const fetchBooleanData = createAsyncThunk<
  DataFrame,
  void,
  { rejectValue: string }
>("metrics/booleanData", async (_, { rejectWithValue }) => {
  try {
    const response = await ApiUtils.fetchBooleanData(); // Assuming this returns a DataFrame
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "An unknown error occurred");
  }
});

/*
interface ColumnMapping {
  [key: string]: string;
}

const colMapping: ColumnMapping = {
  T1: "T1_in_BIDS",
  T2: "T2_in_BIDS",
  DWI: "DWI_in_BIDS",
  FLAIR: "FLAIR_in_BIDS",
  Native_Lesion: "Raw_Lesion_in_BIDS",
  MNI_T1: "MNI_T1_in_BIDS",
  MNI_Lesion_Mask: "MNI_Lesion_mask_in_BIDS",
};
*/
/*
function applyFiltersAndGetCount(
  data: DataFrame,
  cols: string[],
  session: Timepoint = "baseline"
): number {
  let filteredData = data.filter(
    (row) =>
      cols.every((col) => row[col] !== null && row[col] !== undefined) &&
      row["SES"] !== null &&
      row["BIDS_ID"] !== null
  );

  if (session === "baseline") {
    return filteredData.filter((row) => (row["SES"] as string) === "ses-1")
      .length;
  } else {
    let sessionFiltered = filteredData.filter((row) =>
      ["ses-1", "ses-2"].includes(row["SES"] as string)
    );

    let bidsGroups = sessionFiltered.reduce(
      (acc: { [key: string]: Set<string> }, row) => {
        const bidsId = row["BIDS_ID"] as string;
        acc[bidsId] = acc[bidsId] || new Set<string>();
        acc[bidsId].add(row["SES"] as string);
        return acc;
      },
      {}
    );

    let validBidsIds = Object.keys(bidsGroups).filter(
      (id) => bidsGroups[id].size === 2
    );

    const bidsIds = filteredData.filter((row) => {
      const rowId = row["BIDS_ID"] as number;
      return validBidsIds.includes(rowId.toString());
    });

    return bidsIds.length;
  }
} */
function applyFiltersAndGetCount(
  data: DataFrame,
  cols: string[],
  orGroups: string[][] = [],
  session: Timepoint = "baseline"
): number {
  if (!data || data.length === 0) return 0;

  // Case 1: No required metrics — return total rows by session
  if (cols.length === 0 && orGroups.length === 0) {
    return session === "baseline"
      ? data.filter((row) => (row["SES"] as string) === "ses-1").length
      : data.filter((row) =>
          ["ses-1", "ses-2"].includes(row["SES"] as string)
        ).length;
  }

  // Case 2: Some required metrics — filter by cols == 1
  let filteredData = data.filter(
    (row) => {
      const requiredPass = cols.length === 0 || 
        cols.every((col) => row[col] === 1)
      const orGroupsPass = orGroups.length === 0 ||
        orGroups.every((group) => group.some((metric) => row[metric] === 1))
      return (requiredPass && orGroupsPass && row["SES"] !== null && row["BIDS_ID"] !== null);
    }
  );

  if (session === "baseline") {
    return filteredData.filter((row) => (row["SES"] as string) === "ses-1")
      .length;
  } else {
    let sessionFiltered = filteredData.filter((row) =>
      ["ses-1", "ses-2"].includes(row["SES"] as string)
    );

    let bidsGroups = sessionFiltered.reduce(
      (acc: { [key: string]: Set<string> }, row) => {
        const bidsId = row["BIDS_ID"] as string;
        acc[bidsId] = acc[bidsId] || new Set<string>();
        acc[bidsId].add(row["SES"] as string);
        return acc;
      },
      {}
    );

    let validBidsIds = Object.keys(bidsGroups).filter(
      (id) => bidsGroups[id].size === 2
    );

    const bidsIds = filteredData.filter((row) =>
      validBidsIds.includes(row["BIDS_ID"] as string)
    );

    return bidsIds.length;
  }
}

export const updateRowCount = createAsyncThunk(
  "metrics/updateRowCount",
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const timepoint = state.metrics.timepoint;
    const behavioralRequiredMetrics = Object.values(
      state.metrics.behavioralMetrics
    )
      .flatMap((subcategories) => Object.values(subcategories)
      .flatMap((metrics) => metrics.filter((m) => m.is_required)))
      .map((metric) => metric.metric_name);
    const imagingRequiredMetrics = Object.values(state.metrics.imagingMetrics)
      .flatMap((subcategories) => Object.values(subcategories)
      .flatMap((metrics) => metrics.filter((m) => m.is_required)))
      .map((metric) => metric.metric_name);
    try {
      const filters = {
        timepoint: timepoint as string,
        required_metrics: behavioralRequiredMetrics.concat(imagingRequiredMetrics),
        or_groups: state.metrics.orGroups,
      };
      const response = await HttpClient.post<{
        success: boolean;
        count: number;
        total_sites: number;
        sessions_per_site: { [site: string]: number };
      }>("rows-count", filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error fetching row count");
    }
  }
);

export const setTimepointAndUpdateRowCount = createAsyncThunk(
  "metrics/setTimepointAndUpdateRowCount",
  async ({ timepoint }: { timepoint: Timepoint }, { dispatch }) => {
    // Assume setTimepoint can be a synchronous action
    dispatch(setTimepoint({ timepoint }));
    dispatch(updateRowCount());
  }
);


export const setRequiredAndUpdateRowCount = createAsyncThunk(
  "metrics/setRequiredAndUpdateRowCount",
  async (
    {
      category,
      metricName,
      isRequired,
    }: { category: string; metricName: string; isRequired: boolean },
    { dispatch, getState, rejectWithValue }
  ) => {
    dispatch(setRequired({ category, metricName, isRequired }));
    dispatch(updateRowCount());
  }
);

function isMetricsData(data: any): data is MetricsData {
  return Object.values(data).every((subcategories) =>
    typeof subcategories === "object" && subcategories !== null &&
    Object.values(subcategories).every(
      (metrics) =>
        Array.isArray(metrics) &&
        metrics.every(
          (metric) =>
            "metric_name" in metric &&
            "variable_type" in metric &&
            "description" in metric
        )
    )
  );
}

const metricsSlice = createSlice({
  name: "metrics",
  initialState: {
    timepoint: "baseline" as Timepoint,
    behavioralMetrics: {} as MetricsData,
    imagingMetrics: {} as MetricsData,
    rowCount: 0,
    totalSites: 0,
    sessionsPerSite: {} as { [site: string]: number },
    booleanData: {} as DataFrame,
    status: "idle",
    error: null as string | null | unknown,
    viewMode: "basic" as "basic" | "advanced",
    spaceMode: "native" as "native" | "mni", 
    orGroups: [] as string[][],
  },
  reducers: {
    setTimepoint: (state, action: PayloadAction<{ timepoint: Timepoint }>) => {
      const { timepoint } = action.payload;
      state.timepoint = timepoint;
    },
    restoreStateFromJSON: (
      state,
      action: PayloadAction<{
        timepoint: Timepoint;
        behavioral: MetricsData;
        imaging: MetricsData;
        orGroups: string[][];
        viewMode?: "basic" | "advanced";
      }>
    ) => {
      const { timepoint, behavioral, imaging, orGroups, viewMode } = action.payload;
      
      // Set timepoint
      state.timepoint = timepoint;
      
      // Set view mode if provided
      if (viewMode) {
        state.viewMode = viewMode;
      }
      
      // Restore behavioral metrics
      state.behavioralMetrics = behavioral;
      
      // Restore imaging metrics
      state.imagingMetrics = imaging;
      
      // Restore OR groups
      state.orGroups = orGroups;
    },
    /*
    setSelected: (
      state,
      action: PayloadAction<{
        category: string;
        metricName: string;
        isSelected: boolean;
      }>
    ) => {
      const { category, metricName, isSelected } = action.payload;
      let metrics: Metric[] = [];
      if (category === "imaging") {
        metrics = state.imagingMetrics[category];
      } else {
        metrics = state.behavioralMetrics[category];
      }
      const metricIndex = metrics.findIndex(
        (m) => m.metric_name === metricName
      );
      if (metricIndex !== -1) {
        metrics[metricIndex].is_selected = isSelected;
      }
    }, */
    setSelected: (
      state,
      action: PayloadAction<{
        category: string;
        metricName: string;
        isSelected: boolean;
      }>
    ) => {
      const { category, metricName, isSelected } = action.payload;
      if (state.behavioralMetrics[category]) {
        const subcategories = state.behavioralMetrics[category];
        for (const [subcat, metrics] of Object.entries(subcategories)) {
          const metricIndex = metrics.findIndex(
            (m) => m.metric_name === metricName
          );
          if (metricIndex !== -1) {
            metrics[metricIndex].is_selected = isSelected;
            return;
          }
        }
      }
      if (state.imagingMetrics[category]) {
        const subcategories = state.imagingMetrics[category];
        for (const [subcat, metrics] of Object.entries(subcategories)) {
          const metricIndex = metrics.findIndex(
            (m) => m.metric_name === metricName
          );
          if (metricIndex !== -1) {
            metrics[metricIndex].is_selected = isSelected;
            return;
          }
        }
      }
    },
    /*
    setSelectedAll: (state, action: PayloadAction<{ category: string }>) => {
      const { category } = action.payload;
      const categoryData = state.behavioralMetrics[category];
      if (categoryData && Array.isArray(categoryData)) {
        categoryData.forEach((metric) => {
          metric.is_selected = true;
        });
      }
    }, */
    setSelectedAll: (
      state,
      action: PayloadAction<{ category: string; subcategory?: string; isSelected?: boolean }>
    ) => {
      const { category, subcategory, isSelected = true } = action.payload;

      const updateSelection = (metrics: Metric[]) => {
        metrics.forEach((m) => {
          if (state.viewMode === "basic" && !m.essential) return;
          if (state.spaceMode === "native" && m.space === 'mni') return;
          if (state.spaceMode === "mni" && m.space !== 'mni') return;
          m.is_selected = isSelected;
        });
      };

      if (subcategory && state.behavioralMetrics[category]?.[subcategory]) {
        updateSelection(state.behavioralMetrics[category][subcategory]);
        return;
      }

      if (subcategory && state.imagingMetrics[category]?.[subcategory]) {
        updateSelection(state.imagingMetrics[category][subcategory]);
        return;
      }

      if (state.behavioralMetrics[category]) {
        Object.values(state.behavioralMetrics[category]).forEach(updateSelection);
      }

      if (state.imagingMetrics[category]) {
        Object.values(state.imagingMetrics[category]).forEach(updateSelection);
      }
    },
    /*
    resetSelectedAll: (state, action: PayloadAction<{ category: string }>) => {
      const { category } = action.payload;
      const categoryData = state.behavioralMetrics[category];
      if (categoryData && Array.isArray(categoryData)) {
        categoryData.forEach((metric) => {
          metric.is_selected = false;
        });
      }
    }, */
    resetSelectedAll: (
      state,
      action: PayloadAction<{ category: string; subcategory?: string }>
    ) => {
      const { category, subcategory } = action.payload;

      // Deselect all within a specific subcategory
      if (subcategory && state.behavioralMetrics[category]?.[subcategory]) {
        const metrics = state.behavioralMetrics[category][subcategory];
        metrics.forEach((metric) => {
          metric.is_selected = false;
        });
        return;
      }

      if (subcategory && state.imagingMetrics[category]?.[subcategory]) {
        const metrics = state.imagingMetrics[category][subcategory];
        metrics.forEach((metric) => {
          metric.is_selected = false;
        });
      return;
      }

      // Deselect all within an entire category
      if (state.behavioralMetrics[category]) {
        const subcategories = state.behavioralMetrics[category];
        if (subcategories && typeof subcategories === "object") {
          for (const metrics of Object.values(subcategories)) {
            if (Array.isArray(metrics)) {
              metrics.forEach((metric) => {
                metric.is_selected = false;
              });
            }
          }
        }
      }

      if (state.imagingMetrics[category]) {
        const subcategories = state.imagingMetrics[category];
        if (subcategories && typeof subcategories === "object") {
          for (const metrics of Object.values(subcategories)) {
            if (Array.isArray(metrics)) {
              metrics.forEach((metric) => {
                metric.is_selected = false;
              });
            }
          }
        }
      }
    },
    /*
    setRequired: (
      state,
      action: PayloadAction<{
        category: string;
        metricName: string;
        isRequired: boolean;
      }>
    ) => {
      const { category, metricName, isRequired } = action.payload;
      let metrics: Metric[] = [];
      if (category === "imaging") {
        metrics = state.imagingMetrics[category];
      } else {
        metrics = state.behavioralMetrics[category];
      }
      if (Object.keys(metrics).length > 0) {
        const metricIndex = metrics.findIndex(
          (m) => m.metric_name === metricName
        );
        if (metricIndex !== -1) {
          metrics[metricIndex].is_required = isRequired;
        }
      }
    }, */
    setRequired: (
      state,
      action: PayloadAction<{
        category: string;
        metricName: string;
        isRequired: boolean;
      }>
    ) => {
      const { category, metricName, isRequired } = action.payload;

    // Try updating inside behavioral metrics first
    if (state.behavioralMetrics[category]) {
      const subcategories = state.behavioralMetrics[category];
      for (const [subcat, metrics] of Object.entries(subcategories)) {
        const metricIndex = metrics.findIndex(
          (m) => m.metric_name === metricName
        );
        if (metricIndex !== -1) {
          metrics[metricIndex].is_required = isRequired;
          return; // found and updated → stop
        }
      }
    }

    // Try imaging metrics if not found above
    if (state.imagingMetrics[category]) {
      const subcategories = state.imagingMetrics[category];
      for (const [subcat, metrics] of Object.entries(subcategories)) {
        const metricIndex = metrics.findIndex(
          (m) => m.metric_name === metricName
        );
        if (metricIndex !== -1) {
          metrics[metricIndex].is_required = isRequired;
          return;
        }
      }
    }
  },
  /*
    setRequiredAll: (state, action: PayloadAction<{ category: string }>) => {
      const { category } = action.payload;
      const categoryData = state.behavioralMetrics[category];
      if (categoryData && Array.isArray(categoryData)) {
        categoryData.forEach((metric) => {
          metric.is_required = true;
        });
      }
    }, */
    setRequiredAll: (
      state,
      action: PayloadAction<{ category: string; subcategory?: string }>
    ) => {
      const { category, subcategory } = action.payload;

      // Deselect all within a specific subcategory
      if (subcategory && state.behavioralMetrics[category]?.[subcategory]) {
        const metrics = state.behavioralMetrics[category][subcategory];
        metrics.forEach((metric) => {
          metric.is_required = true;
        });
        return;
      }

      if (subcategory && state.imagingMetrics[category]?.[subcategory]) {
        const metrics = state.imagingMetrics[category][subcategory];
        metrics.forEach((metric) => {
          metric.is_required = true;
        });
      return;
      }

      // Deselect all within an entire category
      if (state.behavioralMetrics[category]) {
        const subcategories = state.behavioralMetrics[category];
        if (subcategories && typeof subcategories === "object") {
          for (const metrics of Object.values(subcategories)) {
            if (Array.isArray(metrics)) {
              metrics.forEach((metric) => {
                metric.is_required = true;
              });
            }
          }
        }
      }

      if (state.imagingMetrics[category]) {
        const subcategories = state.imagingMetrics[category];
        if (subcategories && typeof subcategories === "object") {
          for (const metrics of Object.values(subcategories)) {
            if (Array.isArray(metrics)) {
              metrics.forEach((metric) => {
                metric.is_required = true;
              });
            }
          }
        }
      }
    },
    /*
    resetRequiredAll: (state, action: PayloadAction<{ category: string }>) => {
      const { category } = action.payload;
      const categoryData = state.behavioralMetrics[category];
      if (categoryData && Array.isArray(categoryData)) {
        categoryData.forEach((metric) => {
          metric.is_required = false;
        });
      }
    }, */
    resetRequiredAll: (
      state,
      action: PayloadAction<{ category: string; subcategory?: string }>
    ) => {
      const { category, subcategory } = action.payload;

      // Deselect all within a specific subcategory
      if (subcategory && state.behavioralMetrics[category]?.[subcategory]) {
        const metrics = state.behavioralMetrics[category][subcategory];
        metrics.forEach((metric) => {
          metric.is_required = false;
        });
        return;
      }

      if (subcategory && state.imagingMetrics[category]?.[subcategory]) {
        const metrics = state.imagingMetrics[category][subcategory];
        metrics.forEach((metric) => {
          metric.is_required = false;
        });
      return;
      }

      // Deselect all within an entire category
      if (state.behavioralMetrics[category]) {
        const subcategories = state.behavioralMetrics[category];
        if (subcategories && typeof subcategories === "object") {
          for (const metrics of Object.values(subcategories)) {
            if (Array.isArray(metrics)) {
              metrics.forEach((metric) => {
                metric.is_required = false;
              });
            }
          }
        }
      }

      if (state.imagingMetrics[category]) {
        const subcategories = state.imagingMetrics[category];
        if (subcategories && typeof subcategories === "object") {
          for (const metrics of Object.values(subcategories)) {
            if (Array.isArray(metrics)) {
              metrics.forEach((metric) => {
                metric.is_required = false;
              });
            }
          }
        }
      }
    },
    setViewMode: (state, action: PayloadAction<"basic" | "advanced">) => {
      state.viewMode = action.payload;
    },

    setSpaceMode: (state, action: PayloadAction<"native" | "mni">) => {
      state.spaceMode = action.payload;
    },
    setOrGroups(state, action: PayloadAction<string[][]>) {
      state.orGroups = action.payload;
    },
    addOrGroup(state) {
      state.orGroups.push([]); // creates an empty group
    },
    updateOrGroup(state, action: PayloadAction<{ index: number; metrics: string[] }>) {
      const { index, metrics } = action.payload;
      state.orGroups[index] = metrics;
    },
    removeOrGroup(state, action: PayloadAction<number>) {
      state.orGroups.splice(action.payload, 1);
    },
    /*
    setFilterValue1: (
      state,
      action: PayloadAction<{
        category: string;
        metricName: string;
        value: string | number;
      }>
    ) => {
      const { category, metricName, value } = action.payload;
      const metrics = state.behavioralMetrics[category];
      const metricIndex = metrics.findIndex(
        (m) => m.metric_name === metricName
      );
      if (metricIndex !== -1) {
        metrics[metricIndex].filter_value1 = value;
      }
    }, */
    setFilterValue1: (
      state,
      action: PayloadAction<{
        category: string;
        metricName: string;
        value: string | number;
      }>
    ) => {
      const { category, metricName, value } = action.payload;

  // Check in behavioral metrics
      if (state.behavioralMetrics[category]) {
        const subcategories = state.behavioralMetrics[category];
        for (const [subcat, metrics] of Object.entries(subcategories)) {
          const metricIndex = metrics.findIndex(
            (m) => m.metric_name === metricName
          );
          if (metricIndex !== -1) {
            metrics[metricIndex].filter_value1 = value;
            return; // stop once found
          }
        }
      }

  // Check in imaging metrics
      if (state.imagingMetrics[category]) {
        const subcategories = state.imagingMetrics[category];
        for (const [subcat, metrics] of Object.entries(subcategories)) {
          const metricIndex = metrics.findIndex(
            (m) => m.metric_name === metricName
          );
          if (metricIndex !== -1) {
            metrics[metricIndex].filter_value1 = value;
            return;
          }
        }
      }
    },
    /*
    setFilterValue2: (
      state,
      action: PayloadAction<{
        category: string;
        metricName: string;
        value: string | number;
      }>
    ) => {
      const { category, metricName, value } = action.payload;
      const metrics = state.behavioralMetrics[category];
      const metricIndex = metrics.findIndex(
        (m) => m.metric_name === metricName
      );
      if (metricIndex !== -1) {
        metrics[metricIndex].filter_value2 = value;
      }
    }, */
        setFilterValue2: (
      state,
      action: PayloadAction<{
        category: string;
        metricName: string;
        value: string | number;
      }>
    ) => {
      const { category, metricName, value } = action.payload;

  // Check in behavioral metrics
      if (state.behavioralMetrics[category]) {
        const subcategories = state.behavioralMetrics[category];
        for (const [subcat, metrics] of Object.entries(subcategories)) {
          const metricIndex = metrics.findIndex(
            (m) => m.metric_name === metricName
          );
          if (metricIndex !== -1) {
            metrics[metricIndex].filter_value2 = value;
            return; // stop once found
          }
        }
      }

  // Check in imaging metrics
      if (state.imagingMetrics[category]) {
        const subcategories = state.imagingMetrics[category];
        for (const [subcat, metrics] of Object.entries(subcategories)) {
          const metricIndex = metrics.findIndex(
            (m) => m.metric_name === metricName
          );
          if (metricIndex !== -1) {
            metrics[metricIndex].filter_value2 = value;
            return;
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchMetrics.fulfilled,
        (state, action: PayloadAction<GetMetricResponse>) => {
          state.status = "succeeded";
          const { behavioral, imaging } = action.payload;
          const addDefaultToMetrics = (data: MetricsData) =>
          //   const behavioralMetrics = action.payload["behavioral"];
          //if (isMetricsData(behavioral)) {
          Object.fromEntries(
            Object.entries(data).map(([category, subcategories]) => [
              category,
              Object.fromEntries(
                Object.entries(subcategories).map(
                  ([subcat, metrics]) => [
                      subcat,
                      metrics.map((metric) => ({
                        ...metric,
                        is_required: metric.is_required ?? false,
                        is_selected: metric.is_selected ?? false,
                        filter_value1: metric.filter_value1 ?? "",
                        filter_value2: metric.filter_value2 ?? "",
                      })),
                    ]
                  )
                ),
              ])
            );
            if(isMetricsData(behavioral)) {
              state.behavioralMetrics = addDefaultToMetrics(behavioral);
            }
            if(isMetricsData(imaging)) {
              state.imagingMetrics = addDefaultToMetrics(imaging);
            }
            
          }

          //   const imagingMetrics = action.payload['imaging']
          /*
          const imagingMetricsWithDefaults = imaging.map((metricName) => ({
            metric_name: metricName,
            variable_type: "image",
            description: "",
            is_selected: false,
            is_required: false,
            filter_value1: undefined,
            filter_value2: undefined,
          }));
          state.imagingMetrics = {
            imaging: imagingMetricsWithDefaults,
          } as MetricsData;
        } */
      )
      .addCase(
        fetchMetrics.rejected,
        (
          state,
          action: PayloadAction<
            string | undefined,
            string,
            never,
            SerializedError
          >
        ) => {
          state.status = "failed";
          state.error = action.payload || "Failed to fetch data";
        }
      );
    builder
      .addCase(updateRowCount.fulfilled, (state, action) => {
        state.rowCount = action.payload.count; // Update the row count in state
        state.totalSites = action.payload.total_sites || 0;
        state.sessionsPerSite = action.payload.sessions_per_site || {};
      })
      .addCase(updateRowCount.rejected, (state, action) => {
        state.error = action.payload; // Handle any errors
      });
    builder
      .addCase(fetchBooleanData.fulfilled, (state, action) => {
        state.booleanData = action.payload;
        state.rowCount = applyFiltersAndGetCount(action.payload, []);
      })
      .addCase(fetchBooleanData.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default metricsSlice.reducer;
export const {
  setTimepoint,
  setSelected,
  setSelectedAll,
  resetSelectedAll,
  setRequired,
  setRequiredAll,
  resetRequiredAll,
  setFilterValue1,
  setFilterValue2,
  setViewMode,
  setSpaceMode,
  setOrGroups, 
  addOrGroup, 
  updateOrGroup, 
  removeOrGroup,
  restoreStateFromJSON,
} = metricsSlice.actions;
