import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setAuthToken } from "@/lib/api";

// Parse admin emails from env (comma/space/newline separated)
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
  .split(/[, \s\n]+/)
  .map((e: string) => e.trim().toLowerCase()) // 👈 typed parameter
  .filter(Boolean);

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isClient: boolean;
  registerUser: (email: string, password: string) => Promise<UserCredential>;
  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  /** alias of loginWithEmail (for older code) */
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser ?? null);

      if (firebaseUser) {
        // Fetch latest claims and set axios auth header
        const [tokenResult, idToken] = await Promise.all([
          firebaseUser.getIdTokenResult(true),
          firebaseUser.getIdToken(true),
        ]);

        // claims.admin from Firebase custom claims (seedAdmins.ts)
        const claimAdmin = Boolean((tokenResult.claims as any).admin);

        // Fallback: env-based email list
        const emailAdmin =
          !!firebaseUser.email &&
          ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase());

        setIsAdmin(claimAdmin || emailAdmin);

        // Set axios Authorization header for this session
        setAuthToken(idToken);
      } else {
        setIsAdmin(false);
        setAuthToken(undefined); // clear axios header
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ------- API methods -------
  const registerUser = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const loginWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const login = loginWithEmail; // backward-compat with older calls

  const logout = async () => {
    await signOut(auth);
    setAuthToken(undefined);
  };

  const getIdToken = async (forceRefresh = false) => {
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin,
      isClient: !!user && !isAdmin,
      registerUser,
      loginWithEmail,
      login,
      logout,
      getIdToken,
    }),
    [user, loading, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
