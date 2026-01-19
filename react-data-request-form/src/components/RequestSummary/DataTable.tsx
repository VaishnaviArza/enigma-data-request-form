import React, { useMemo } from "react";
import DataTable from "react-data-table-component";
import { TableStyles } from "react-data-table-component";
import { Button } from "react-bootstrap";
import * as Papa from "papaparse";
import { DataFrame, Row } from "../../types/DataTypes";

interface DataTableProps {
  dataFrame: DataFrame;
  title?: string;
  showControls?: boolean;
  paginate?: boolean;
  selectable?: boolean;
  onSelect?: (selected: {
    allSelected: boolean;
    selectedCount: number;
    selectedRows: Row[];
  }) => void;
}

const customStyles: TableStyles = {
  rows: {
    style: {
      minHeight: "45px", // ensure this matches the type (e.g., string)
    },
  },
  headCells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
      fontSize: "16px", // make sure these are string values
      whiteSpace: "normal !important" as "normal", // assert specific allowed value
      overflow: "visible !important" as "visible", // assert specific allowed value
      textOverflow: "clip !important" as "clip", // assert specific allowed value
    },
  },
  cells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
      fontSize: "14px",
    },
  },
};

export const CustomDataTable: React.FC<DataTableProps> = ({
  dataFrame,
  title,
  showControls = false,
  paginate = false,
  selectable = false,
  onSelect,
}) => {
  const columns = useMemo(
    () =>
      Object.keys(dataFrame[0] || {}).map((key) => ({
        name: key,
        selector: (row: { [x: string]: any }) => row[key],
        sortable: true,
      })),
    [dataFrame]
  );

  if (!dataFrame || dataFrame.length === 0) {
    return <div>No data available.</div>;
  }

  const handleDownload = () => {
    const csv = Papa.unparse(dataFrame);
    const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(csvBlob);
    link.download = "data.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div>
      <div className="d-flex justify-content-between">
        {title && <h3>{title}</h3>}

        {showControls && (
          <Button variant="primary" onClick={handleDownload} className="mb-2">
            Download CSV
          </Button>
        )}
      </div>
      <div className="table-responsive">
        {paginate ? (
          <DataTable
            columns={columns}
            data={dataFrame}
            customStyles={customStyles}
            pagination
            persistTableHead
            highlightOnHover
            selectableRows={selectable}
            onSelectedRowsChange={onSelect}
          />
        ) : (
          <DataTable
            columns={columns}
            data={dataFrame}
            customStyles={customStyles}
            persistTableHead
            highlightOnHover
            selectableRows={selectable}
            onSelectedRowsChange={onSelect}
          />
        )}
      </div>
    </div>
  );
};

export default CustomDataTable;
