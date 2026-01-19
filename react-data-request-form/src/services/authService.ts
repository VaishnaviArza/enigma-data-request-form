import { auth } from "../firebaseConfig";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import ApiUtils from "../api/ApiUtils";


const actionCodeSettings = {
  url: window.location.origin + "/collaborators-directory/complete-sign-in",
  handleCodeInApp: true,
};

// Data Request Form specific action code settings
const dataRequestActionCodeSettings = {
  url: window.location.origin + "/complete-sign-in",
  handleCodeInApp: true,
};


export const sendSignInEmail = async (email: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/complete-sign-in`,
    handleCodeInApp: true,
  };
  
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem("emailForSignIn", email);
};


// New function for data request admin login
export const sendDataRequestAdminSignInEmail = async (email: string) => {
  await sendSignInLinkToEmail(auth, email, dataRequestActionCodeSettings);
  window.localStorage.setItem("emailForSignIn", email);
};

export const completeSignIn = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem("emailForSignIn");

    if (!email) {
      email = window.prompt("Please provide your email for confirmation") || "";
    }

    try {
      const result = await signInWithEmailLink(
        auth,
        email,
        window.location.href
      );
      window.localStorage.removeItem("emailForSignIn");
      return result.user;
    } catch (error) {
      console.error("Error signing in with email link", error);
      throw error;
    }
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const getCurrentUserToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error("Error getting ID token", error);
      return null;
    }
  }
  return null;
};


// Check if current user is data request admin (DYNAMIC - fetches from Firestore)
export const checkIfDataRequestAdmin = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user || !user.email) return false;

  try {
    const token = await getCurrentUserToken();
    if (!token) return false;

    const response = await ApiUtils.getDataRequestAdmins(token);
    return response.admins
      .map((e: string) => e.toLowerCase())
      .includes(user.email.toLowerCase());
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    window.localStorage.removeItem("emailForSignIn");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

