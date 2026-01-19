import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import BehavioralMetricSection from './BehavioralCategory';

interface BehavioralMetricContainerProps {
  openCategories: { [key: string]: boolean };
  openSubcategories: { [key: string]: boolean };
  setOpenCategories: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  setOpenSubcategories: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  highlightedMetric?: string | null;
}

const BehavioralMetricContainer: React.FC <BehavioralMetricContainerProps> = ({openCategories,
  openSubcategories,
  setOpenCategories,
  setOpenSubcategories,
  highlightedMetric,
}) => {
  const metricsData = useSelector((state: RootState) => state.metrics.behavioralMetrics);
  const viewMode = useSelector((state: RootState) => state.metrics.viewMode);
  const spaceMode = useSelector((state: RootState) => state.metrics.spaceMode);
  if (Object.keys(metricsData).length === 0) {
    return <div className="metrics-empty">No metrics data available</div>;
  }

  return (
    <div className="metrics-dashboard mt-4">
      <h2 className="mb-3">Behavior</h2>

      {Object.keys(metricsData).map((category) => {
        const filteredSubcategories = Object.fromEntries(
          Object.entries(metricsData[category]).map(([subcategory, metrics]) => {
            const filteredMetrics = metrics.filter((m: any) => {
              //if (!m.show) return false;

              // Basic vs Advanced
              if (viewMode === "basic" && !m.essential) return false;
              //if (viewMode === "advanced" && m.essential) return false;

              // Space filtering
              //if (m.space) {
              //  if (spaceMode === "native" && m.space === "mni") return false;
              //  if (spaceMode === "mni" && m.space === "native") return false;
              //}

              return true;
            });
            return [subcategory, filteredMetrics];
          }).filter(([_, metrics]) => metrics.length > 0)
        );

        // Skip category if no metrics left after filtering
        const hasAnyMetrics = Object.values(filteredSubcategories).some(
          (arr: any) => arr.length > 0
        );
        if (!hasAnyMetrics) return null;

        return (
          <BehavioralMetricSection
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

export default BehavioralMetricContainer;
