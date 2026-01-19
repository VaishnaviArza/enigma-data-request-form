import React, { useState } from 'react';
import styled from 'styled-components';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { RootState } from '../../../redux/store';
import { useSelector } from 'react-redux';
import { setSelected, setRequiredAndUpdateRowCount, setFilterValue1, setFilterValue2 } from '../../../redux/metricsSlice';
import { Metric, MetricTypeValue } from '../../../types/MetricsData';
import { useAppDispatch } from '../../../hooks';
import { hideModal, showModal } from '../../../redux/modalSlice';
import { approximateRecordCountMessage } from '../../../constants';

type MetricType = 'float' | 'int' | 'string' | 'image';

interface MetricProps {
  metricType: 'behavioral' | 'imaging';
  category: string;
  subcategory?: string;
  metricName: string;
  description: string;
  type: MetricTypeValue;
  highlightedMetric?: string | null;
}

const TooltipIcon = styled.i`
  width: 12px;
  height: 12px;
  font-size: 12px;
  line-height: 12px;
  text-align: center;
  margin-left: 2px;
`;

const BehavioralMetricInput: React.FC<MetricProps> = ({
  metricType,
  category,
  subcategory,
  metricName,
  description,
  type,
  highlightedMetric,
}) => {
  const dispatch = useAppDispatch();
  const metricData = useSelector((state: RootState) => {
    const store = 
      metricType === 'behavioral'
      ? state.metrics.behavioralMetrics
      : state.metrics.imagingMetrics
    const categoryData = store[category];
    if (!categoryData) return null;
    const subData = subcategory ? categoryData[subcategory] : categoryData["None"];
    return subData?.find((m) => m.metric_name === metricName);
  });
  if (!metricData) return null;
  //const metricData = useSelector((state: RootState) => state.metrics.behavioralMetrics[category].find(metric => metric.metric_name === metricName)) as Metric;
  const displayName =
  metricData.name && metricData.name.toLowerCase() !== "none"
    ? metricData.name
    : metricName;

  const renderTooltip = (props: any) => (
    <Tooltip id="button-tooltip" {...props}>
      {description}
    </Tooltip>
  );

  const handleSelectedChange = () => {
    // Metric getting deselected, reset required also and update row count
    if (metricData.is_required && metricData.is_selected) {
      dispatch(setRequiredAndUpdateRowCount({ category, metricName, isRequired: !metricData.is_required }));
    }
    dispatch(setSelected({
      category,
      metricName,
      isSelected: !metricData.is_selected
    }));
  };

  const handleRequiredChange = () => {
    dispatch(setRequiredAndUpdateRowCount({ category, metricName, isRequired: !metricData.is_required }));
  };

  const handleFilterValue1Change = (value: string | number) => {
    dispatch(setFilterValue1({category, metricName, value}));
  }

  const handleFilterValue2Change = (value: string | number) => {
    dispatch(setFilterValue2({category, metricName, value}));
  }

  const showAppoximateCountModal = () => {
    dispatch(showModal({ title: "Information", message: approximateRecordCountMessage, modalType: null }));
    setTimeout(() => {
      dispatch(hideModal());
    }, 4000);
  }

  const renderInput = () => {
    return (
      <div className="col p-0 ml-2">
        {type === 'string' ? (
          "Filter for values equal to"
        ) : (
          "Filter for values in range"
        )}
        <div className="d-flex">
          <input
            type={type === 'string' ? "text" : "number"}
            step={type === 'float' ? "0.01" : "1"}
            className="form-control mr-2"
            id={`input_${metricName}_1`}
            name={`start_${metricName}`}
            placeholder={type === 'string' ? undefined : "Minimum"}
            disabled={!metricData.is_required}
            defaultValue={metricData.filter_value1}
            onChange={(e) => handleFilterValue1Change(e.target.value)}
            onBlur={showAppoximateCountModal}
          />
          {type !== 'string' && (
            <input
              type="number"
              step={type === 'float' ? "0.01" : "1"}
              className="form-control"
              id={`input_${metricName}_2`}
              name={`end_${metricName}`}
              placeholder="Maximum"
              disabled={!metricData.is_required}
              defaultValue={metricData.filter_value2}
              onChange={(e) => handleFilterValue2Change(e.target.value)}
              onBlur={showAppoximateCountModal}
            />
          )}
        </div>
      </div>
    );
  };
  return (
    <div 
      id={`metric-${metricName}`} 
      className={`col-md-4 pt-2 pb-4 pr-3 pl-3 filter-input ${
        highlightedMetric === metricName ? "highlighted-metric" : ""
        }`} 
    >
      <div className="form-check">
        <input type="checkbox" id={metricName} className="form-check-input" checked={metricData.is_selected} onChange={handleSelectedChange} />
        <label className="form-check-label text-break" htmlFor={metricName}>
          {displayName}
        </label>
        <OverlayTrigger placement="right" overlay={renderTooltip}>
          <TooltipIcon id={`tooltip-icon-${metricName}`} className="fas fa-info-circle text-primary tooltip-icon" />
        </OverlayTrigger>
      </div>
      {metricData.is_selected && (
        <div className="form-check ml-2">
          <input
            type="checkbox"
            id={`checkbox_required_${metricName}`}
            className="form-check-input"
            checked={metricData.is_required}
            onChange={handleRequiredChange}
          />
          <label className="form-check-label text-break" htmlFor={`checkbox_required_${metricName}`}>
            Record must have this
          </label>
        </div>
      )}
      {metricData.is_required && renderInput()}
    </div>
  );
};

export default BehavioralMetricInput;
