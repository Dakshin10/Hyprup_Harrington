"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile, UserRole } from "@/lib/auth-utils";
import Link from "next/link";

const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role: sessionRole, loading: authLoading } = useAuth();
  
  // Initialize role from query param
  const initialRole = (searchParams.get("role") as UserRole) || "student";
  
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync role state if searchParams change (optional but good for UX)
  useEffect(() => {
    const r = searchParams.get("role") as UserRole;
    if (r && (r === "student" || r === "business")) {
      setRole(r);
    }
  }, [searchParams]);

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (user && sessionRole && !authLoading) {
      router.push(sessionRole === "student" ? "/student/dashboard" : "/business/dashboard");
    }
  }, [user, sessionRole, authLoading, router]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Save profile with role in MongoDB
      await updateUserProfile(firebaseUser.uid, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
        name: name,
        createdAt: Date.now()
      });

      router.push(role === "student" ? "/student/dashboard" : "/business/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Save profile with role in MongoDB
      await updateUserProfile(firebaseUser.uid, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
        name: firebaseUser.displayName || name,
        createdAt: Date.now()
      });

      router.push(role === "student" ? "/student/dashboard" : "/business/dashboard");
    } catch (err: any) {
      setError(err.message || "Google registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
        <p className="text-gray-400">Join WorkHop to start earning or hiring today.</p>
      </div>

      {/* Role Toggle Tabs */}
      <div className="bg-gray-900 p-1.5 rounded-xl flex items-center relative border border-gray-800">
        <div 
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-orange-500 rounded-lg shadow-lg shadow-orange-500/20 transition-transform duration-300 ease-out ${role === 'business' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`} 
        />
        
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-lg transition-colors duration-300 ${
            role === "student" ? "text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setRole("business")}
          className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-lg transition-colors duration-300 ${
            role === "business" ? "text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Business
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:border-orange-500 outline-none transition-all"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:border-orange-500 outline-none transition-all"
            placeholder="you@email.com"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-widest font-bold text-gray-500">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:border-orange-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Create Account"}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-800"></div>
        <span className="flex-shrink mx-4 text-gray-600 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-800"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={loading}
        className="w-full py-3 rounded-xl border border-gray-800 bg-transparent text-white font-semibold hover:bg-gray-900 transition-all flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign up with Google
      </button>

      <p className="text-center text-gray-600">
        Already have an account? <Link href="/login" className="text-orange-500 font-bold hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen w-full bg-[#020617] text-white">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-24 bg-gradient-to-br from-orange-600 via-orange-900 to-slate-950 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-2xl text-orange-600">W</div>
            <h1 className="text-4xl font-black tracking-tight">WorkHop</h1>
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Join the <br />
            <span className="text-orange-400">Micro-Job economy.</span>
          </h2>
          <p className="text-xl text-orange-100/70 max-w-md">
            Create an account and start connecting with local opportunities today.
          </p>
        </div>
        
        <div className="relative z-10 text-orange-100/40 text-sm">
          &copy; {new Date().getFullYear()} WorkHop. The future is hyperlocal.
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500 rounded-full blur-[128px] opacity-20"></div>
      </div>

      {/* Form Side */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-24">
        <Suspense fallback={<div className="text-center">Loading form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
};

export default RegisterPage;
