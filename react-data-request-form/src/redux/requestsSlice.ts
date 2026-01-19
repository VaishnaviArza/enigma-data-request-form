import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import ApiUtils from "../api/ApiUtils";
import { DataRequestIn, DataRequestOut } from "../types/DataRequest";
import { DataFrame, DataSummaries } from "../types/DataTypes";
import { getCurrentUserToken } from "../services/authService";

interface RequestsState {
  fileName: string;
  formSummary: DataRequestIn | undefined;
  isFormSummaryLoading: boolean;
  dataSummary: DataSummaries | undefined;
  isDataSummaryLoading: boolean;
}

const initialState: RequestsState = {
  fileName: "",
  formSummary: undefined,
  isFormSummaryLoading: false,
  dataSummary: undefined,
  isDataSummaryLoading: false,
};

export const fetchFormSummary = createAsyncThunk(
  "requests/fetchFormSummary",
  async (fileName: string, { rejectWithValue }) => {
    try {
      const token = await getCurrentUserToken();
      const response = await ApiUtils.fetchRequest(fileName, token);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//export const fetchDataAndSummary = createAsyncThunk(
//  "requests/fetchDataAndSummary",
//  async (data: DataRequestOut, { rejectWithValue }) => {
//    try {
//      const token = await getCurrentUserToken();
//      const response = await ApiUtils.fetchDataAndSummary(data, token);
//      return response;
//    } catch (error) {
//      return rejectWithValue(error);
//    }
//  }
//);

//export const fetchDataAndSummaryByFilename = createAsyncThunk(
//  "requests/fetchDataAndSummaryByFilename",
//  async (fileName: string, { rejectWithValue }) => {
//    try {
//      const token = await getCurrentUserToken();
//      const response = await ApiUtils.fetchDataAndSummaryByFilename(fileName, token);
//      return response;
//    } catch (error) {
//      return rejectWithValue(error);
//    }
//  }
//);
const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setFilename(state, action: PayloadAction<string>) {
      state.fileName = action.payload;
    },
    setDataSummary(state, action: PayloadAction<DataSummaries>) {
      state.dataSummary = action.payload;
      state.isFormSummaryLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFormSummary.pending, (state) => {
        state.isFormSummaryLoading = true;
      })
      .addCase(fetchFormSummary.fulfilled, (state, action) => {
        state.formSummary = action.payload;
        state.isFormSummaryLoading = false;
      })
      .addCase(fetchFormSummary.rejected, (state) => {
        state.isFormSummaryLoading = false;
      })
      //.addCase(fetchDataAndSummaryByFilename.pending, (state) => {
      //  state.isDataSummaryLoading = true;
      //})
      //.addCase(fetchDataAndSummaryByFilename.fulfilled, (state, action) => {
      //  state.dataSummary = action.payload;
      //  state.isDataSummaryLoading = false;
      //})
      //.addCase(fetchDataAndSummaryByFilename.rejected, (state) => {
      //  state.isDataSummaryLoading = false;
      //})
      //.addCase(fetchDataAndSummary.pending, (state) => {
      //  state.isDataSummaryLoading = true;
      //})
      //.addCase(fetchDataAndSummary.fulfilled, (state, action) => {
      //  state.dataSummary = action.payload;
      //  state.isDataSummaryLoading = false;
      //})
      //.addCase(fetchDataAndSummary.rejected, (state) => {
      //  state.isDataSummaryLoading = false;
      //});
  },
});

export const { setFilename, setDataSummary } = requestsSlice.actions;
export default requestsSlice.reducer;
