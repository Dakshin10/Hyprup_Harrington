import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { UserRole, UserProfile } from "@/types/user";

export const handleUserLogin = async (
  uid: string,
  email: string | null,
  uiRole: UserRole
): Promise<UserRole> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // 4. User EXISTS: Ignore UI role, fetch stored role
      const data = userSnap.data() as Partial<UserProfile>;
      
      // Strict validation constraint
      const storedRole = data.role;
      if (storedRole === "student" || storedRole === "business") {
        return storedRole;
      } else {
        // Fallback role if Firestore data is somehow corrupted natively
        console.warn(`[handleUserLogin] Corrupted role data for UID ${uid}. Falling back to default.`);
        return "student"; // Safe fallback
      }
    } else {
      // 3. User does NOT exist: Create document with UI selection
      const newUser: UserProfile = {
        uid,
        email: email || "anonymous@workhop.local",
        role: uiRole,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userRef, newUser);
      return uiRole;
    }
  } catch (error) {
    // 9. Error Handling constraints
    console.error(`[handleUserLogin] Critical Firestore Error:`, error);
    throw new Error("Unable to establish user profile safely in database.");
  }
};
