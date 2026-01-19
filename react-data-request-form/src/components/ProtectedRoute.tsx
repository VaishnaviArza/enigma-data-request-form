import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { Spinner, Container } from "react-bootstrap";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireCollaboratorAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireCollaboratorAccess = false 
}) => {
  const location = useLocation();
  const user = auth.currentUser;
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => setChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (checking) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user) {
    // Store intended path and redirect to login
    localStorage.setItem("intendedPath", location.pathname);
    return <Navigate to="/login" replace />;
  }

  if (requireCollaboratorAccess) {
    // Check if user can access collaborators console
    const userAuth = JSON.parse(localStorage.getItem("userAuth") || "{}");
    
    // Admins always have access, OR active collaborators
    if (!userAuth.can_access_collaborators_console) {
      // Redirect to data request form with a message
      return <Navigate to="/request-form" state={{ 
        message: "You don't have access to the Collaborators Console. Your account may be inactive." 
      }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;