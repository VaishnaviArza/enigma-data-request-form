import { CustomDataTable } from "../RequestSummary/DataTable";

import { Alert, Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setData, setBidsId, setSesId, setErrors } from "../../redux/qcSlice";
import ApiUtils from "../../api/ApiUtils";
import CustomTable from "./subcomponents/CustomTable";
import CustomListGroup from "./subcomponents/CustomListGroup";
import { useParams } from "react-router-dom";
import { showModal, hideModal } from "../../redux/modalSlice";
import {
  DataFrame,
  List,
  OrderingList,
  QCDataResponse,
} from "../../types/DataTypes";
import { RootState } from "../../redux/store";

const QCDataDisplay: React.FC = () => {
  const [data, setDataState] = useState<QCDataResponse | null>(null);
  const { bidsId, sesId } = useParams();
  const dispatch = useDispatch();
  const qcData = useSelector((state: RootState) => state.qcData); // Access data from Redux
  useEffect(() => {
    // Fetching data from the API
    const fetchData = async () => {
      try {
        if (bidsId && sesId) {
          const response = await ApiUtils.fetchPDFData(bidsId, sesId);
          setDataState(response);
          dispatch(hideModal());

          // Set bidsId, sesId, and data in Redux
          dispatch(setBidsId(bidsId));
          dispatch(setSesId(sesId));
          dispatch(setData(response.data));
          dispatch(setErrors(response.errors));
        }
      } catch (error) {
        dispatch(
          showModal({
            title: "Error",
            message: "Failed to submit the request. Please try again.",
            modalType: "error",
          })
        );
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [bidsId, sesId]);

  // Helper to render table content
  const render = (
    value: DataFrame | List | null,
    type: "table" | "list",
    ordering: OrderingList | null
  ) => {
    if (value === null) {
      return <></>;
    }

    if (type === "table") {
      if (Array.isArray(value)) {
        // Handle DataFrame
        return <CustomTable dataFrame={value} ordering={ordering} />;
      } else {
        console.error(
          "Expected DataFrame for table, but received incompatible type."
        );
        return <p>Error: Data type mismatch for table.</p>;
      }
    } else if (type === "list") {
      if (Array.isArray(value)) {
        // Handle List
        return <CustomListGroup items={value} />;
      } else {
        console.error(
          "Expected List for list rendering, but received incompatible type."
        );
        return <p>Error: Data type mismatch for list.</p>;
      }
    }

    return <></>;
  };

  const handleUpdate = () => {
    dispatch(
      showModal({
        title: "Processing",
        message: "Please wait...",
        modalType: "loading",
      })
    );
    if (qcData.data)
      ApiUtils.updateQCData(qcData.bids_id, qcData.ses_id, qcData.data)
        .then((result) => {
          console.log(result.ok);
          dispatch(
            showModal({
              title: "Done!",
              message: "Updated successfully",
              modalType: "success",
            })
          );
        })
        .catch((ex) => {
          dispatch(
            showModal({
              title: "Error",
              message: "There was an error processing your request",
              modalType: "error",
            })
          );
        });
  };

  return (
    <Container>
      {data && data.blueprint.visit && (
        <div className="d-flex justify-content-center my-4">
          <h1>
            {bidsId}; Visit {data.blueprint.visit}
          </h1>
        </div>
      )}
      {data && data.errors && (
        <Alert variant="danger" className="mt-4">
          <h5>Validation Errors:</h5>
          <ul>
            {Object.keys(data.errors).map((val, idx) => (
              <li key={idx}>
                {val} - {data.errors[val]}
              </li>
            ))}
          </ul>
        </Alert>
      )}
      {data &&
        data.blueprint.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="m-8">
            <h2>{section.title}</h2>
            {section.subsections?.map((subsection, subsectionIndex) => (
              <>
                <div key={subsectionIndex}>
                  {subsection.title && <h3>{subsection.title}</h3>}
                  {subsection.description && (
                    <div className="description-box border bg-light">
                      <p>
                        {subsection.description
                          .split("\n")
                          .map((line, index) => (
                            <span key={index}>
                              {line}
                              <br />
                            </span>
                          ))}
                      </p>
                    </div>
                  )}
                  {render(
                    subsection.value,
                    subsection.type,
                    subsection.ordering
                  )}
                </div>
              </>
            ))}
          </div>
        ))}
      <Button
        variant="primary"
        onClick={handleUpdate}
        disabled={!qcData.dataChanged}
        className="mt-4 mb-2"
      >
        Submit Request
      </Button>
    </Container>
  );
};

export default QCDataDisplay;
