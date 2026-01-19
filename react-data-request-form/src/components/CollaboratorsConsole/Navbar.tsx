import React, { useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

interface NavBarProps {
  isAdmin: boolean;
}

const NavigationBar: React.FC<NavBarProps> = ({ isAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/collaborators-directory/login");
  };

  useEffect(() => {
    if (!auth.currentUser) {
    }
  }, [navigate, auth.currentUser]);

  return (
    <Navbar
      className="navbar-dark bg-dark"
      bg="dark"
      expand="lg"
      style={{ paddingLeft: "30px", paddingRight: "30px" }}
    >
      <Navbar.Brand as={Link} to="/">
        NPNL Collaborators
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        {auth.currentUser ? (
          <>
            {isAdmin ? (
              <Nav className="mr-auto">
                <Nav.Link as={Link} to="/admins">
                  Admins
                </Nav.Link>
              </Nav>
            ) : (
              <></>
            )}
            <Nav className="ms-auto ml-2">
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </>
        ) : (
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/login">
              Login
            </Nav.Link>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
