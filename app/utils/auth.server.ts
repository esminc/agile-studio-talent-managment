import { Amplify } from "aws-amplify";
import {
  getCurrentUser as getUser,
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  fetchAuthSession,
} from "aws-amplify/auth";
import config from "../amplify_outputs.json";
import { createUserSession, logout } from "./session.server";

// Configure Amplify for server-side
Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: config.auth.userPoolId,
        userPoolClientId: config.auth.userPoolClientId,
        identityPoolId: config.auth.identityPoolId,
      },
    },
  },
  { ssr: true },
);

// Login function
export async function login(
  email: string,
  password: string,
  redirectTo: string,
) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password,
    });

    if (isSignedIn) {
      const user = await getUser();
      return createUserSession(user.username, redirectTo);
    } else {
      throw new Error(
        `Authentication requires next step: ${nextStep.signInStep}`,
      );
    }
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

// Signup function
export async function signup(email: string, password: string) {
  try {
    const { isSignUpComplete } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });

    return isSignUpComplete;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

// Confirm signup function
export async function confirmSignup(email: string, code: string) {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    return isSignUpComplete;
  } catch (error) {
    console.error("Error confirming signup:", error);
    throw error;
  }
}

// Logout function
export async function logoutUser(request: Request) {
  try {
    await signOut();
    return logout(request);
  } catch (error) {
    console.error("Error signing out:", error);
    return logout(request);
  }
}

// Get current authenticated user
export async function getCurrentUser() {
  try {
    return await getUser();
  } catch {
    return null;
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
