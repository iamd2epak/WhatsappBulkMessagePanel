"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { cn } from "@/lib/utils";
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Firebase Login
            await signInWithEmailAndPassword(auth, email, password);

            // Set local session (optional, but keeps existing logic working)
            login();

            router.push("/");
        } catch (err: any) {
            console.error("Login error:", err);
            let msg = "Invalid credentials. Please try again.";
            if (err.code === 'auth/user-not-found') msg = "User not found.";
            if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
            if (err.code === 'auth/too-many-requests') msg = "Too many attempts. Try again later.";
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#101827] text-white overscroll-none">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent animate-spin-slow opacity-30 blur-3xl" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
            </div>

            <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
                <div className="w-full max-w-[320px] md:max-w-[380px] flex flex-col gap-6 md:gap-10 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8">

                    {/* Hero Section */}
                    <div className="text-center space-y-4 md:space-y-6">
                        <div className="relative mx-auto w-16 h-16 md:w-24 md:h-24">
                            <div className="absolute inset-0 bg-green-500 rounded-2xl md:rounded-3xl blur-2xl opacity-20 animate-pulse" />
                            <div className="relative w-full h-full bg-gradient-to-tr from-green-400 to-emerald-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30 transform rotate-6 hover:rotate-0 transition-all duration-500 group cursor-pointer">
                                <Lock className="w-6 h-6 md:w-10 md:h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                    <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                                Welcome Back
                            </h1>
                            <p className="text-gray-400 text-xs md:text-sm font-medium tracking-wide">
                                SECURE ACCESS PORTAL
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
                        <div className="space-y-4 md:space-y-6">
                            <div className="group space-y-1.5 md:space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-green-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 md:pl-14 pr-4 md:pr-5 py-3 md:py-4 bg-white/10 border border-white/20 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white/15 placeholder-gray-500 text-white transition-all duration-300 outline-none text-sm md:text-lg font-medium backdrop-blur-xl shadow-inner"
                                        placeholder="name@company.com"
                                        required
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-5 flex items-center pointer-events-none z-10">
                                        <Mail className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="group space-y-1.5 md:space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-green-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 md:pl-14 pr-10 md:pr-12 py-3 md:py-4 bg-white/10 border border-white/20 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white/15 placeholder-gray-500 text-white transition-all duration-300 outline-none text-sm md:text-lg font-medium backdrop-blur-xl shadow-inner"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-5 flex items-center pointer-events-none z-10">
                                        <Lock className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 md:pr-5 flex items-center text-gray-400 hover:text-white transition-colors z-10 cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                                        ) : (
                                            <Eye className="h-4 w-4 md:h-5 md:w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/10 text-red-400 text-xs md:text-sm text-center font-medium animate-in fade-in slide-in-from-top-2 backdrop-blur-md">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3 md:py-5 bg-white text-black hover:bg-gray-200 font-bold text-base md:text-lg rounded-xl md:rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                            ) : (
                                <div className="flex items-center justify-center w-full relative z-10">
                                    <span className="mr-2">Sign In</span>
                                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out skew-x-12" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
