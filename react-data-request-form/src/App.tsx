import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import {
  fetchMetrics,
  updateRowCount,
  fetchBooleanData,
} from "./redux/metricsSlice";

import NavBar from "./components/NavBar";
import DataView from "./components/DataView";
import DataForm from "./components/DataForm"; // Correct the path as needed
import RequestsTable from "./components/RequestsTable";
import Modal from "./components/Modal/Modal";
import env from "./config";
import Summary from "./components/RequestSummary/Summary";
import AuthorsList from "./components/AuthorsList";
import QCDataDisplay from "./components/QCTool/QCDataDisplay";
import QCDataTable from "./components/QCTool/QCDataTable";
import CollaboratorsHome from "./components/CollaboratorsConsole/Home";
import Login from "./components/CollaboratorsConsole/Login";
import CompleteSignIn from "./components/CollaboratorsConsole/CompleteSignIn";
import Admins from "./components/CollaboratorsConsole/Admins";
import Collaborators from "./components/CollaboratorsConsole/Collaborators";
import { completeSignIn, getCurrentUser } from "./services/authService";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebaseConfig";
import ApiUtils from "./api/ApiUtils";
import HomePage from "./components/HomePage";
import './App.css';
//import DataRequestAuthProvider from './components/DataRequestForm/DataRequestAuthProvider';
import ProtectedRoute from "./components/ProtectedRoute";
import { Container, Spinner } from "react-bootstrap";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchMetrics());
    dispatch(fetchBooleanData());
  }, [dispatch]);

  console.log(env);

  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);
  // Show loading while checking auth
  if (authLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Router>
        {user && <NavBar />}
        <div className="App mx-3">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/complete-sign-in" element={<CompleteSignIn />} />
            <Route path="/request-form" element={<ProtectedRoute><DataForm /></ProtectedRoute>} />
            <Route path="/view-requests" element={<ProtectedRoute><RequestsTable /></ProtectedRoute>} />
            <Route path="/request-summary/:fileName" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
            <Route path="/view-data" element={<ProtectedRoute><DataView /></ProtectedRoute>} />
            <Route path="/view-data/:fileNameParam" element={<ProtectedRoute><DataView /></ProtectedRoute>} />
            <Route path="/authors-list" element={<AuthorsList />} />
            <Route path="/qc-tool" element={<QCDataTable />} />
            <Route path="/qc-tool/:bidsId/:sesId" element={<QCDataDisplay />} />
            <Route path="/collaborators-directory" element={<ProtectedRoute requireCollaboratorAccess><CollaboratorsHome /></ProtectedRoute>} />
            <Route path="/collaborators-directory/collaborators" element={<ProtectedRoute requireCollaboratorAccess><Collaborators /></ProtectedRoute>} />
            <Route path="/admins" element={<ProtectedRoute><Admins /></ProtectedRoute>} />
          </Routes>
          <Modal />
        </div>
    </Router>
  );
}

export default App;
