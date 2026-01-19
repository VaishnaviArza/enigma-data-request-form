import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { auth } from "../firebaseConfig";
import LoginModal from "./LoginModal";
import { logout } from "../services/authService";

const HomePage = () => {
  const navigate = useNavigate();
  const [userAuth, setUserAuth] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
  setIsAuthenticated(!!auth.currentUser);
  
  const authData = localStorage.getItem("userAuth");
  if (authData) {
    setUserAuth(JSON.parse(authData));
  }
}, []);

  const canAccessCollaborators = userAuth?.can_access_collaborators_console || false;
  const isInactive = userAuth?.is_collaborator && !userAuth?.is_active;

  return (
    <div className="container text-center mt-5 mb-5">
      <h1 className="display-4">
        Welcome to Neural Plasticity and Neurorehabilitation Laboratory!
      </h1>
      <p className="lead mt-3">
        Unlocking the brain's potential with innovation in neurotech — because
        better brains mean better lives!
      </p>
      <div
        style={{
          display: "inline-block",
          backgroundColor: "#ffffff",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/brain-yoga.svg`}
          width="500"
          height="500"
          className="d-inline-block align-top"
          alt="Brain Icon"
        />

        {!isAuthenticated ? (
          <div className="mt-4 mb-3">
            {/*<h3 className="mb-3">Welcome to NPNL ENIGMA Portal</h3>*/}
            <p className="text-muted mb-4">
              Please login to access the Data Request Form and Collaborators Console
            </p>
            <button
              className="btn btn-primary btn-lg px-5 py-3"
              onClick={() => setShowLoginModal(true)}
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              }}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login to Get Started
            </button>
          </div>
        ) : (
          /* Show navigation buttons if authenticated */
          <>
            <div className="row justify-content-center mt-3">
              <div
                className="col-5 btn btn-outline-dark d-flex align-items-center justify-content-center text-center border-6"
                onClick={() => navigate("/request-form")}
                style={{ cursor: "pointer", minHeight: "80px" }}
              >
                <p className="my-1">
                  ENIGMA Stroke Recovery Group Data Request Form
                </p>
              </div>
              <div className="col-1"></div>
              <div
                className={`col-5 btn d-flex align-items-center justify-content-center text-center border-6 ${
                  canAccessCollaborators 
                    ? "btn-outline-dark" 
                    : "btn-outline-secondary"
                }`}
                onClick={() => {
                  if (canAccessCollaborators) {
                    navigate("/collaborators-directory");
                  }
                }}
                style={{ 
                  cursor: canAccessCollaborators ? "pointer" : "not-allowed",
                  minHeight: "80px",
                  opacity: canAccessCollaborators ? 1 : 0.6
                }}
                title={
                  !canAccessCollaborators && isInactive
                    ? "Your account is inactive. Contact NPNL to reactivate."
                    : !canAccessCollaborators
                    ? "You don't have access to the Collaborators Console"
                    : "Access Collaborators Console"
                }
              >
                <p className="m-0">Collaborators Console</p>
              </div>
            </div>

            {/* Show message for inactive users */}
            {isInactive && (
              <Alert variant="warning" className="mt-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Note:</strong> Your collaborator account is currently inactive. 
                You can access the Data Request Form, but not the Collaborators Console. 
                To reactivate your account, please contact NPNL at{" "}
                <a href="mailto:npnlusc@gmail.com">npnlusc@gmail.com</a>.
              </Alert>
            )}
          </>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        show={showLoginModal} 
        onHide={() => setShowLoginModal(false)} 
      />
    </div>
  );
};

export default HomePage;