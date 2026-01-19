import React, { useMemo } from "react";
import DataTable from "react-data-table-component";
import { TableStyles } from "react-data-table-component";
import { Button } from "react-bootstrap";
import * as Papa from "papaparse";
import { DataFrame, Row } from "../../../types/DataTypes";

// Import FontAwesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

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
      minHeight: "45px",
    },
  },
  headCells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
      fontSize: "16px",
      whiteSpace: "normal !important" as "normal",
      overflow: "visible !important" as "visible",
      textOverflow: "clip !important" as "clip",
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

export const CustomQCTable: React.FC<DataTableProps> = ({
  dataFrame,
  title,
  showControls = false,
  paginate = false,
  selectable = false,
  onSelect,
}) => {
  const columns = useMemo(() => {
    return Object.keys(dataFrame[0] || {}).map((key) => {
      if (key === "QC_REQUIRED") {
        return {
          name: key,
          selector: (row: { [x: string]: any }) => row[key],
          sortable: true,
          cell: (row: { [x: string]: any }) => {
            const qcRequired = row[key];
            const isQCRequired =
              qcRequired === true ||
              qcRequired === "True" ||
              qcRequired === "true" ||
              qcRequired === 1;
            return isQCRequired ? (
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                style={{ color: "orange", fontSize: "1.5em" }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{ color: "green", fontSize: "1.5em" }}
              />
            );
          },
        };
      } else {
        return {
          name: key,
          selector: (row: { [x: string]: any }) => row[key],
          sortable: true,
        };
      }
    });
  }, [dataFrame]);

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
      </div>
      <div className="table-responsive">
        <DataTable
          columns={columns}
          data={dataFrame}
          customStyles={customStyles}
          pagination={paginate}
          persistTableHead
          highlightOnHover
          selectableRows={selectable}
          onSelectedRowsChange={onSelect}
        />
      </div>
    </div>
  );
};

export default CustomQCTable;
