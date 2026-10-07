import { FirebaseError } from "firebase/app";

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Email already in use";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/weak-password":
        return "Password is too weak";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later";
      case "auth/network-request-failed":
        return "Network error. Check your connection";
      case "auth/popup-blocked":
        return "Popup was blocked. Allow popups and try again";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using another sign-in method";
    }
  }
  return "Something went wrong. Please try again";
}