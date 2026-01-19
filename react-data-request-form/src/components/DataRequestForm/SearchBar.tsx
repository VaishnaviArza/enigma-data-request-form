import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {Metric} from '../../types/MetricsData';
import {scroller} from 'react-scroll';

interface SearchBarProps {
  allMetrics: { [category: string]: { [subcategory: string]: Metric[] } };
  onSearchSelect: (
    category: string,
    subcategory: string | null,
    metric: string
  ) => void;
}



const SearchBar: React.FC<SearchBarProps> = ({allMetrics, onSearchSelect}) => {
  const [query, setQuery] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewMode = useSelector((state: RootState) => state.metrics.viewMode);
  const spaceMode = useSelector((state: RootState) => state.metrics.spaceMode);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSuggestionsVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Flatten metrics for searching
  const allMetricEntries = Object.entries(allMetrics).flatMap(
    ([category, subcategories]) =>
      Object.entries(subcategories).flatMap(([subcategory, metrics]) =>
        metrics.map((m) => ({
          category,
          subcategory: subcategory === "None" ? null : subcategory,
          metricName: m.metric_name,
          displayName: m.name && m.name.toLowerCase() !== "none" ? m.name : m.metric_name,
          space: m.space ?? null, 
          essential: m.essential ?? false
        }))
      )
  );

  // Filter metrics that match query
 const filteredMetrics = query.trim()
  ? (() => {
      const q = query.toLowerCase();

      const visibleMetrics = allMetricEntries.filter((m) => {
        const viewMatch = viewMode === "advanced" ? true : m.essential === true;
        const spaceMatch = 
          spaceMode === "mni" ? m.space === "mni" : m.space === "native" || m.space === null;
        return viewMatch && spaceMatch;
      });

      // Metrics that start with the query
      const startsWith = visibleMetrics.filter((m) =>
        m.displayName.toLowerCase().startsWith(q)
      );

      // Metrics that contain the query (but not starting)
      const contains = visibleMetrics.filter(
        (m) =>
          !m.displayName.toLowerCase().startsWith(q) &&
          m.displayName.toLowerCase().includes(q)
      );

      // Combine results — startsWith first
      return [...startsWith, ...contains];
    })()
  : [];
const highlightMatch = (text: string, query: string) => {
    const regex = new RegExp(`(${query})`, "ig");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} style={{ backgroundColor: "#ffe58f" }}>
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div ref={wrapperRef} className="search-bar mb-4 position-relative">
      <div className="position-relative">
        <input
          type="text"
          className="form-control"
          placeholder={`Search ${viewMode} ${spaceMode} metrics...`}
          value={query}
          onFocus={() => setSuggestionsVisible(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setSuggestionsVisible(true);
          }}
      />
      {/*Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestionsVisible(false);
            }}
            className="btn btn-sm position-absolute"
            style={{
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              padding: 0,
              fontSize: "1.2rem",
              color: "#888",
              cursor: "pointer",
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {suggestionsVisible && query && (
        <div className="list-group position-absolute w-100 mt-1 shadow-sm"
          style={{
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto",
            borderRadius: "8px",
          }}
        >
          {filteredMetrics.length > 0 ? (
            <>
              {filteredMetrics.slice(0,7).map(({ category, subcategory, metricName, displayName}) => (
              <button
                key={`${category}-${subcategory}-${metricName}`}
                className="list-group-item list-group-item-action"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  onSearchSelect(category, subcategory, metricName);
                  scroller.scrollTo(`metric-${metricName}`, {
                    duration: 600,
                    delay: 0,
                    smooth: "easeInOutQuart",
                    offset: -100,
                  });
                  setQuery("");
                  setSuggestionsVisible(false);
                }}
              >
                <strong>{highlightMatch(displayName,query)}</strong>
                <br />
                <small className="text-muted">
                  {category}
                  {subcategory ? ` → ${subcategory}` : ""}
                </small>
              </button>
            ))}
            {filteredMetrics.length > 7 && (
              <div className="list-group-item text-center text-muted small">
                Showing Top 7 results
              </div>
            )}
          </>
          ) : (
            <li className="list-group-item text-muted">No matches found</li>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
