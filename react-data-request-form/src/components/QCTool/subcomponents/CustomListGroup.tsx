import React from "react";
import {
  ListGroup,
  ListGroupItem,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import "./CustomListGroup.css";
import { DataFrame, List } from "../../../types/DataTypes";
import { useDispatch, useSelector } from "react-redux";
import { updateDataKey } from "../../../redux/qcSlice";
import { RootState } from "../../../redux/store"; // Adjust the import to match your store's path

const CustomListGroup = ({ items }: { items: List | DataFrame }) => {
  const dispatch = useDispatch();
  const qcData = useSelector((state: RootState) => state.qcData.data); // Access data from Redux
  const errors = useSelector((state: RootState) => state.qcData.errors);

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
    if (qcData) {
      if (cleanedValue in qcData) {
        return qcData[cleanedValue];
      }
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

  return (
    <div className="mb-4 custom-table-container">
      <ListGroup className="mt-3 custom-list-group">
        {items &&
          items.map((item, index) => (
            <ListGroupItem key={index} className="custom-list-item">
              {Object.entries(item).map(([key, val], idx) => (
                <div
                  key={idx}
                  className="d-flex align-items-center justify-space-between mb-2"
                >
                  <div className="d-flex flex-column">
                    {key != null &&
                      typeof key === "string" &&
                      (key as string)
                        ?.split("\n")
                        .map((line: string, index: number) => (
                          <strong key={index}>
                            {line}
                            <br />
                          </strong>
                        ))}
                  </div>
                  <div className="d-flex align-items-center">
                    {typeof val === "string" &&
                    val.includes("<<") &&
                    val.includes(">>") ? (
                      <>
                        <input
                          type="text"
                          value={extractValue(val) ?? ""}
                          onChange={(e) =>
                            handleChange(`${getKey(val)}`, e.target.value)
                          }
                          className={`form-control ${
                            isError(val) ? "border border-warning" : ""
                          }`}
                        />
                        {isError(val) && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${idx}`}>
                                {getErrorMessage(val)}
                              </Tooltip>
                            }
                          >
                            <span
                              className="ml-2 text-warning"
                              role="img"
                              aria-label="warning"
                            >
                              ⚠️
                            </span>
                          </OverlayTrigger>
                        )}
                      </>
                    ) : (
                      <span className="custom-value">{val}</span>
                    )}
                  </div>
                </div>
              ))}
            </ListGroupItem>
          ))}
      </ListGroup>
    </div>
  );
};

export default CustomListGroup;
