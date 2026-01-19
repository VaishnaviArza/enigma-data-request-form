import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { setSelected, setRequiredAndUpdateRowCount } from "../../redux/metricsSlice";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { updateRowCount, setOrGroups as setOrGroupsAction } from "../../redux/metricsSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useEffect } from "react";

interface MetricSummary {
  category: string;
  subcategory?: string;
  metricName: string;
  displayName: string;
  type: string;
  is_required?: boolean;
  inOrGroup?: boolean;
}

interface MetricsLogicSummaryProps {
  requiredMetrics: MetricSummary[];
  optionalMetrics: MetricSummary[];
  orGroups: MetricSummary[][];
  setRequiredMetrics: React.Dispatch<React.SetStateAction<MetricSummary[]>>;
  setOptionalMetrics: React.Dispatch<React.SetStateAction<MetricSummary[]>>;
  setOrGroups: React.Dispatch<React.SetStateAction<MetricSummary[][]>>;
}

const MetricsLogicSummary: React.FC<MetricsLogicSummaryProps> = ({
  requiredMetrics,
  optionalMetrics,
  orGroups,
  setRequiredMetrics,
  setOptionalMetrics,
  setOrGroups,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Normalize partial metrics safely
  const normalizeMetric = (m: Partial<MetricSummary>): MetricSummary => ({
    category: m.category ?? "",
    subcategory: m.subcategory,
    metricName: m.metricName ?? "",
    displayName: m.displayName ?? m.metricName ?? "",
    type: m.type ?? "behavioral",
    is_required: m.is_required ?? false,
    inOrGroup: m.inOrGroup ?? false,
  });

  /** ---------- REMOVE HANDLERS ---------- **/
  // Box 3: Optional → Unselect + Remove
  const handleRemoveFromOptional = (metric: MetricSummary) => {
    setOptionalMetrics((prev) =>
      prev.filter((m) => m.metricName !== metric.metricName)
    );

    // Untoggle in UI
    dispatch(setSelected({
      category: metric.category,
      metricName: metric.metricName,
      isSelected: false,
    }));
    dispatch(setRequiredAndUpdateRowCount({
      category: metric.category,
      metricName: metric.metricName,
      isRequired: false,
    }));
  };

  // Box 2: OR → Move back to Box 3
  const handleRemoveFromOrGroup = (metric: MetricSummary, groupIndex: number) => {
    const newGroups = orGroups
    .map((g, i) =>
      i === groupIndex ? g.filter((m) => m.metricName !== metric.metricName) : g
    )
    .filter((g) => g.length > 0);
    setOrGroups(newGroups);

    setOptionalMetrics((prev) =>
      prev.some((m) => m.metricName === metric.metricName)
        ? prev
        : [...prev, { ...metric, inOrGroup: false }]
    );
    dispatch(
      setOrGroupsAction(newGroups.map((g) => g.map((m) => m.metricName)))
    );
      dispatch(updateRowCount());
  };

  // Box 1: Required → Move back to Box 3 (toggle off required)
  const handleRemoveFromRequired = (metric: MetricSummary) => {
    setRequiredMetrics((prev) =>
      prev.filter((m) => m.metricName !== metric.metricName)
    );
    setOptionalMetrics((prev) =>
      prev.some((m) => m.metricName === metric.metricName)
        ? prev
        : [...prev, { ...metric, is_required: false }]
    );

    dispatch(setRequiredAndUpdateRowCount({
      category: metric.category,
      metricName: metric.metricName,
      isRequired: false,
    }));
  };

  const handleAddOrGroup = () => {
  // Avoid duplicates — only add if last group is not empty
  setOrGroups((prev) => {
    if (prev.length === 0 || prev[prev.length - 1].length > 0) {
      return [...prev, []];
    }
    return prev; // prevent empty group stacking
  });
};

const syncOrGroupsToRedux = (groups: MetricSummary[][]) => {
  dispatch(setOrGroupsAction(groups.map(g => g.map(m => m.metricName))));
  dispatch(updateRowCount());
};

  /** ---------- DRAG LOGIC ---------- **/
  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceBox = source.droppableId;
    const destBox = destination.droppableId;
    if (sourceBox === destBox && source.index === destination.index) return;

    let dragged: MetricSummary | undefined;
    if (sourceBox === "required") {
      dragged = requiredMetrics[source.index];
      setRequiredMetrics((p) => p.filter((_, i) => i !== source.index));
    } else if (sourceBox === "optional") {
      dragged = optionalMetrics[source.index];
      setOptionalMetrics((p) => p.filter((_, i) => i !== source.index));
    } else if (sourceBox.startsWith("or-")) {
      const idx = parseInt(sourceBox.split("-")[1]);
      dragged = orGroups[idx][source.index];
      const newGroups = orGroups
        .map((g, i) =>
          i === idx ? g.filter((_, j) => j !== source.index) : g
        )
        .filter((g) => g.length > 0);

      setOrGroups(newGroups);
      syncOrGroupsToRedux(newGroups);
      //dispatch(setOrGroupsAction(newGroups.map((g) => g.map((m) => m.metricName))));
      //dispatch(updateRowCount());
    }
    if (!dragged) return;
    if (destBox.startsWith("or-") && dragged.is_required) {
  dragged.is_required = false; // ensure visual + logic sync
}

    if (destBox === "required") {
      setOrGroups((prev) =>
        prev.map((g) => g.filter((m) => m.metricName !== dragged!.metricName)).filter((g) => g.length> 0));
      setRequiredMetrics((p) => {
        if (!p.some((m) => m.metricName === dragged!.metricName)) {
          return [...p, normalizeMetric({ ...dragged, is_required: true })];
        }
        return p;
        });
      dispatch(setRequiredAndUpdateRowCount({
        category: dragged.category,
        metricName: dragged.metricName,
        isRequired: true,
      }));
      dispatch(setSelected({
        category: dragged.category,
        metricName: dragged.metricName,
        isSelected: true,
}));
      dispatch(
        setOrGroupsAction(
          orGroups.map((g) => g.map((m) => m.metricName))
        )
      );
      dispatch(updateRowCount());
    } else if (destBox === "optional") {
      setOptionalMetrics((p) => {
        if (!p.some((m) => m.metricName === dragged!.metricName)) {
          return [...p, normalizeMetric({ ...dragged, is_required: false, inOrGroup: false })];
        }
        return p;
      });
      setRequiredMetrics((prev) =>
      prev.filter((m) => m.metricName !== dragged!.metricName)
      );
      const newGroups = orGroups
        .map((g) => g.filter((m) => m.metricName !== dragged!.metricName))
        .filter((g) => g.length > 0);
      setOrGroups(newGroups);
      syncOrGroupsToRedux(newGroups);
      dispatch(setRequiredAndUpdateRowCount({
        category: dragged.category,
        metricName: dragged.metricName,
        isRequired: false,
      }));
      dispatch(setSelected({
        category: dragged.category,
        metricName: dragged.metricName,
        isSelected: true,
}));

    } else if (destBox.startsWith("or-")) {
      const idx = parseInt(destBox.split("-")[1]);
      setRequiredMetrics((prev) =>
      prev.filter((m) => m.metricName !== dragged!.metricName)
    );
      setOrGroups((p) => {
        const newGroups = [...p];
        const exists = newGroups[idx].some((m) => m.metricName === dragged!.metricName);
        if (!exists){
          newGroups[idx] = [...newGroups[idx], normalizeMetric({ ...dragged, is_required: false, inOrGroup: true }),];
        }
        dispatch(
        setOrGroupsAction(newGroups.map((g) => g.map((m) => m.metricName)))
      );
      dispatch(updateRowCount());
        return newGroups;
      });
      dispatch(
      setRequiredAndUpdateRowCount({
        category: dragged.category,
        metricName: dragged.metricName,
        isRequired: false,
      })
    );
    dispatch(setSelected({
      category: dragged.category,
      metricName: dragged.metricName,
      isSelected: true,
}));
  } 
    };

  const totalMetrics = new Set([
    ...requiredMetrics.map((m) => m.metricName),
    ...optionalMetrics.map((m) => m.metricName),
    ...orGroups.flat().map((m) => m.metricName),
  ]).size;

  const viewMode = useSelector((state: RootState) => state.metrics.viewMode);
  useEffect(() => {
  if (viewMode === "basic") {
    setOrGroups([]); // clear local
    dispatch(setOrGroupsAction([])); // clear Redux
    dispatch(updateRowCount()); // refresh count (no OR logic)
  }
}, [viewMode]);

  return (
  <div className="metrics-logic-summary mt-4">
    <div style={{ lineHeight: "1.4" }}>
      <h5 className="mb-0 fw-semibold" style={{ display: "inline-block" }}>
        Selected Metrics <span className="text-muted">({totalMetrics} total)</span>
      </h5>
      <br />
      <span
        className="text-muted"
        style={{
          fontSize: "0.9rem",
          display: "inline-block",
          marginTop: "0.1rem",
        }}
      >
        The summary boxes below are prefilled with your selected metrics. Feel free
        to drag and drop metrics between the boxes to fine-tune your request.
      </span>
    </div>
    <DragDropContext onDragEnd={onDragEnd}>
      {/* ---------- Box 1 – REQUIRED ---------- */}
      <section className="metrics-section">
        <Droppable droppableId="required" direction="horizontal">
          {(provided) => (
            <div
              className="metrics-box required-box"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className="metrics-header">
                <h6 className="mb-1">Each subject MUST have ALL of the following metrics.</h6>
                {requiredMetrics.length > 0 && (
                  <div className="text-end mt-2">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      requiredMetrics.forEach((m) => {
                        dispatch(setRequiredAndUpdateRowCount({
                          category: m.category,
                          metricName: m.metricName,
                          isRequired: false,
                        }));
                        dispatch(setSelected({
                          category: m.category,
                          metricName: m.metricName,
                          isSelected: true,
                        }));
                      });
                      setRequiredMetrics([]);
                    }}
                  >
                    Clear All
                  </button>
                  </div>
                )}
              </div>
              <div className="chips-container">
                {requiredMetrics.map((m, i) => (
                  <Draggable key={m.metricName} draggableId={`req-${m.metricName}`} index={i}>
                    {(p) => (
                      <div
                        className="metric-chip required"
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                      >
                        {m.displayName}
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveFromRequired(m)}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </section>

      {/* ---------- Box 2 – OR GROUPS ---------- */}
      <section className="metrics-section">
        {viewMode === "advanced" && (
        <div className="metrics-box or-container">
          <div className="metrics-header">
            <h6>Each subject MUST have AT LEAST ONE of the following metrics. Create additional groups to define more acceptable sets.</h6>
          </div>

          {orGroups.map((group, i) => (
            <Droppable key={i} droppableId={`or-${i}`} direction="horizontal">
              {(provided) => (
                <div
                  className="or-box mb-3"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>Group {i + 1}</strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {group.length > 0 && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          style=
                            {{
                              paddingLeft: "12px",
                              paddingTop: "6px",
                              marginRight: "8px", 
                              marginTop: "-4px",
                            }}
                          onClick={() => {
                            // Remove all metrics from this OR group
                            const newGroups = orGroups.filter((_, idx) => idx !== i);
                            setOrGroups(newGroups);
                          
                            // Move metrics back to optional
                            group.forEach((m) => {
                              setOptionalMetrics((prev) =>
                                prev.some((opt) => opt.metricName === m.metricName)
                                  ? prev
                                  : [...prev, { ...m, inOrGroup: false }]
                              );
                            });
                          
                            dispatch(
                              setOrGroupsAction(newGroups.map((g) => g.map((m) => m.metricName)))
                            );
                            dispatch(updateRowCount());
                          }}
                        >
                          Clear Group
                        </button>
                      )}
                      {group.length === 0 && (
                        <button
                          onClick={() => {
                            // Remove this empty OR group
                            const newGroups = orGroups.filter((_, idx) => idx !== i);
                            setOrGroups(newGroups);
                            dispatch(
                              setOrGroupsAction(newGroups.map((g) => g.map((m) => m.metricName)))
                            );
                          }}
                          style={{ 
                            border: 'none',
                            width: '30px', 
                            height: '30px', 
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            lineHeight: '1'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="chips-container" style={{ minHeight: '40px', paddingBottom: '8px' }}>
                    {group.map((m, j) => (
                      <Draggable
                        key={m.metricName}
                        draggableId={`or-${i}-${m.metricName}`}
                        index={j}
                      >
                        {(p) => (
                          <div
                            className="metric-chip or-chip"
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                          >
                            {m.displayName}
                            <button
                              className="remove-btn"
                              onClick={() => handleRemoveFromOrGroup(m, i)}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}

          <div className="text-end mt-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleAddOrGroup}
            >
              + Add Grouping
            </button>
          </div>
        </div>
        )}
      </section>

      {/* ---------- Box 3 – OPTIONAL ---------- */}
      <section className="metrics-section">
        <Droppable droppableId="optional" direction="horizontal">
          {(provided) => (
            <div
              className="metrics-box optional-box"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className="metrics-header">
                <h6>Include these metrics in the final spreadsheet if available:</h6>
                {optionalMetrics.length > 0 && (
                  <div className="text-end mt-2">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      // Remove all optional metrics
                      optionalMetrics.forEach((m) => {
                        dispatch(setSelected({
                          category: m.category,
                          metricName: m.metricName,
                          isSelected: false,
                        }));
                        dispatch(setRequiredAndUpdateRowCount({
                          category: m.category,
                          metricName: m.metricName,
                          isRequired: false,
                        }));
                      });
                      setOptionalMetrics([]);
                    }}
                  >
                    Clear All
                  </button>
                  </div>
                )}
              </div>
              <div className="chips-container">
                {optionalMetrics.map((m, i) => (
                  <Draggable key={m.metricName} draggableId={`opt-${m.metricName}`} index={i}>
                    {(p) => (
                      <div
                        className="metric-chip optional"
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                      >
                        {m.displayName}
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveFromOptional(m)}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </section>
    </DragDropContext>
  </div>
);
};

export default MetricsLogicSummary;
