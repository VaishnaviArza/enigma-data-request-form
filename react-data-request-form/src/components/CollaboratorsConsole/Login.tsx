import React, { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { sendSignInEmail } from "../../services/authService";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendSignInEmail(email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send sign-in email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Container className="mt-5" style={{ maxWidth: "600px" }}>
        <Card>
          <Card.Body>
            <Alert variant="success">
              <Alert.Heading>Check your email!</Alert.Heading>
              <p>
                We've sent a sign-in link to {email}. Click the link in the email to complete sign-in.
              </p>
              <hr />
              <p className="mb-0 text-muted small">
                The link will expire in 1 hour. You can close this window.
              </p>
            </Alert>
            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Send Another Link
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate("/")}
              >
                Return to Home
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <Card>
        <Card.Header>
          <h4 className="mb-0">NPNL ENIGMA Login</h4>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-4">
            Access the ENIGMA Portal including the Collaborators Directory and Data Request system.
          </p>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                //placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
              {/*<Form.Text className="text-muted">
                Enter your registered email address
              </Form.Text>*/}
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || !email.trim()}
              >
                {loading ? "Sending..." : "Send Sign-in Link"}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate("/")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;