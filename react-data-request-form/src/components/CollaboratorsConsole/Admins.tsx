import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Form } from "react-bootstrap";
import { getCurrentUser, getCurrentUserToken } from "../../services/authService";
import { auth } from "../../firebaseConfig";
import ApiUtils from "../../api/ApiUtils";
import { Container, Spinner } from "react-bootstrap";

const Admins: React.FC = () => {
  const [admins, setAdmins] = useState<string[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const navigate = useNavigate();

  const fetchAdmins = async () => {
    setIsDataLoading(true);
    const token = await getCurrentUserToken();
    try {
      const response = await ApiUtils.fetchCollabAdmin(token);
      console.log(response);
      setAdmins(response.admins);
      setIsDataLoading(false);
    } catch (error) {
      setIsDataLoading(false);
      console.error("Error fetching admins:", error);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchAdmins();
      console.log("fetching admins", auth.currentUser);
    }
  }, [auth.currentUser]);

  const handleAddClick = () => {
    setIsAddingAdmin(true);
  };

  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAdminEmail(e.target.value);
  };

  const handleNewAdminBlur = async () => {
    if (!newAdminEmail.trim()) {
      setIsAddingAdmin(false);
      return;
    }
  };
  const handleDeleteAdmin = async (email: string) => {
    if (!getCurrentUser()) {
      navigate("/login");
      return;
    }
    // Prevent deleting yourself
    if (email === getCurrentUser()?.email) {
      alert("You cannot delete yourself");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${email} as an admin?`)) {
      return;
    }
    const token = await getCurrentUserToken();

    try {
      const response = await ApiUtils.deleteCollabAdmin(token, email)
      setAdmins(admins.filter((adminEmail) => adminEmail !== email));
    } catch (err) {
      console.error("Error deleting admin:", err);
    }
  };
  const [adding, setAdding] = useState(false);
  const handleAddAdmin = async () => {
    const token = await getCurrentUserToken();
    const email = newAdminEmail.trim();
    if (!email || adding) return;
    try {
      setAdding(true);
      await ApiUtils.addCollabAdmin(token, email);
      await fetchAdmins();
      setNewAdminEmail("");
      setIsAddingAdmin(false);
    } catch(err){
      console.error("Error adding admin:", err);
    } finally {
      setAdding(false);
    }
  }

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
    <div className="mt-4 mb-4">
      <h2>Admins</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Email</th>
            <th style={{ width: "50px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((email) => (
            <tr key={email}>
              <td>{email}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteAdmin(email)}
                  disabled={email === getCurrentUser()?.email}
                >
                  <i className="bi bi-trash-fill"></i>
                </Button>
              </td>
            </tr>
          ))}
          {isAddingAdmin && (
            <tr>
              <td>
                <Form.Control
                  type="email"
                  value={newAdminEmail}
                  onChange={handleNewAdminChange}
                  onBlur={handleNewAdminBlur}
                  placeholder="Enter admin email"
                  autoFocus
                />
              </td>
              <td>
              <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleAddAdmin()}
                  disabled={adding}
                >
                  <i className="bi bi-check-square"></i>
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Button variant="primary" onClick={handleAddClick}>
        ➕ Add Admin
      </Button>
    </div>
  );
};

export default Admins;
