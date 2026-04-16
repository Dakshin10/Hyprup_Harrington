"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile, updateUserProfile, setAuthCookie, UserRole } from "@/lib/auth-utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, User as UserIcon, Briefcase } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const { user, role: currentRole, loading: authLoading } = useAuth();
  
  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Intent / Role Selection
  const [role, setRole] = useState<UserRole>("student");
  const [needsRoleSetup, setNeedsRoleSetup] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<FirebaseUser | null>(null);

  // If user is already authenticated and has a role, redirect them
  useEffect(() => {
    if (user && currentRole && !authLoading && !needsRoleSetup) {
      router.push(currentRole === "student" ? "/student/dashboard" : "/business/dashboard");
    }
  }, [user, currentRole, authLoading, router, needsRoleSetup]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const token = await firebaseUser.getIdToken();
      setAuthCookie(token);
      
      const profile = await getUserProfile(firebaseUser.uid);
      
      if (profile) {
        // User exists, use DB role
        router.push(profile.role === "student" ? "/student/dashboard" : "/business/dashboard");
      } else {
        // New user or missing profile, use selected role from toggle
        const newProfile = await updateUserProfile(firebaseUser.uid, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: role,
          createdAt: Date.now()
        });
        router.push(newProfile.role === "student" ? "/student/dashboard" : "/business/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const token = await firebaseUser.getIdToken();
      setAuthCookie(token);

      const profile = await getUserProfile(firebaseUser.uid);
      
      if (profile) {
        router.push(profile.role === "student" ? "/student/dashboard" : "/business/dashboard");
      } else {
        // Successful Google login but no record in MongoDB
        // Save using current role intent from the toggle
        const newProfile = await updateUserProfile(firebaseUser.uid, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: role,
          name: firebaseUser.displayName || undefined,
          createdAt: Date.now()
        });
        router.push(newProfile.role === "student" ? "/student/dashboard" : "/business/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#020617] text-white">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-24 bg-gradient-to-br from-orange-600 via-orange-900 to-slate-950 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-2xl text-orange-600 shadow-xl">W</div>
            <h1 className="text-4xl font-black tracking-tight">WorkHop</h1>
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Hyperlocal jobs.<br />
            <span className="text-orange-400">Instant income.</span>
          </h2>
          <p className="text-xl text-orange-100/70 max-w-md">
            The platform that connects local talent with businesses in minutes.
          </p>
        </div>
        
        <div className="relative z-10 text-orange-100/40 text-sm">
          &copy; {new Date().getFullYear()} WorkHop. Platform for the future of work.
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500 rounded-full blur-[128px] opacity-20"></div>
      </div>

      {/* Form Side */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-24">
        <div className="max-w-md w-full mx-auto">
          {/* Header Bar with Logo (Mobile) and Role Switch */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex lg:hidden items-center gap-2 text-lg font-bold">
              <div className="bg-orange-500 w-8 h-8 flex items-center justify-center rounded-lg text-white">
                W
              </div>
              WorkHop
            </div>
            {/* Desktop spacer for logo on hidden visual side */}
            <div className="hidden lg:block w-8 h-8 opacity-0"></div>

            {/* Role Switch */}
            <div className="flex bg-[#0f172a] p-1 rounded-xl border border-white/5 shadow-inner">
              <button
                onClick={() => setRole("student")}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  role === "student"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Student
              </button>

              <button
                onClick={() => setRole("business")}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  role === "business"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Business
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-gray-400">Sign in to your account with your email.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm animate-shake">
                  {error}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:border-orange-500 outline-none transition-all"
                  placeholder="you@email.com"
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Password</label>
                  <Link href="#" className="text-xs text-orange-500 font-bold hover:underline transition-colors">Forgot?</Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:border-orange-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Sign In"}
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-800"></div>
              <span className="flex-shrink mx-4 text-gray-600 text-sm font-bold tracking-tighter">OR</span>
              <div className="flex-grow border-t border-gray-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl border border-gray-800 bg-transparent text-white font-semibold hover:bg-gray-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <p className="text-center text-gray-600">
              Don't have an account? <Link href="/register" className="text-orange-500 font-bold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
