import React, { useEffect, useState } from "react";
import { completeSignIn, getCurrentUserToken, logout } from "../../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import ApiUtils from "../../api/ApiUtils";
import { Alert, Spinner, Container, Card } from "react-bootstrap";

const CompleteSignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("Completing sign-in...");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const signIn = async () => {
      try {
        console.log("Complete sign in");
        await completeSignIn();
        setMessage("Sign-in successful! Checking authorization");
        
        // Check user authorization
        const token = await getCurrentUserToken();
        
        try {
          const authResponse = await ApiUtils.checkUserAuthorization(token);
          if (!authResponse.authorized) {
            setError(authResponse.message || "You are not authorized to access this app.");
            setLoading(false);
            localStorage.removeItem("userAuth");
            localStorage.removeItem("intendedPath");
            await logout();
            return;
          }
          localStorage.setItem("userAuth", JSON.stringify({
            is_admin: authResponse.is_admin,
            is_collaborator: authResponse.is_collaborator,
            can_access_collaborators_console: authResponse.can_access_collaborators_console,
            can_access_data_request: authResponse.can_access_data_request,
            is_active: authResponse.is_active
          }));

          // Determine where to redirect
          localStorage.removeItem("intendedPath");
          setMessage("Redirecting...");
          setTimeout(() => navigate("/"), 1000);
          
          setLoading(false);
          
        } catch (authError: any) {
          console.error("Error checking authorization:", authError);
          const errorMessage = authError.message || "";
          setError(errorMessage || "Failed to verify authorization. Please try again.");
          setLoading(false);
          localStorage.removeItem("userAuth");
          localStorage.removeItem("intendedPath");
          await logout();
          return; // Stay on this page
        }
        
      } catch (error: any) {
        console.error("Error completing sign-in:", error);
        setError("Failed to complete sign-in. Please try again.");
        setLoading(false);
        localStorage.removeItem("userAuth");
        await logout();
      }
    };

    signIn();
  }, [navigate]);

  return (
    <Container className="mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {error ? (
            <div className="text-center" style={{ marginTop: "15vh" }}>
              <div style={{ 
                maxWidth: "500px", 
                margin: "0 auto",
                padding: "3rem",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}>
                <h2 className="mb-4" style={{ 
                  fontWeight: 600, 
                  color: "#2c3e50",
                  fontSize: "1.75rem"
                }}>Access Denied</h2>
                <p className="mb-4" style={{ 
                  color: "#666", 
                  fontSize: "1rem",
                  lineHeight: "1.6"
                }}>
                  You do not have permission to access the portal. Please contact your administrator.
                </p>
                <hr style={{ 
                  margin: "2rem 0",
                  borderTop: "1px solid #e0e0e0"
                }} />
                
                <p className="mb-3" style={{ 
                  color: "#888", 
                  fontSize: "0.9rem" 
                }}>
                  Need assistance? Reach out to us at{" "}
                  <a 
                    href="mailto:npnlusc@gmail.com"
                    style={{ color: "#667eea", textDecoration: "none" }}
                  >
                    npnlusc@gmail.com
                  </a>
                </p>
                
                <a 
                  href="/" 
                  className="btn btn-primary"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    padding: "0.6rem 2rem",
                    fontSize: "1rem",
                    fontWeight: 500
                  }}
                >
                  Return to Home
                </a>
              </div>
            </div>
          ) : (
            <Card>
              <Card.Body className="text-center">
                {loading && (
                  <Spinner 
                    animation="border" 
                    className="mb-3" 
                    variant="primary"
                  />
                )}
                <h4>{message}</h4>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
};

export default CompleteSignIn;