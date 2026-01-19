// src/hooks.ts
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";

// Custom hook that dispatches actions with the type of your store's dispatch function
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
