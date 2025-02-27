import { Amplify } from "aws-amplify";
import {
  getCurrentUser as getUser,
  signIn,
  signOut,
  fetchAuthSession,
} from "aws-amplify/auth";
import config from "../amplify_outputs.json";

// Configure Amplify for client-side
if (typeof window !== "undefined") {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.auth.userPoolId,
        userPoolClientId: config.auth.userPoolClientId,
        identityPoolId: config.auth.identityPoolId,
      },
    },
  });
}

// Get current authenticated user
export async function getCurrentUser() {
  try {
    return await getUser();
  } catch {
    return null;
  }
}

// Login function
export async function login(email: string, password: string) {
  try {
    return await signIn({ username: email, password });
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

// Logout function
export async function logout() {
  try {
    await signOut();
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

// Get auth session
export async function getAuthSession() {
  try {
    return await fetchAuthSession();
  } catch (error) {
    console.error("Error fetching auth session:", error);
    return null;
  }
}
