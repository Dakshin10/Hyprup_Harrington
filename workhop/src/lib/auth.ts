import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { loginUser } from "@/services/userService";
import { UserRole } from "@/types/user";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (uiRole: UserRole) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const { role } = await loginUser(result.user.uid, result.user.email, uiRole);
    return { user: result.user, role, error: null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Login failed";
    return { user: null, role: null, error: msg };
  }
};

export const loginWithEmail = async (email: string, password: string, uiRole: UserRole) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const { role } = await loginUser(result.user.uid, result.user.email, uiRole);
    return { user: result.user, role, error: null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Login failed";
    return { user: null, role: null, error: msg };
  }
};

export const registerWithEmail = async (email: string, password: string, uiRole: UserRole) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const { role } = await loginUser(result.user.uid, result.user.email, uiRole);
    return { user: result.user, role, error: null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Registration failed";
    return { user: null, role: null, error: msg };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Logout failed";
    return { error: msg };
  }
};
