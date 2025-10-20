import React, { useState, useEffect } from "react";
import { Lock, Mail, Eye, EyeOff, Fingerprint } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { 
  isBiometricAvailable, 
  verifyBiometric, 
  setCredentials, 
  getCredentials,
  getBiometricTypeText 
} from "../utils/nativeBiometric";
import { isNative, triggerHaptic, showToast } from "../utils/nativeUtils";
import Particles from "../components/Particles";

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('none');
  const [savedCredentials, setSavedCredentials] = useState(null);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    if (!isNative()) return;

    const { available, biometryType } = await isBiometricAvailable();
    setBiometricAvailable(available);
    setBiometricType(biometryType);

    if (available) {
      const creds = await getCredentials();
      if (creds) {
        setSavedCredentials(creds);
      }
    }
  };

  const handleBiometricLogin = async () => {
    if (!savedCredentials) return;

    try {
      await triggerHaptic('light');
      setLoading(true);
      setError("");

      await verifyBiometric();
      
      await signInWithEmailAndPassword(
        auth,
        savedCredentials.username,
        savedCredentials.password
      );

      await triggerHaptic('heavy');
      await showToast('Logged in successfully');
      onLogin();
    } catch (error) {
      console.error("Biometric login error:", error);
      setError("Biometric authentication failed");
      await triggerHaptic('medium');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await triggerHaptic('light');

    try {
      if (!isLogin) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        await createUserWithEmailAndPassword(auth, email, password);
        
        if (isNative() && biometricAvailable) {
          await setCredentials(email, password);
        }

        await showToast('Account created successfully');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        
        if (isNative() && biometricAvailable) {
          await setCredentials(email, password);
        }

        await showToast('Logged in successfully');
      }

      await triggerHaptic('heavy');
      onLogin();
    } catch (error) {
      console.error("Auth error:", error);
      
      let errorMessage = "An error occurred";
      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "User not found";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters";
      }
      
      setError(errorMessage);
      await triggerHaptic('medium');
      await showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
      <Particles />

      <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/10 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PhotoVault</h1>
          <p className="text-gray-400">Secure. Private. Yours.</p>
        </div>

        {/* Biometric Login Button */}
        {biometricAvailable && savedCredentials && isLogin && (
          <button
            onClick={handleBiometricLogin}
            disabled={loading}
            className="w-full mb-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <Fingerprint className="w-5 h-5" />
            <span>Login with {getBiometricTypeText(biometricType)}</span>
          </button>
        )}

        {savedCredentials && isLogin && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--bg-secondary)] text-gray-400">or continue with email</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-white font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-[var(--bg-primary)] text-white pl-12 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[var(--bg-primary)] text-white pl-12 pr-12 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-white font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[var(--bg-primary)] text-white pl-12 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? (
              <>
                Don't have an account? <span className="text-purple-500 font-medium">Sign up</span>
              </>
            ) : (
              <>
                Already have an account? <span className="text-purple-500 font-medium">Login</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
