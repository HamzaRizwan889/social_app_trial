"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("AuthProvider mounted");
  const unsubscribe = onAuthStateChanged(
    auth,
    (firebaseUser) => {
      console.log("auth state:", firebaseUser?.uid ?? null);
      setUser(firebaseUser);
      setLoading(false);
    },
    (error) => {
      console.error("auth error:", error);
      setLoading(false);
    },
  );
  return unsubscribe;
}, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);