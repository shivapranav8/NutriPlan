import { motion } from "motion/react";
import { Mail, Chrome, Apple } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

interface SignupScreenProps {
  onComplete?: () => void;
}

import { useAuth } from "../contexts/AuthContext";

export function SignupScreen({ onComplete }: SignupScreenProps) {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      // onComplete is handled by the auth state change in App.tsx
    } catch (error) {
      console.error("Failed to sign in", error);
    }
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock email signup - would connect to actual auth in production
    console.log("Email signup initiated");
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22D3EE] to-[#14B8A6] mb-4">
            <Apple className="w-8 h-8 text-[#0B0E14]" />
          </div>
          <h1 className="text-[#E6E9EF] mb-2">Welcome to NutriPlan</h1>
          <p className="text-[#9AA3B2]">
            Your personalized nutrition companion
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-2xl bg-[#121722]/60 backdrop-blur-xl border border-[#2A3242] shadow-2xl"
        >
          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignup}
            className="w-full h-12 bg-white hover:bg-gray-50 text-[#1f1f1f] border-0 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mb-4"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <Separator className="bg-[#2A3242]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-[#121722] text-[#9AA3B2] text-sm">
              or
            </span>
          </div>

          {/* Email Sign Up Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-[#E6E9EF] mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="h-11 bg-[#0B0E14]/50 border-[#2A3242] text-[#E6E9EF] placeholder:text-[#9AA3B2]/50 rounded-xl focus:border-[#22D3EE] focus:ring-[#22D3EE]/20"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[#E6E9EF] mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className="h-11 bg-[#0B0E14]/50 border-[#2A3242] text-[#E6E9EF] placeholder:text-[#9AA3B2]/50 rounded-xl focus:border-[#22D3EE] focus:ring-[#22D3EE]/20"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[#E6E9EF] mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                className="h-11 bg-[#0B0E14]/50 border-[#2A3242] text-[#E6E9EF] placeholder:text-[#9AA3B2]/50 rounded-xl focus:border-[#22D3EE] focus:ring-[#22D3EE]/20"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] hover:from-[#22D3EE]/90 hover:to-[#14B8A6]/90 text-[#0B0E14] border-0 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6"
            >
              <Mail className="w-5 h-5 mr-2" />
              Sign Up with Email
            </Button>
          </form>

          {/* Terms */}
          <p className="text-[#9AA3B2] text-center text-sm mt-6">
            By continuing, you agree to our{" "}
            <button className="text-[#22D3EE] hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-[#22D3EE] hover:underline">
              Privacy Policy
            </button>
          </p>
        </motion.div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-[#9AA3B2]">
            Already have an account?{" "}
            <button className="text-[#22D3EE] hover:underline">
              Sign In
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}