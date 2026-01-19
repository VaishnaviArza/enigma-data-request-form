import React, { useEffect, useState, useMemo } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import CustomDataTable from "./CustomDataTable";
import { getCurrentUserToken } from "../../services/authService";
import { DataFrame, Row } from "../../types/DataTypes";
import { CollaboratorDetails } from "./CollaboratorDetails";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import ApiUtils from "../../api/ApiUtils";
import { Container, Spinner } from "react-bootstrap";
import SearchBar from "./SearchBar";

const Collaborators: React.FC = () => {
  const [data, setData] = useState<DataFrame>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [selectedData, setSelectedData] = useState<{
    [key: string]: any;
  } | null>(null);
  const [action, setAction] = useState<"add" | "update" | null>(null);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  // ⭐ ADD THESE STATE VARIABLES
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{
    index: string;
    currentStatus: boolean;
    name: string;
    email: string;
  } | null>(null);
  const currentUserEmail = auth.currentUser?.email || undefined;
  const filteredData = useMemo(() => {
    if (roleFilter === "all") return data;
    if (roleFilter === "pi") {
      const filtered = data.filter((c: any) => {
        const isPI = c.role === "PI" || c.role === "Co-PI";
        return isPI;
    });
      return filtered;
    }
    return data;
  }, [data, roleFilter]);

  const fetchCollaborators = async () => {
    if (!auth.currentUser) {
      navigate("/collaborators-directory/login");
      return;
    }
    setIsDataLoading(true);
    const token = await getCurrentUserToken();
    try {
      const response = await ApiUtils.fetchCollaborators(token);
      const sortedResponse = response.sort((a: any, b: any) => {
        const indexA = parseInt(a.index) || 0;
        const indexB = parseInt(b.index) || 0;
        return indexB - indexA; // Descending order
      });
      setIsDataLoading(false);
      setData(sortedResponse);
    } catch (error) {
      setIsDataLoading(false)
      console.error("Error fetching collaborators:", error);
    }
  };

  useEffect(() => {
    setSelectedData(null);
    setAction(null);
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!auth.currentUser) return;

      const token = await getCurrentUserToken();
      try {
        const roleRes = await ApiUtils.getCurrentUserRole(token);
        setUserRole(roleRes.role);
        setIsAdmin(roleRes.is_admin);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      }
    };

    if (auth.currentUser) {
      fetchRole();
      fetchCollaborators();
    }
  }, [auth.currentUser]);



  const handleRowClick = async (row: any) => {
    const selectedIndex = row.index;
    const token = await getCurrentUserToken();
    if (!token) {
      console.error("No token found — user not authenticated");
      return;
    }
    const fullRecord = await ApiUtils.fetchCollaboratorByIndex(token, selectedIndex);
    setSelectedData(fullRecord);
    setAction("update");
  };

  const handleSearchSelect = async (index: string) => {
    const token = await getCurrentUserToken();
    if (!token) {
      console.error("No token found — user not authenticated");
      return;
    }
    try {
      const fullRecord = await ApiUtils.fetchCollaboratorByIndex(token, index);
      setSelectedData(fullRecord);
      setAction("update");
    } catch (error) {
      console.error("Error fetching collaborator by index:", error);
    }
  };

  const handleAddCollaborator = () => {
    setSelectedData({});
    setAction("add");
  };

  const handleUpdate = () => {
    fetchCollaborators();
    setSelectedData(null);
    setAction(null);
  };

  const handleBack = () => {
    setSelectedData(null);
    setAction(null);
  };
  // ⭐ ADD THESE NEW FUNCTIONS
  const handleToggleClick = (collaborator: any) => {
    const isCurrentlyActive = collaborator.is_active === "true";
    
    // Prevent self-deactivation
    if (collaborator.email === currentUserEmail && isCurrentlyActive) {
      alert("You cannot deactivate yourself");
      return;
    }

    setPendingToggle({
      index: collaborator.index,
      currentStatus: isCurrentlyActive,
      name: `${collaborator.first_name} ${collaborator.last_name}`,
      email: collaborator.email,
    });
    setShowConfirmModal(true);
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;

    try {
      const token = await getCurrentUserToken();
      const newStatus = !pendingToggle.currentStatus;

      // Use existing update endpoint
      await ApiUtils.updateCollabUserDetails(token, {
        index: pendingToggle.index,
        is_active: newStatus,
      });

      // Update local state
      setData((prev) =>
        prev.map((collab: any) =>
          collab.index === pendingToggle.index
            ? { ...collab, is_active: newStatus ? "true" : "false" }
            : collab
        )
      );

      setShowConfirmModal(false);
      setPendingToggle(null);
    } catch (error: any) {
      console.error("Error toggling status:", error);
      alert(error.message || "Failed to update status");
    }
  };

  if (isDataLoading) {
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

  return (
    <div className="mt-4">
      {selectedData && action ? (
        <>
          <Button variant="link" onClick={handleBack} className="mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-arrow-left-circle-fill"
              viewBox="0 0 16 16"
            >
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
            </svg>
            {"  "}
            Back
          </Button>
          <CollaboratorDetails
            handleSubmit={handleUpdate}
            dataFrame={selectedData}
            action={action}
            canDelete={true}
          />
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between mb-3">
            <h2>Collaborators</h2>
            <div className="d-flex gap-2 align-items-center">
            {/* ✅ Add filter dropdown (only for admins) */}
            {isAdmin && (
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="all">All Roles</option>
                <option value="pi">PIs & Co-PIs Only</option>
              </Form.Select>
            )}
            {(isAdmin || userRole === "PI" || userRole === "Co-PI") && (
              <Button variant="primary" onClick={handleAddCollaborator}>
                Add Collaborator
              </Button>
            )}
          </div>
        </div>
          {/* ✅ Add SearchBar here (only for admins) */}
          {isAdmin && data && data.length > 0 && (
            <SearchBar
              collaborators={data}
              onSelectCollaborator={handleSearchSelect}
            />
          )}

          {filteredData && filteredData.length > 0 ? (  
            <CustomDataTable
              dataFrame={filteredData}
              showControls={true}
              paginate={true}
              selectable={false}
              columnNames={[
                "first_name",
                "last_name",
                "email",
                "University/Institute",
              ]}
              columnHeaders={{
                first_name: "First Name",
                last_name: "Last Name",
                email: "Email",
                "University/Institute": "University/Institute",
              }}
            onRowClick={handleRowClick}
            isAdmin={isAdmin}
            onToggleActive={isAdmin ? handleToggleClick : undefined}  // ⭐ ADD THIS
            currentUserEmail={currentUserEmail}  // ⭐ ADD THIS
          />
          ) : (
            <div className="alert alert-info">
              No collaborators found. {isAdmin && "Click 'Add Collaborator' to get started."}
            </div>
          )}
        </>
      )}
      {/* ⭐ ADD THIS CONFIRMATION MODAL */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Status Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pendingToggle && (
            <>
              <p>
                Are you sure you want to{" "}
                {pendingToggle.currentStatus ? "deactivate" : "activate"}
                {" "}
                {pendingToggle.name}?
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant={pendingToggle?.currentStatus ? "danger" : "success"}
            onClick={confirmToggle}
          >
            {pendingToggle?.currentStatus ? "Deactivate" : "Activate"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Collaborators;
