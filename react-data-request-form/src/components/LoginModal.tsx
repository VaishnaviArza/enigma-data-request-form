import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { sendSignInEmail } from "../services/authService";

interface LoginModalProps {
  show: boolean;
  onHide: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onHide }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear errors when user starts typing
    setEmailError(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendSignInEmail(email);
      setEmailSent(true);
    } catch (err: any) {
      console.error("Error sending sign-in email:", err);
      setError("Failed to send sign-in email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setEmail("");
    setEmailSent(false);
    setError(null);
    setEmailError(null);
    setLoading(false);
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered
      backdrop="static"
      className="login-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          {emailSent ? (
            <div className="d-flex align-items-center justify-content-center">
              <i className="bi bi-envelope-check text-success me-2" style={{ fontSize: "1.5rem" }}></i>
              Check Your Email
            </div>
          ) : (
            "Sign in to NPNL ENIGMA Portal"
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="px-4 py-4">
        {emailSent ? (
          <div className="text-center">
            <div className="mb-3">
              <div 
                className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle mb-3" 
                style={{ width: "80px", height: "80px" }}
              >
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
              </div>
            </div>
            <p className="mb-3">
              We've sent a sign-in link to:
            </p>
            <p className="fw-bold text-primary mb-3">{email}</p>
            <p className="text-muted small mb-4">
              Click the link in the email to complete sign-in. The link will expire in 1 hour.
            </p>
            <Button variant="primary" onClick={handleClose} className="px-4">
              Got it!
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <p className="text-muted text-center mb-4">
              Enter your email address and we'll send you a secure sign-in link.
            </p>
            
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                isInvalid={!!emailError}
                autoFocus
                className="py-2"
                style={{ fontSize: "1rem" }}
              />
              {emailError && (
                <Form.Control.Feedback type="invalid">
                  {emailError}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted">
                Use your registered email address
              </Form.Text>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || !email.trim()}
                size="lg"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-envelope me-2"></i>
                    Send Login Link
                  </>
                )}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;