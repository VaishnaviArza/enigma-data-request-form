import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import ImagingMetricSection from './ImagingCategory';
import { useAppDispatch } from "../../../hooks";
import { setSpaceMode } from "../../../redux/metricsSlice";
import { Switch, FormControlLabel, Box } from "@mui/material";
import SmallToggle from "../SmallToggle";

interface ImagingMetricContainerProps {
  openCategories: { [key: string]: boolean };
  openSubcategories: { [key: string]: boolean };
  setOpenCategories: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  setOpenSubcategories: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  highlightedMetric?: string | null;
}

const ImagingMetricContainer: React.FC<ImagingMetricContainerProps> = ({openCategories,
  openSubcategories,
  setOpenCategories,
  setOpenSubcategories,
  highlightedMetric,
}) => {
  const dispatch = useAppDispatch();
  const metricsData = useSelector((state: RootState) => state.metrics.imagingMetrics);
  const viewMode = useSelector((state: RootState) => state.metrics.viewMode);
  const spaceMode = useSelector((state: RootState) => state.metrics.spaceMode);
  const handleSpaceToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSpaceMode(event.target.checked ? "mni" : "native"));
  };
  if (Object.keys(metricsData).length === 0) {
    return <div className="metrics-empty">No metrics data available</div>;
  }
  return (
    <div className="metrics-dashboard mt-4">
      <Box display="flex" alignItems="center" justifyContent="flex-start" gap={2}  mb={2}>
      <h2 style={{ marginBottom: 0 }}>Imaging</h2>
      <SmallToggle
        leftLabel="Native Space"
        rightLabel="MNI Space"
        checked={spaceMode === "mni"}
        onChange={handleSpaceToggle}
        inline
      />
      </Box>
      {Object.keys(metricsData).map((category) => {
        const filteredSubcategories = Object.fromEntries(
          Object.entries(metricsData[category]).map(([subcategory, metrics]) => {
            const filteredMetrics = metrics.filter((m: any) => {
              //if (!m.show) return false;

              if (viewMode === "basic" && !m.essential) return false;
              //if (viewMode === "advanced" && m.essential) return false;

              if (spaceMode === "native" && m.space !== "native" && m.space !== null)
                return false;
              if (spaceMode === "mni" && m.space !== "mni")
                return false;

              return true;
            });
            return [subcategory, filteredMetrics];
          }) .filter(([_, metrics]) => metrics.length > 0)
        );

        // Skip category if no metrics left after filtering
        const hasAnyMetrics = Object.values(filteredSubcategories).some(
          (arr: any) => arr.length > 0
        );
        if (!hasAnyMetrics) return null;
        return (
          <ImagingMetricSection
            key={category}
            category={category}
            metrics={filteredSubcategories}
            openCategories={openCategories}
            openSubcategories={openSubcategories}
            setOpenCategories={setOpenCategories}
            setOpenSubcategories={setOpenSubcategories}
            highlightedMetric={highlightedMetric}
          />
        );
      })}
    </div>
  );
};

export default ImagingMetricContainer;
