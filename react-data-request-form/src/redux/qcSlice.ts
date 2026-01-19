import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dictionary } from "../types/DataTypes";

// Define the state interface
interface QCDataSlice {
  bids_id: string;
  ses_id: string;
  data: Dictionary<string | number> | null;
  initialData: Dictionary<string | number> | null; // Store the original data
  dataChanged: boolean; // Flag to indicate if data has changed
  errors: Dictionary<string | number> | null;
}

// Define the initial state
const initialState: QCDataSlice = {
  bids_id: "",
  ses_id: "",
  data: null,
  initialData: null, // Initialize to null
  dataChanged: false, // Initialize to false
  errors: null,
};

// Deep comparison function for dictionaries
const isDataEqual = (
  data1: Dictionary<string | number> | null,
  data2: Dictionary<string | number> | null
): boolean => {
  if (data1 === data2) return true;
  if (data1 === null || data2 === null) return false;

  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (data1[key] !== data2[key]) {
      return false;
    }
  }

  return true;
};

// Create the Redux slice
const qcDataSlice = createSlice({
  name: "qcData",
  initialState,
  reducers: {
    setBidsId(state, action: PayloadAction<string>) {
      state.bids_id = action.payload;
    },
    setSesId(state, action: PayloadAction<string>) {
      state.ses_id = action.payload;
    },
    setData(state, action: PayloadAction<Dictionary<string | number> | null>) {
      state.data = action.payload;
      state.initialData = JSON.parse(JSON.stringify(state.data)); // Deep copy
      state.dataChanged = false;
    },
    setErrors(
      state,
      action: PayloadAction<Dictionary<string | number> | null>
    ) {
      state.errors = action.payload;
    },
    updateDataKey(
      state,
      action: PayloadAction<{ key: string; value: number | string | null }>
    ) {
      const { key, value } = action.payload;
      if (state.data) {
        state.data[key] = value ?? "";
        // After updating, compare data with initialData
        state.dataChanged = !isDataEqual(state.data, state.initialData);
      }
    },
    resetDataChanged(state) {
      state.dataChanged = false;
      // Optionally, update initialData to current data
      state.initialData = state.data
        ? JSON.parse(JSON.stringify(state.data))
        : null;
    },
  },
});

// Export actions
export const {
  setBidsId,
  setSesId,
  setData,
  setErrors,
  updateDataKey,
  resetDataChanged,
} = qcDataSlice.actions;

// Export the reducer
export default qcDataSlice.reducer;
