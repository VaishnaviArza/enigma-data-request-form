// DataSummary.tsx
import React from "react";
import { Spinner, Container } from "react-bootstrap";
import { DataSummaries } from "../../types/DataTypes";
import { CustomDataTable } from "./DataTable";

interface DataSummaryProps {
  data: DataSummaries | undefined;
  isLoading: boolean;
}

export const DataSummary: React.FC<DataSummaryProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
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

  if (!data) {
    return <Container className="text-center">No data to display.</Container>;
  }

  return (
    <Container>
      <h2 className="mt-3 mb-3">Data Summary</h2>
      {/* <DataTable dataFrame={data.data} title="Data Summary" /> */}
      <div className="row">
        <div className="col d-flex justify-content-center">
          <CustomDataTable
            dataFrame={data.imagingDataBySite}
            title="Imaging Data by Site"
          />
        </div>
        <div className="col d-flex justify-content-center">
          <CustomDataTable
            dataFrame={data.columnsSummary}
            title="Columns Summary"
          />
        </div>
        <div className="col d-flex justify-content-center">
          <CustomDataTable
            dataFrame={data.recordsBySite}
            title="Records by Site"
          />
        </div>
      </div>
    </Container>
  );
};
