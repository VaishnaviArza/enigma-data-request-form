import React, { useState, useEffect } from "react";
import { Form, Tab, Tabs } from "react-bootstrap";
import {
  AuthorsOptions,
  DataFrame,
  Row,
  FormattedAuthorsRequest,
} from "../types/DataTypes";
import DataTable from "./RequestSummary/DataTable";
import ApiUtils from "../api/ApiUtils";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import { styled } from "styled-components";
import TextareaAutosize from "@mui/material/TextareaAutosize";

interface SelectedOptions {
  allSelected: boolean;
  selectedCount: number;
  selectedRows: Row[];
}

const AuthorsList = () => {
  const StyledTextarea = styled(TextareaAutosize)({
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    resize: "none", // Prevent the user from manually resizing the textarea
  });
  const [key, setKey] = useState("bySite");
  const [data, setData] = useState<AuthorsOptions>({
    dataByAuthor: [], // Assuming this should be an array
    dataBySite: [], // Assuming this should be an object
  });

  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);
  const [firstAuthors, setFirstAuthors] = useState<number[]>([]);
  const [lastAuthors, setLastAuthors] = useState<number[]>([]);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [nameFormatOption, setNameFormatOption] = useState(1);
  const [formattedResponse, setFormattedResponse] = useState("");

  const handleChange = (selected: SelectedOptions) => {
    if (selected.selectedCount > 0) {
      setIsSubmitEnabled(true);
    } else {
      setIsSubmitEnabled(false);
    }
    if (key === "bySite") {
      let value: string[] = [];
      selected.selectedRows.forEach((row) => {
        const site = row["BIDS Site"];
        if (typeof site === "string") value.push(site);
      });
      setSelectedSites(value);
    } else {
      let value: number[] = [];
      selected.selectedRows.forEach((row) => {
        const index = Number(row["index"]);
        if (typeof index === "number") value.push(index);
      });
      setSelectedAuthors(value);
    }
  };

  const handleSubmit = async () => {
    try {
      const request: FormattedAuthorsRequest = {
        groupBy: key,
        nameFormatOption: nameFormatOption,
        sites: null,
        authors: null,
        firstAuthors: null,
        lastAuthors: null,
      };

      if (key === "bySite") {
        request.sites = selectedSites;
      } else if (key === "byAuthor") {
        request.authors = selectedAuthors;
      }

      if (firstAuthors.length > 0) request.firstAuthors = firstAuthors;
      if (lastAuthors.length > 0) request.lastAuthors = lastAuthors;
      console.log(request);
      const response = await ApiUtils.fetchFormattedAuthors(request);
      console.log(response);
      if (response && response.formattedAuthors) {
        setFormattedResponse(response.formattedAuthors);
      } else {
        setFormattedResponse("No formatted authors data received.");
      }
    } catch (error) {
      console.error("Failed to fetch formatted authors:", error);
      setFormattedResponse("Failed to load data.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authorsData = await ApiUtils.fetchAuthorsData();
        console.log(authorsData);
        setData(authorsData);
      } catch (error) {
        console.error("Error fetching author data:", error);
        // Set default values on error
        setData({ dataByAuthor: [], dataBySite: [] });
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k ?? "bySite")}
        className="mb-3 mt-2"
      >
        <Tab eventKey="bySite" title="By Site">
          <DataTable
            dataFrame={data.dataBySite}
            selectable
            onSelect={handleChange}
          />
        </Tab>
        <Tab eventKey="byAuthor" title="By Author">
          <DataTable
            dataFrame={data.dataByAuthor}
            selectable
            onSelect={handleChange}
          />
          <div>
            <label className="mb-1 mt-2">
              Enter the indices (from the 'index' column) of authors to be
              placed first, separated by commas:
            </label>
            <Form.Control
              type="text"
              placeholder="Ex: 2,3,190"
              onChange={(e) =>
                setFirstAuthors(
                  e.target.value.split(",").flatMap((x) => Number(x.trim()))
                )
              }
            />
            <label className="mb-1 mt-2">
              Enter the indices (from the 'index' column) of authors to be
              placed last, separated by commas:
            </label>
            <Form.Control
              type="text"
              placeholder="Ex: 2,3,190"
              onChange={(e) =>
                setLastAuthors(
                  e.target.value.split(",").flatMap((x) => Number(x.trim()))
                )
              }
            />
          </div>
        </Tab>
      </Tabs>
      <Form className="mt-4">
        <label>Select formatting option</label>
        <Form.Check // prettier-ignore
          type="radio"
          id="initials-option"
          name="nameFormat"
          value="initials"
          label="Initials (Ex: S.-L.L.)"
          onChange={(e) => setNameFormatOption(1)}
          checked={nameFormatOption === 1}
        />

        <Form.Check
          type="radio"
          id="full-name-option"
          name="nameFormat"
          value="fullName"
          label="Full name (Ex: Sook-Lei Liew)"
          onChange={(e) => setNameFormatOption(2)}
          checked={nameFormatOption === 2}
        />

        <Form.Check
          type="radio"
          id="initials-lastname-option"
          name="nameFormat"
          value="initialsLastName"
          label="Initials + Last Name (Ex: S.-L. Liew)"
          onChange={(e) => setNameFormatOption(3)}
          checked={nameFormatOption === 3}
        />
      </Form>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!isSubmitEnabled}
        className="mt-4 mb-2"
      >
        Submit Request
      </Button>
      <div className="row ml-2 mr-2 mb-4 h-100">
        <StyledTextarea
          minRows={3}
          placeholder="Formatted Authors"
          value={formattedResponse ?? ""}
        />
      </div>
    </>
  );
};

export default AuthorsList;
