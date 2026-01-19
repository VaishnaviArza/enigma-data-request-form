import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import Collaborators from "./Collaborators";

const CollaboratorsHome: React.FC = () => {
  const navigate = useNavigate();
  const userAuth = JSON.parse(localStorage.getItem("userAuth") || "{}");
  const isAdmin = userAuth.is_admin || false;

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/collaborators-directory/login");
    }
  }, [auth.currentUser, navigate]);

  return (
    <div>
      {/* Always render Collaborators component for ALL users (Admin, PI, Member) */}
      <Collaborators />
    </div>
  );
};

export default CollaboratorsHome;