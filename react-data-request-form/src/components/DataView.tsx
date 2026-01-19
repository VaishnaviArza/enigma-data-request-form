import React, { useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import {
  //fetchDataAndSummaryByFilename,
  fetchFormSummary,
  setFilename,
} from "../redux/requestsSlice";
import { RootState } from "../redux/store";
import { DataSummary } from "./RequestSummary/DataSummaries";
import DataTable from "./RequestSummary/DataTable";
import FormSummary from "./RequestSummary/FormSummary";

const DataView: React.FC = ({}) => {
  const { fileNameParam } = useParams();
  const dispatch = useAppDispatch();
  const { fileName, dataSummary, isDataSummaryLoading } = useSelector(
    (state: RootState) => state.requests
  );

  useEffect(() => {
    (async () => {
      try {
        console.log(fileName, fileNameParam);
        if (fileNameParam && fileName != fileNameParam) {
          dispatch(setFilename(fileNameParam));
          dispatch(fetchFormSummary(fileNameParam));
          //dispatch(fetchDataAndSummaryByFilename(fileNameParam));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    })();
  }, [fileNameParam]);

  if (isDataSummaryLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  console.log(dataSummary);
  return (
    <>
      {dataSummary?.data && (
        <div className="mx-3 my-3">
          <DataTable
            dataFrame={dataSummary?.data}
            title="Data"
            showControls
            paginate
          />
        </div>
      )}
    </>
  );
};

export default DataView;
