import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../hooks";
import {
  fetchFormSummary,
  setFilename,
  //fetchDataAndSummaryByFilename,
} from "../../redux/requestsSlice";
import { RootState } from "../../redux/store";
import { DataSummary } from "./DataSummaries";
import FormSummary from "./FormSummary";

const Summary: React.FC = ({}) => {
  const { fileName } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    formSummary,
    isFormSummaryLoading,
    dataSummary,
    isDataSummaryLoading,
  } = useSelector((state: RootState) => state.requests);

  const viewData = (fileName: string) => {
    navigate(`/view-data/${fileName}`);
  };

  useEffect(() => {
    (async () => {
      try {
        if (fileName) {
          dispatch(setFilename(fileName));
          dispatch(fetchFormSummary(fileName));
          //dispatch(fetchDataAndSummaryByFilename(fileName));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    })();
  }, [fileName]);

  return (
    <>
      {fileName && dataSummary?.data && (
        <div className="d-flex justify-content-end mt-3">
          <Button
            variant="primary"
            color="primary"
            onClick={() => viewData(fileName)}
            disabled={dataSummary.data ? false : true}
          >
            View Data
          </Button>
        </div>
      )}
      <FormSummary data={formSummary} isLoading={isFormSummaryLoading} />
      {/*<DataSummary data={dataSummary} isLoading={isDataSummaryLoading} />*/}
    </>
  );
};

export default Summary;
