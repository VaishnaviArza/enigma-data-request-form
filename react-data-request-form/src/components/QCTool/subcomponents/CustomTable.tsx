import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap"; // Import Bootstrap components for tooltip
import "./CustomTable.css";
import { DataFrame, OrderingList } from "../../../types/DataTypes";
import { useDispatch, useSelector } from "react-redux";
import { updateDataKey } from "../../../redux/qcSlice";
import { RootState } from "../../../redux/store";

interface CustomTableProps {
  dataFrame: DataFrame;
  ordering: OrderingList | null;
}

const CustomTable: React.FC<CustomTableProps> = ({ dataFrame, ordering }) => {
  const dispatch = useDispatch();
  const qcData = useSelector((state: RootState) => state.qcData.data); // Access data from Redux
  const errors = useSelector((state: RootState) => state.qcData.errors); // Access errors from Redux

  // Get column names from the first row if exists
  const orderedColumnNames =
    dataFrame.length > 0 ? Object.keys(dataFrame[0]) : [];

  // Create a list of column names by iterating over the ordering keys
  const finalColumnNames = ordering
    ? Object.keys(ordering)
        .sort()
        .map((key) => String(ordering[Number(key)]))
    : orderedColumnNames;

  const handleChange = (key: string, value: string) => {
    // Dispatch the update to Redux
    dispatch(updateDataKey({ key, value }));
  };

  const getKey = (val: string) => {
    const cleanedValue = val.replace(/<<|>>/g, "");
    return cleanedValue;
  };

  const extractValue = (val: string) => {
    const cleanedValue = val.replace(/<<|>>/g, "");

    // Check if qcData is not null and find the matching value
    if (qcData && cleanedValue in qcData) {
      return qcData[cleanedValue];
    }
    return null;
  };

  const isError = (val: string) => {
    const cleanedValue = val.replace(/<<|>>/g, "");
    return errors && cleanedValue in errors;
  };

  const getErrorMessage = (val: string) => {
    const cleanedValue = val.replace(/<<|>>/g, "");
    return errors && cleanedValue in errors ? errors[cleanedValue] : "";
  };

  // Type guard to check if a value is a non-null string
  const isNonNullString = (value: any): value is string => {
    return value !== null && typeof value === "string";
  };

  return (
    <div className="custom-table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {finalColumnNames.map((colName, index) => (
              <th key={index}>{colName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataFrame.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {finalColumnNames.map((colName, colIndex) => {
                const cellValue = row[colName];

                return (
                  <td key={colIndex}>
                    {isNonNullString(cellValue) &&
                    cellValue.includes("<<") &&
                    cellValue.includes(">>") ? (
                      <div className="input-container">
                        <input
                          type="text"
                          value={extractValue(cellValue) ?? ""}
                          onChange={(e) =>
                            handleChange(getKey(cellValue), e.target.value)
                          }
                          className={`form-control ${
                            isError(cellValue) ? "border-warning" : ""
                          }`}
                        />
                        {isError(cellValue) && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${rowIndex}-${colIndex}`}>
                                {getErrorMessage(cellValue)}
                              </Tooltip>
                            }
                          >
                            <span
                              className="warning-icon"
                              role="img"
                              aria-label="warning"
                            >
                              ⚠️
                            </span>
                          </OverlayTrigger>
                        )}
                      </div>
                    ) : isNonNullString(cellValue) ? (
                      cellValue.split("\n").map((line, index) => (
                        <span key={index}>
                          {line}
                          <br />
                        </span>
                      ))
                    ) : cellValue !== null && typeof cellValue === "number" ? (
                      cellValue
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;
