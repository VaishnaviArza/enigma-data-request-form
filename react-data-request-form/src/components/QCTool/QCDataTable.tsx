import { CustomDataTable } from "../RequestSummary/DataTable";

import React, { useEffect, useState } from "react";
import ApiUtils from "../../api/ApiUtils";
import { DataFrame, SelectedOptions } from "../../types/DataTypes";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showModal, hideModal } from "../../redux/modalSlice";
import CustomQCTable from "./subcomponents/CustomQCTable";

const QCDataDisplay: React.FC = () => {
  const [data, setData] = useState<DataFrame | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    // Fetching data from the API
    const fetchData = async () => {
      dispatch(
        showModal({
          title: "Processing",
          message: "Please wait...",
          modalType: "loading",
        })
      );
      try {
        const response = await ApiUtils.fetchQCSubjectsData();
        setData(response);
        dispatch(hideModal());
      } catch (error) {
        dispatch(
          showModal({
            title: "Error",
            message:
              "Error loading data. Please make sure the file system is mounted.",
            modalType: "error",
          })
        );
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (selected: SelectedOptions) => {
    if (selected.selectedCount > 0) {
      const bids_id = selected.selectedRows[0]["BIDS_ID"];
      const ses_id = selected.selectedRows[0]["SES"];
      dispatch(
        showModal({
          title: "Processing",
          message: "Please wait...",
          modalType: "loading",
        })
      );
      navigate(`/qc-tool/${bids_id}/${ses_id}`);
    }
  };

  return (
    <Container>
      {data && (
        <CustomQCTable dataFrame={data} onSelect={handleChange} selectable />
      )}
    </Container>
  );
};

export default QCDataDisplay;
