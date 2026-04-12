import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from "firebase/auth";
import { auth } from "./firebase";
import { handleUserLogin } from "./user";
import { UserRole } from "@/types/user";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (uiRole: UserRole) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const role = await handleUserLogin(result.user.uid, result.user.email, uiRole);
    return { user: result.user, role, error: null };
  } catch (error: any) {
    return { user: null, role: null, error: error.message };
  }
};

export const loginWithEmail = async (email: string, password: string, uiRole: UserRole) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const role = await handleUserLogin(result.user.uid, result.user.email, uiRole);
    return { user: result.user, role, error: null };
  } catch (error: any) {
    return { user: null, role: null, error: error.message };
  }
};

export const registerWithEmail = async (email: string, password: string, uiRole: UserRole) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const role = await handleUserLogin(result.user.uid, result.user.email, uiRole);
    return { user: result.user, role, error: null };
  } catch (error: any) {
    return { user: null, role: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
