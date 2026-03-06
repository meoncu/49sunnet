"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  getIdTokenResult,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

type Role = "admin" | "user";

type AppUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: Role;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUserWithRole(user: User, role: Role): AppUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    role,
  };
}

async function ensureUserDocument(user: User): Promise<Role> {
  const usersRef = collection(db, "users");
  const userRef = doc(usersRef, user.uid);
  const snapshot = await getDoc(userRef);

  // Önce custom claims kontrolü (en güvenli)
  const tokenResult = await getIdTokenResult(user, true);
  const isAdminFromToken = tokenResult.claims.admin === true;

  if (snapshot.exists()) {
    const data = snapshot.data() as { role?: Role };
    // Token'dan admin claim'i varsa, Firestore'u da güncelle
    if (isAdminFromToken && data.role !== "admin") {
      await updateDoc(userRef, { role: "admin" });
      return "admin";
    }
    return data.role ?? "user";
  }

  // Yeni kullanıcı oluştur
  const role: Role = isAdminFromToken ? "admin" : "user";

  await setDoc(userRef, {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    role,
    createdAt: serverTimestamp(),
  });

  return role;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.warn("Auth instance is not available. Check Firebase configuration.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const role = await ensureUserDocument(firebaseUser);
        setUser(mapUserWithRole(firebaseUser, role));
      } catch (error) {
        console.error("Error setting user role:", error);
        setUser(mapUserWithRole(firebaseUser, "user"));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  // Admin kontrolü: Firestore role veya email fallback
  const ADMIN_EMAIL = "meoncu@gmail.com";
  const isAdminUser = user?.role === "admin" ||
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const value: AuthContextValue = {
    user,
    loading,
    signInWithGoogle,
    logout,
    isAdmin: isAdminUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

