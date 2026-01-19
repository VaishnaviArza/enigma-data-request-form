import React, { useMemo } from "react";
import DataTable, { TableStyles, TableColumn } from "react-data-table-component";
import { Button, Form } from "react-bootstrap";
import * as Papa from "papaparse";
import { DataFrame, Row } from "../../types/DataTypes";
import { getCurrentUserToken } from "../../services/authService";
import ApiUtils from "../../api/ApiUtils";

interface DataTableProps {
  dataFrame: DataFrame;
  title?: string;
  showControls?: boolean;
  paginate?: boolean;
  selectable?: boolean;
  onSelect?: (row: Row) => void;
  onRowClick?: (row: Row) => void;
  columnNames?: string[];
  columnHeaders?: { [key: string]: string };
  isAdmin?: boolean;
  onToggleActive?: (collaborator: any) => void;  // ⭐ ADD THIS
  currentUserEmail?: string;  // ⭐ ADD THIS
}

const customStyles: TableStyles = {
  rows: {
    style: {
      minHeight: "45px",
      cursor: "pointer",
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  headCells: {
    style: {
      paddingLeft: "8px",
      paddingRight: "8px",
      fontSize: "16px",
      whiteSpace: "normal",
      overflow: "visible",
      textOverflow: "clip",
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
  columnNames,
  onRowClick,
  isAdmin = false,
  columnHeaders,
  onToggleActive,  // ⭐ ADD THIS
  currentUserEmail,  // ⭐ ADD THIS
}) => {
  const columns = useMemo(() => {
    const keys = columnNames || Object.keys(dataFrame[0] || {});
    // ⭐ Build the base columns
    const baseColumns: TableColumn<any>[] = keys.map((key) => ({
      name: columnHeaders?.[key] || key,
      selector: (row: { [x: string]: any }) => row[key],
      sortable: true,
    }));
    // ⭐ If admin and onToggleActive exists, add Active column at the beginning
    if (isAdmin && onToggleActive) {
      const activeColumn: TableColumn<any> = {
        name: "Active",
        width: "100px",
        cell: (row: any) => {
          const isActive = row.is_active === "true";
          const isSelf = row.email === currentUserEmail;
          const isDisabled = isSelf && isActive;

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Form.Check
                type="switch"
                checked={isActive}
                onChange={() => onToggleActive(row)}
                disabled={isDisabled}
                label=""
                title={
                  isDisabled
                    ? "You cannot deactivate yourself"
                    : isActive
                    ? "Click to deactivate"
                    : "Click to activate"
                }
              />
            </div>
          );
        },
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      };

      return [activeColumn, ...baseColumns];
    }

    return baseColumns;
  }, [dataFrame, columnNames, columnHeaders, isAdmin, onToggleActive, currentUserEmail]);

  if (!dataFrame || dataFrame.length === 0) {
    return <div>No data available.</div>;
  }

  /*
  const handleDownload = () => {
    const csv = Papa.unparse(dataFrame);
    const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(csvBlob);
    link.download = "data.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };*/
  const handleDownload = async () => {
    try {
      const token = await getCurrentUserToken();
      const blob = await ApiUtils.downloadCollaboratorsCSV(token);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `collaborators_${new Date().toISOString().split('T')[0]}.csv`; // filename with date
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Failed to download CSV. Please try again.");
    }
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
          paginationPerPage={20}
          persistTableHead
          highlightOnHover
          pointerOnHover
          onRowClicked={onRowClick}
        />
      </div>
      {showControls && isAdmin && (
        <Button variant="primary" onClick={handleDownload} className="mb-2">
          Download CSV
        </Button>
      )}
    </div>
  );
};

export default CustomDataTable;
