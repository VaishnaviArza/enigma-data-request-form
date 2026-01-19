import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "../services/authService";
import { User } from "firebase/auth";

interface DataRequestAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: DataRequestAuthState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
};

export const checkDataRequestAdminStatus = createAsyncThunk(
  "dataRequestAuth/checkAdminStatus",
  async (_, { rejectWithValue }) => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        return { isAdmin: false, user: null };
      }

      const isAdmin = await authService.checkIfDataRequestAdmin();
      return { isAdmin, user };
    } catch (error: any) {
      return rejectWithValue(error.message || "Authentication failed");
    }
  }
);

const dataRequestAuthSlice = createSlice({
  name: "dataRequestAuth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkDataRequestAdminStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkDataRequestAdminStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAdmin = action.payload.isAdmin;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(checkDataRequestAdminStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAdmin = false;
      });
  },
});

export const { setUser, logout: logoutAction, clearError } = dataRequestAuthSlice.actions;
export default dataRequestAuthSlice.reducer;
