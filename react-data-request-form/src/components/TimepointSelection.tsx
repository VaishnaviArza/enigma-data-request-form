import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useAppDispatch } from "../hooks";
import {
  setTimepointAndUpdateRowCount,
  setViewMode,
} from "../redux/metricsSlice";
import { Switch, FormControlLabel, Divider, Box } from "@mui/material";
import SmallToggle from "./DataRequestForm/SmallToggle";

const TimepointSelection = () => {
  const dispatch = useAppDispatch();
  const timepoint = useSelector((state: RootState) => state.metrics.timepoint);
  const viewMode = useSelector((state: RootState) => state.metrics.viewMode);

  const handleTimepointToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      setTimepointAndUpdateRowCount({
        timepoint: event.target.checked ? "multi" : "baseline",
      })
    );
  };

  const handleViewModeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setViewMode(event.target.checked ? "advanced" : "basic"));
  };

  return (
    <Box mt={3} mb={2}>
      {/* --- Data Type --- */}
      <SmallToggle
        leftLabel="Cross-sectional (Baseline Only)"
        rightLabel="Longitudinal"
        checked={timepoint === "multi"}
        onChange={handleTimepointToggle}
      />

      {/* --- Metric Set --- */}
      <Box mt={1.5}>
        <SmallToggle
          leftLabel="Basic Metrics"
          rightLabel="Advanced Metrics"
          checked={viewMode === "advanced"}
          onChange={handleViewModeToggle}
        />
      </Box>

      <Divider sx={{ my: 2 }} />
    </Box>
  );
};

export default TimepointSelection;


