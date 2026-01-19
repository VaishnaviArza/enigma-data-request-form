import React, { useState, useEffect } from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useDispatch, useSelector } from "react-redux";
import ApiUtils from "../api/ApiUtils";
import { showModal, hideModal } from "../redux/modalSlice";
import { RootState } from "../redux/store";
import { DataRequestOut, MetricOut, User } from "../types/DataRequest";
import { Metric, Timepoint } from "../types/MetricsData";

interface UserDataInputsProps {
  orGroups: {
    metricName: string;
    displayName: string;
    type: string;
    category: string;
    subcategory?: string;
  }[][];
  uploadedNotes?: string;
  uploadedProposalStatus?: string;
}

const UserDataInputs: React.FC<UserDataInputsProps> = ({
  orGroups, uploadedNotes="", uploadedProposalStatus=""}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [notes, setNotes] = useState(uploadedNotes || "");
  const metricsData = useSelector((state: RootState) => state.metrics);
  const dispatch = useDispatch();
  const [proposalStatus, setProposalStatus] = useState<string>(uploadedProposalStatus || "");
  useEffect(() => {
    if (uploadedNotes) {
      setNotes(uploadedNotes);
    }
  }, [uploadedNotes]);

  useEffect(() => {
    if (uploadedProposalStatus) {
      setProposalStatus(uploadedProposalStatus);
    }
  }, [uploadedProposalStatus]);

  const validateEmail = (email: string) => {
    return email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    checkFormValidity(e.target.value, email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    checkFormValidity(name, e.target.value);
  };

  const checkFormValidity = (name: string, email: string) => {
    const isValidName = name.trim() !== "";
    const isValidEmail = validateEmail(email);
    setIsSubmitEnabled(isValidName && !!isValidEmail);
  };

  const handleSubmit = async () => {
    if (isSubmitEnabled) {
      dispatch(
        showModal({
          title: "Processing",
          message: "Please wait...",
          modalType: "loading",
        })
      );
      // Insert your submit logic here

      let data: DataRequestOut = {
        requestor: { name: name, email: email },
        timepoint: metricsData.timepoint,
        behavior: { required: [], optional: [] },
        imaging: { required: [], optional: [] },
        or_groups: [],
        notes: "",
        proposal_status: proposalStatus,
      };

      data.notes = notes;
      const makeMetricEntry = (metric: Metric, category: string) => ({
        metric_name: metric.metric_name,
        display_name:
          metric.name && metric.name.toLowerCase() !== "none"
            ? metric.name
            : metric.metric_name,
        value1: metric.filter_value1 || null,
        value2: metric.filter_value2 || null,
        type: metric.variable_type,
        category,
      });
      const orMetricNames = new Set<string>();
      if (orGroups && orGroups.length > 0) {
        data.or_groups = orGroups.map((group, idx) => {
          const groupMetrics = group.map((m) => {
            orMetricNames.add(m.metricName);
            return {
              metric_name: m.metricName,
              display_name: m.displayName,
              type: m.type,
              category: m.category,
            };
          });
          return { group_id: idx + 1, metrics: groupMetrics };
        });
      }
      Object.entries(metricsData.behavioralMetrics).forEach(([category, subcats]) => {
        Object.values(subcats).forEach((metrics) => {
          metrics
            .filter((m: any) => m.is_selected)
            .forEach((metric: Metric) => {
              if (orMetricNames.has(metric.metric_name)) return; // skip if in OR
              const entry = makeMetricEntry(metric, category);
              if (metric.is_required) data.behavior.required.push(entry);
              else data.behavior.optional.push(entry);
            });
        });
      });
      Object.entries(metricsData.imagingMetrics).forEach(([category, subcats]) => {
        Object.values(subcats).forEach((metrics) => {
          metrics
            .filter((m: any) => m.is_selected)
            .forEach((metric: Metric) => {
              if (orMetricNames.has(metric.metric_name)) return; // skip if in OR
              const entry = makeMetricEntry(metric, category);
              if (metric.is_required) data.imaging.required.push(entry);
              else data.imaging.optional.push(entry);
            });
        });
      });
      if (
        data.behavior.required.length === 0 &&
        data.behavior.optional.length === 0 &&
        data.imaging.required.length === 0 &&
        data.imaging.optional.length === 0 &&
        (!data.or_groups || data.or_groups.length === 0)
      ) {
        dispatch(
          showModal({
            title: "Warning",
            message: "You haven't selected any data!",
            modalType: null,
          })
        );
      } else {
        try {
          const response = await ApiUtils.submitRequest(data);
          dispatch(
            showModal({
              title: "Success",
              message: "Your request has been successfully submitted!",
              modalType: "success",
            })
          );
        } catch (error) {
          dispatch(
            showModal({
              title: "Error",
              message: "Failed to submit the request. Please try again.",
              modalType: "error",
            })
          );
        }
        //   finally {
        //     setTimeout(() => {
        //       dispatch(hideModal());
        //     }, 3000); // Hide the modal after 3 seconds
        //   }
      }
    }
  };

  return (
    <>
      <div className="form-group mt-4">
        <label htmlFor="proposalStatus" className="font-weight-bold">
          Secondary Proposal Status
        </label>
        <select
          id="proposalStatus"
          className="form-control"
          value={proposalStatus}
          onChange={(e) => setProposalStatus(e.target.value)}
        >
          <option value="">Select status...</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Not Approved">Not Approved</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <label className="mb-1 mt-2">
        If you have any additional notes for us, please provide them in the box
        below
      </label>
      <Form.Control
        as="textarea"
        rows={4}
        placeholder="Notes"
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="mt-4 mb-5">
        <InputGroup className="mb-3">
          <InputGroup.Text>Name</InputGroup.Text>
          <FormControl
            placeholder="Enter name"
            aria-label="Enter name"
            value={name}
            onChange={handleNameChange}
          />
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text>Email</InputGroup.Text>
          <FormControl
            type="email"
            placeholder="Enter email"
            aria-label="Enter email"
            value={email}
            onChange={handleEmailChange}
          />
        </InputGroup>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
        >
          Submit Request
        </Button>
      </div>
    </>
  );
};

export default UserDataInputs;
