import React, { useState } from 'react';
import BehavioralMetricInput from '../Behavioral/BehavioralMetric';
import { Metric } from '../../../types/MetricsData';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleChevronRight, faCircleChevronDown } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedAll, setRequiredAll, resetRequiredAll, resetSelectedAll } from '../../../redux/metricsSlice';
import { RootState } from '../../../redux/store';

// Styled components
const StyledCard = styled(Card)`
  background-color: #f0f0f0;
  margin-bottom: 1rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const CardTitle = styled(Card.Title)`
  margin: 0; // Adjust title margins as needed
`;

const StyleCheckbox = styled.input`
  margin-right: 0.5rem;
`;

const StyledLabel = styled.label`
  margin-right: 1rem;
  font-weight: normal;
`;

interface ImagingMetricSectionProps {
  category: string;
  metrics: {[subcategory: string]: Metric[]};
  openCategories: { [key: string]: boolean };
  openSubcategories: { [key: string]: boolean };
  setOpenCategories: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  setOpenSubcategories: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  highlightedMetric?: string | null;
}

const ImagingMetricCategory: React.FC<ImagingMetricSectionProps> = ({ 
  category, metrics, openCategories, openSubcategories, setOpenCategories, setOpenSubcategories, highlightedMetric}) => {
  const dispatch = useDispatch()
  //const allMetrics = Object.values(metrics).flat()
  //const metricsData = useSelector((state: RootState) => state.metrics.behavioralMetrics[category])
  //const isAllSelected = allMetrics.every((m) => m.is_selected)
  //const isAllRequired = allMetrics.every((m) => m.is_required)
  //const [isOpen, setIsOpen] = useState(false);
  const isOpen = openCategories[category] || false;
  //const [openSubcategories, setOpenSubcategories] = useState<{
  //    [key: string]: boolean;
  //}>({});
  const allMetrics = Object.values(metrics).flat();
  const selectedCount = allMetrics.filter((m) => m.is_selected).length;
  const toggleOpen = () => {
    setOpenCategories((prevCategories) => {
      const isCurrentlyOpen = !!prevCategories[category];
      const newCategories = { ...prevCategories, [category]: !isCurrentlyOpen };

      // If collapsing → close all its subcategories
      if (isCurrentlyOpen) {
        setOpenSubcategories((prevSubs) => {
          const updatedSubs = { ...prevSubs };
          Object.keys(updatedSubs).forEach((key) => {
            if (key.startsWith(`${category}_`)) {
              delete updatedSubs[key];
            }
          });
          return updatedSubs;
        });
      }

      return newCategories;
    });
  };

  const toggleSubcategory = (subcategory: string) => {
  setOpenSubcategories((prev) => ({
    ...prev,
    [`${category}_${subcategory}`]: !prev[`${category}_${subcategory}`],
  }));
};

  const handleSelectAll = (subcategory: string) => {
      const subMetrics =metrics[subcategory];
      const allSelected = subMetrics.every((m) => m.is_selected);
      if (allSelected) {
        dispatch(resetSelectedAll({ category, subcategory }));
        dispatch(resetRequiredAll({ category, subcategory }));
        //dispatch(setSelectedAll({category}))
      }
      else {
        dispatch(setSelectedAll({ category, subcategory }));
        //dispatch(resetSelectedAll({category}))
        //dispatch(resetRequiredAll({category}))
      }
  };

  const handleRequiredAll = (subcategory: string) => {
      const subMetrics =metrics[subcategory];
      const allRequired = subMetrics.every((m) => m.is_required);
      if(allRequired){
        //dispatch(setRequiredAll({category}))
        dispatch(resetRequiredAll({ category, subcategory }));
      }
      else {
        dispatch(setRequiredAll({ category, subcategory }));
        //dispatch(resetRequiredAll({category}))
      }
  };
  const viewMode = useSelector((state: RootState) => state.metrics.viewMode);
/*
  return (
    <StyledCard>
      <Card.Body>
        <CardHeader onClick={toggleOpen}>
          <div className='d-flex'>
        <FontAwesomeIcon style={{cursor: 'pointer'}} onClick={toggleOpen} icon={isOpen ? faCircleChevronDown : faCircleChevronRight} className="float-left pt-1 mr-2" />
        <CardTitle>{category}</CardTitle>
        </div>
        </CardHeader>
        {isOpen && (
          <>
          <div className="col-12 d-flex justify-content-start ml-1 mt-2">
            <div className='mr-2'>
              <StyleCheckbox type="checkbox" className="form-check-input" id={`select_all_${category}`} onChange={handleSelectAll} checked={isAllSelected}/>
              <StyledLabel htmlFor={`select_all_${category}`}>Select All</StyledLabel>
            </div>
            {isAllSelected && <div>
              <StyleCheckbox type="checkbox" className="form-check-input" id={`all_required_${category}`} onChange={handleRequiredAll} checked={isAllRequired} />
              <StyledLabel htmlFor={`all_required_${category}`}>Make all required</StyledLabel>
            </div>}
          </div>
            <div className="metrics-list row">
              {metrics.map((metric) => (
                <BehavioralMetricInput
                  key={metric.metric_name}
                  category={category}
                  metricName={metric.metric_name}
                  description={metric.description}
                  type={metric.variable_type}
                />
              ))}
            </div>
          </>
        )}
      </Card.Body>
    </StyledCard>
  );*/
    return (
    <StyledCard>
          <Card.Body>
            {/* Category header */}
            <CardHeader onClick={toggleOpen}>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon
                  style={{ cursor: "pointer" }}
                  icon={isOpen ? faCircleChevronDown : faCircleChevronRight}
                  className="float-left pt-1 mr-2"
                />
                <CardTitle>{category}</CardTitle>
              </div>
              <small className="text-muted">
              {selectedCount} selected
              </small>
            </CardHeader>
    
            {/* If category expanded */}
            {isOpen && (
              <>
                {viewMode !== 'advanced' ? (
                  <div className="metrics-list row mt-3 ml-2">
                    <div className="col-12 d-flex justify-content-start mb-2">
                      <div className="mr-3">
                        <StyleCheckbox
                          type="checkbox"
                          className="form-check-input"
                          id={`select_all_${category}_basic`}
                          checked={Object.values(metrics)
                            .flatMap((subMetrics) => subMetrics)
                            .every((m) => m.is_selected)}
                          onChange={() => {
                            const allSelected = Object.values(metrics)
                              .flatMap((subMetrics) => subMetrics)
                              .every((m) => m.is_selected);
                            if (allSelected) {
                              dispatch(resetSelectedAll({ category }));
                            } else {
                              dispatch(setSelectedAll({ category }));
                            }
                          }}
                        />
                        <StyledLabel htmlFor={`select_all_${category}_basic`}>
                          Select All
                        </StyledLabel>
                      </div>
                      {Object.values(metrics)
                  .flatMap((subMetrics) => subMetrics)
                  .every((m) => m.is_selected) && (
                  <div>
                    <StyleCheckbox
                      type="checkbox"
                      className="form-check-input"
                      id={`required_all_${category}_basic`}
                      checked={Object.values(metrics)
                        .flatMap((subMetrics) => subMetrics)
                        .every((m) => m.is_required)}
                      onChange={() => {
                        const allRequired = Object.values(metrics)
                          .flatMap((subMetrics) => subMetrics)
                          .every((m) => m.is_required);
                        if (allRequired) {
                          dispatch(resetRequiredAll({ category }));
                        } else {
                          dispatch(setRequiredAll({ category }));
                        }
                      }}
                    />
                    <StyledLabel htmlFor={`required_all_${category}_basic`}>
                      Make all required
                    </StyledLabel>
                  </div>
                )}
              </div>
                    {Object.keys(metrics)
                      .filter((subcategory) => Array.isArray(metrics[subcategory]) && metrics[subcategory].length > 0)
                      .flatMap((subcategory) => metrics[subcategory]
                      .map((metric) => (
                        <BehavioralMetricInput
                        key={`${subcategory}-${metric.metric_name}`}
                        category={category}
                        subcategory={subcategory}
                        metricName={metric.metric_name}
                        description={metric.description}
                        type={metric.variable_type}
                        metricType="imaging"
                        highlightedMetric={highlightedMetric}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <>
                  {/* Metrics with subcategory = None */}
                  {metrics["None"] && (
                    <div className="metrics-list row mt-3 ml-2">
                      {/* Subcategory-level toggles for 'None' */}
                      <div className="col-12 d-flex justify-content-start mb-2">
                        <div className="mr-3">
                          <StyleCheckbox
                            type="checkbox"
                            className="form-check-input"
                            id={`select_all_${category}_none`}
                            checked={metrics["None"].every((m) => m.is_selected)}
                            onChange={() =>
                              dispatch(
                                metrics["None"].every((m) => m.is_selected)
                                ? resetSelectedAll({ category, subcategory: "None" })
                                : setSelectedAll({ category, subcategory: "None" })
                              )
                            }
                          />
                          <StyledLabel htmlFor={`select_all_${category}_none`}>
                            Select All
                          </StyledLabel>
                        </div>
                        {metrics["None"].every((m) => m.is_selected) && (
                          <div>
                            <StyleCheckbox
                              type="checkbox"
                              className="form-check-input"
                              id={`required_all_${category}_none`}
                              checked={metrics["None"].every((m) => m.is_required)}
                              onChange={() =>
                                dispatch(
                                  metrics["None"].every((m) => m.is_required)
                                    ? resetRequiredAll({ category, subcategory: "None" })
                                    : setRequiredAll({ category, subcategory: "None" })
                                )
                              }
                            />
                            <StyledLabel htmlFor={`required_all_${category}_none`}>
                              Make all required
                            </StyledLabel>
                          </div>
                        )}
                      </div>
                      {metrics["None"].map((metric) => (
                        <BehavioralMetricInput
                          key={metric.metric_name}
                          category={category}
                          metricName={metric.metric_name}
                          description={metric.description}
                          type={metric.variable_type}
                          metricType='imaging'
                          highlightedMetric={highlightedMetric}
                        />
                      ))}
                    </div>
                  )}
    
                  {/* List of subcategories */}
                    {Object.keys(metrics)
                      .filter((sub) => sub !== "None")
                      .map((subcategory) => {
                        const subMetrics = metrics[subcategory];
                        const isSubOpen = openSubcategories[`${category}_${subcategory}`] || false;
                        const allSelected = subMetrics.every((m) => m.is_selected);
                        const allRequired = subMetrics.every((m) => m.is_required);
                          return (
                            <div key={subcategory} className="ml-3 mt-3">
                              <div
                                className="d-flex align-items-center"
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleSubcategory(subcategory)}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    isSubOpen ? faCircleChevronDown : faCircleChevronRight
                                  }
                                  className="mr-2"
                                />
                                <h6 className="mb-0">{subcategory}</h6>
                              </div>
                              {isSubOpen && (
                                <>
                                  <div className="d-flex mt-2 mb-2 ml-2">
                                    <div className="mr-3">
                                      <StyleCheckbox
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`select_all_${category}_${subcategory}`}
                                        checked={allSelected}
                                        onChange={() => handleSelectAll(subcategory)}
                                      />
                                      <StyledLabel
                                        htmlFor={`select_all_${category}_${subcategory}`}
                                      >
                                        Select All
                                      </StyledLabel>
                                    </div>
    
                                    {allSelected && (
                                      <div>
                                        <StyleCheckbox
                                          type="checkbox"
                                          className="form-check-input"
                                          id={`required_all_${category}_${subcategory}`}
                                          checked={allRequired}
                                          onChange={() =>
                                            handleRequiredAll(subcategory)
                                          }
                                        />
                                        <StyledLabel
                                          htmlFor={`required_all_${category}_${subcategory}`}
                                        >
                                          Make all required
                                        </StyledLabel>
                                      </div>
                                    )}
                                  </div>
                                  <div className="metrics-list row ml-2">
                                    {subMetrics.map((metric) => (
                                      <BehavioralMetricInput
                                        key={metric.metric_name}
                                        category={category}
                                        subcategory={subcategory}
                                        metricName={metric.metric_name}
                                        description={metric.description}
                                        type={metric.variable_type}
                                        metricType='imaging'
                                        highlightedMetric={highlightedMetric}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                )}
          </Card.Body>
        </StyledCard>
  );
};

export default ImagingMetricCategory;
