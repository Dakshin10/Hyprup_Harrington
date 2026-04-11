"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();
  const { user, role: sessionRole, loading: authLoading } = useAuth();
  const [role, setRole] = useState<"student" | "business">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (user && sessionRole) {
      router.push(sessionRole === "student" ? "/student/dashboard" : "/business/dashboard");
    }
  }, [user, sessionRole, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { user: loggedInUser, role: finalRole, error: loginError } = await loginWithEmail(email, password, role);

    if (loginError) {
      // Firebase throws errors with certain formats, let's clean it up slightly if needed
      setError(loginError.replace("Firebase: ", ""));
      setLoading(false);
      return;
    }

    if (loggedInUser && finalRole) {
      router.push(finalRole === "student" ? "/student/dashboard" : "/business/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { user: loggedInUser, role: finalRole, error: loginError } = await loginWithGoogle(role);
    
    if (loginError) {
      setError(loginError.replace("Firebase: ", ""));
      setLoading(false);
      return;
    }

    if (loggedInUser && finalRole) {
      router.push(finalRole === "student" ? "/student/dashboard" : "/business/dashboard");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Left Pane - Branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 lg:p-16 xl:p-24 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col items-start gap-4 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl shadow-xl flex items-center justify-center font-bold text-2xl border border-white/10">
              W
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">WorkHop</h1>
          </div>
          <h2 className="text-blue-200 mt-8 text-3xl font-light leading-snug max-w-md">
            The intelligent <span className="font-semibold text-white">hyperlocal</span> micro-job platform.
          </h2>
          <p className="text-blue-200/80 mt-4 text-lg max-w-sm">
            Empowering students to build skills while helping local businesses thrive.
          </p>
        </div>
        
        <div className="relative z-10 flex gap-6 text-blue-200/60 text-sm animate-in fade-in duration-1000 delay-300">
          <span>&copy; {new Date().getFullYear()} WorkHop Inc.</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
        
        {/* Ambient background glows */}
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply blur-[128px] opacity-40"></div>
        <div className="absolute top-1/4 -right-32 w-[400px] h-[400px] bg-indigo-500 rounded-full mix-blend-multiply blur-[128px] opacity-40"></div>
        <div className="absolute -top-32 left-1/4 w-[300px] h-[300px] bg-cyan-400 rounded-full mix-blend-screen blur-[128px] opacity-20"></div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-16 lg:px-24 xl:px-32 relative bg-white dark:bg-slate-950">
        <div className="max-w-[420px] w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="text-center lg:text-left space-y-2">
            {/* Mobile-only logo */}
            <div className="lg:hidden flex items-center justify-center lg:justify-start gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-xl shadow-lg flex items-center justify-center font-bold text-xl text-white">
                W
              </div>
              <h1 className="text-2xl font-bold tracking-tight">WorkHop</h1>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Role Toggle Tabs */}
          <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl flex items-center shadow-inner relative">
            {/* Animated pill background */}
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-800 rounded-lg shadow-sm transition-transform duration-300 ease-out border border-slate-200/50 dark:border-slate-700/50 ${role === 'business' ? 'translate-x-full' : 'translate-x-0'}`} 
            />
            
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${
                role === "student"
                  ? "text-indigo-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("business")}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${
                role === "business"
                  ? "text-indigo-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Business
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-blue-500/50 outline-none transition-all"
                placeholder="you@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 dark:text-blue-400 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-blue-500/50 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 px-4 rounded-xl text-white font-medium bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-slate-950 transition-all shadow-lg shadow-slate-900/20 dark:shadow-white/10 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 overflow-hidden relative"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-950 text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl border-2 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 dark:focus:ring-offset-slate-950 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 dark:text-blue-400 hover:text-indigo-500 dark:hover:text-blue-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
