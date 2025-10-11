import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, X, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from '@supabase/supabase-js';

// AuthenticationManager hook for header usage
export function AuthenticationManager({ onUserChange }: { onUserChange?: (user: any) => void } = {}) {
  const supabase = createClient((import.meta as any).env.VITE_SUPABASE_URL, (import.meta as any).env.VITE_SUPABASE_ANON_KEY);

  const [user, setUser] = useState<any>(() => {
    const stored = sessionStorage.getItem('customerData');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const normalizeUser = (u: any) => {
    if (!u) return null;
    let firstName = u.user_metadata?.firstName || u.user_metadata?.full_name || 'User';
    let lastName = '';
    if (u.user_metadata?.full_name && !u.user_metadata?.firstName) {
      const parts = u.user_metadata.full_name.split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }
    return {
      id: u.id,
      firstName,
      lastName,
      email: u.email,
      phone: u.phone || null,
      addresses: { edges: [] }
    };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      const normalized = normalizeUser(u);
      setUser(normalized);
      if (normalized) sessionStorage.setItem('customerData', JSON.stringify(normalized));
      else sessionStorage.removeItem('customerData');
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (onUserChange) onUserChange(user);
  }, [user, onUserChange]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    sessionStorage.removeItem('customerData');
    setIsUserMenuOpen(false);
    setIsAuthModalOpen(false);
  };

  return {
    user,
    setUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
    userMenuRef,
    handleLogout,
  };
}

export const AuthModal = ({ 
  isOpen, 
  onClose, 
  setUser 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  setUser: (user: any) => void 
}) => {
  const supabase = createClient((import.meta as any).env.VITE_SUPABASE_URL, (import.meta as any).env.VITE_SUPABASE_ANON_KEY);

  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'complete'>('email');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeToTerms: false
  });

  const normalizeUser = (u: any) => {
    if (!u) return null;
    let firstName = u.user_metadata?.firstName || u.user_metadata?.full_name || 'User';
    let lastName = '';
    if (u.user_metadata?.full_name && !u.user_metadata?.firstName) {
      const parts = u.user_metadata.full_name.split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }
    return {
      id: u.id,
      firstName,
      lastName,
      email: u.email,
      phone: u.phone || null,
      addresses: { edges: [] }
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      showMessage('error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
      if (error) {
        showMessage('error', error.message || 'Failed to send reset email. Please try again.');
      } else {
        showMessage('success', 'Password reset email sent! Please check your inbox and click the reset link.');
        setResetStep('complete');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showMessage('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      showMessage('error', 'Passwords do not match!');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          showMessage('error', error.message || 'Login failed. Please check your credentials.');
        } else if (data.user) {
          const normalized = normalizeUser(data.user);
          setUser(normalized);
          showMessage('success', `Welcome back, ${normalized.firstName}!`);
          setTimeout(() => onClose(), 1500);
        }
      } else {
        // Register
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              firstName: formData.username,
              acceptsMarketing: formData.agreeToTerms,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            showMessage('info', 'Account already exists! Please log in instead.');
            setIsLogin(true);
          } else {
            showMessage('error', error.message || 'Registration failed. Please try again.');
          }
        } else {
          showMessage('success', 'Registration successful! Please log in with your credentials.');
          setIsLogin(true);
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      showMessage('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((window as any).google && isOpen) {
      (window as any).google.accounts.id.initialize({
        client_id: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: response.credential,
            });
            if (error) throw error;
            if (data.user) {
              const normalized = normalizeUser(data.user);
              setUser(normalized);
              showMessage('success', `Welcome, ${normalized.firstName}!`);
              setTimeout(() => onClose(), 1500);
            }
          } catch (error: any) {
            showMessage('error', error.message || 'Google authentication failed.');
          }
        },
      });

      const buttonDiv = document.getElementById('googleSignInButton');
      if (buttonDiv) {
        (window as any).google.accounts.id.renderButton(
          buttonDiv,
          { theme: 'outline', size: 'large', width: 300 }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.9, opacity: 0 }} 
          className="bg-[#0C1610] rounded-xl w-full max-w-4xl h-full max-h-[85vh] shadow-xl text-white flex overflow-hidden relative md:w-[60vw] md:h-[85vh]"
        >
          {/* Left side */}
          <div className="hidden md:flex w-[55%] relative overflow-hidden flex-col justify-between bg-[url('/loginbg/logbg.png')] bg-cover bg-center">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%239C92AC\" fill-opacity=\"0.1\"><circle cx=\"30\" cy=\"30\" r=\"4\"/></g></g></svg>')", backgroundRepeat: "repeat" }} />
            <div className="relative z-10 text-center pt-[8vh]">
              <img className="w-[12vw] h-auto mx-auto" alt="Ro CART" src="/ro-cart-33-2.png" />
            </div>
            <div className="relative z-10 text-center px-[2vw] pb-[2vh]">
              <span className="text-[0.9vw] text-white leading-tight">By accessing the site, I attest that I am at least 18 years old and have read the Terms and Conditions</span>
            </div>
          </div>

          {/* Right side form */}
          <div className="w-full md:w-[55%] p-4 md:p-[2vw] flex flex-col relative">
            <button 
              type="button" 
              onClick={onClose} 
              className="absolute top-4 right-4 md:top-[1vw] md:right-[1vw] text-gray-400 hover:text-white text-2xl md:text-[1vw] p-3 md:p-[0.5vw] rounded-full hover:bg-gray-800 transition-colors z-10"
            >
              <X className="w-8 h-8 md:w-[1.5vw] md:h-[1.5vw]" />
            </button>

            <div className="md:hidden text-center mb-6 mt-2">
              <img className="w-32 h-auto mx-auto" alt="Ro CART" src="/ro-cart-33-2.png" />
            </div>

            {/* Message Banner */}
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-300' :
                    message.type === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-300' :
                    'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="text-sm md:text-[0.9vw]">{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!showResetPassword ? (
              <>
                <div className="flex justify-center mb-4 mt-1 w-full max-w-sm md:max-w-[25vw] mx-auto">
                  <button 
                    onClick={() => setIsLogin(false)} 
                    className={`flex-1 text-center px-6 py-2 text-lg md:text-[1.5vw] font-semibold transition-colors border-b-2 md:border-b-[0.5vh] ${!isLogin ? 'text-[#eff0ef] border-white border-b-4' : 'text-gray-400 border-gray-600 hover:text-white'}`}
                  >
                    Register
                  </button>
                  <button 
                    onClick={() => setIsLogin(true)} 
                    className={`flex-1 text-center px-6 py-2 text-lg md:text-[1.5vw] font-semibold transition-colors border-b-2 md:border-b-[0.5vh] ${isLogin ? 'text-white border-white border-b-4' : 'text-gray-400 border-gray-600 hover:text-white'}`}
                  >
                    Login
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                  <style>{`form::-webkit-scrollbar { display: none; }`}</style>
                  {!isLogin ? (
                    <div className="flex flex-col items-center space-y-4 md:space-y-[1.5vh]">
                      <div className="w-full max-w-sm md:w-[25vw]">
                        <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Username*</label>
                        <input 
                          type="text" 
                          name="username" 
                          value={formData.username} 
                          onChange={handleInputChange} 
                          className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#3DFF88] focus:outline-none" 
                          placeholder="Enter Username" 
                          required 
                        />
                      </div>
                      <div className="w-full max-w-sm md:w-[25vw]">
                        <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Email*</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#3DFF88] focus:outline-none" 
                          placeholder="Enter Email" 
                          required 
                        />
                      </div>
                      <div className="w-full max-w-sm md:w-[25vw]">
                        <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Password*</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#3DFF88] focus:outline-none" 
                            placeholder="Enter Password" 
                            required 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff size={20} className="md:w-[1.5vw] md:h-[1.5vw]" /> : <Eye size={20} className="md:w-[1.5vw] md:h-[1.5vw]" />}
                          </button>
                        </div>
                      </div>
                      <div className="w-full max-w-sm md:w-[25vw]">
                        <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Confirm Password*</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="confirmPassword" 
                            value={formData.confirmPassword} 
                            onChange={handleInputChange} 
                            className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#3DFF88] focus:outline-none" 
                            placeholder="Confirm Password" 
                            required 
                          />
                        </div>
                      </div>
                      <div className="w-full max-w-sm md:w-[25vw]">
                        <label className="flex items-start gap-2 md:gap-[0.5vw] cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="agreeToTerms" 
                            checked={formData.agreeToTerms} 
                            onChange={handleInputChange} 
                            className="mt-1 w-4 h-4 md:w-[1vw] md:h-[1vw] accent-[#3DFF88]" 
                            required 
                          />
                          <span className="text-sm md:text-[0.9vw] text-gray-300 leading-relaxed">
                            I agree to the <span className="text-[#ffffff] hover:underline cursor-pointer">Terms and Conditions</span> and <span className="text-[#ffffff] hover:underline cursor-pointer">Privacy Policy</span>.
                          </span>
                        </label>
                      </div>
                      <div className="w-full max-w-sm md:w-[25vw]">
                        <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Referral Code (Optional)</label>
                        <input 
                          type="text" 
                          name="referralCode" 
                          value={formData.referralCode} 
                          onChange={handleInputChange} 
                          className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#3DFF88] focus:outline-none" 
                          placeholder="Enter Code" 
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isLoading || !formData.agreeToTerms} 
                        className="w-full max-w-sm md:w-[25vw] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 md:py-[1.5vh] text-base md:text-[1vw] font-semibold text-white transition-all duration-200"
                      >
                        {isLoading ? "Creating Account..." : "Register"}
                      </button>
                      <span className="text-gray-400 text-sm md:text-[0.9vw]">or continue with</span>
                      <div id="googleSignInButton" className="w-full max-w-sm md:w-[25vw]"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4 md:space-y-[1.5vh]">
                      <div className="w-full max-w-sm md:w-[25vw]">
                        <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Email*</label>
                        <input 
                          type="text" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#3DFF88] focus:outline-none" 
                          placeholder="Enter your email" 
                          required 
                        />
                      </div>
                      <div className="w-full max-w-sm md:w-[25vw]">
                        <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Password*</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#3DFF88] focus:outline-none" 
                            placeholder="Enter your password" 
                            required 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff size={20} className="md:w-[1.5vw] md:h-[1.5vw]" /> : <Eye size={20} className="md:w-[1.5vw] md:h-[1.5vw]" />}
                          </button>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="text-[#3DFF88] text-sm md:text-[0.9vw] hover:underline"
                        onClick={() => setShowResetPassword(true)}
                      >
                        Forgot your password?
                      </button>
                      <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full max-w-sm md:w-[25vw] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 md:py-[1.5vh] text-base md:text-[1vw] font-semibold text-white transition-all duration-200"
                      >
                        {isLoading ? "Signing In..." : "Sign In"}
                      </button>
                      <span className="text-gray-400 text-sm md:text-[0.9vw]">or continue with</span>
                      <div id="googleSignInButton" className="w-full max-w-sm md:w-[25vw]"></div>
                    </div>
                  )}
                  <div className="md:hidden text-center mt-6 px-4">
                    <span className="text-xs text-white leading-tight">By accessing the site, I attest that I am at least 18 years old and have read the Terms and Conditions</span>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                {resetStep === 'email' ? (
                  <>
                    <h2 className="text-xl md:text-[1.5vw] font-semibold mb-4 text-center">Reset Password</h2>
                    <p className="text-sm md:text-[0.9vw] text-gray-400 mb-6 text-center max-w-sm">
                      Enter your email address and we'll send you a secure reset link to create a new password.
                    </p>
                    <form onSubmit={handlePasswordReset} className="w-full max-w-sm md:w-[25vw] space-y-4">
                      <div>
                        <label className="block text-sm md:text-[0.9vw] text-white mb-2">Email*</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          className="w-full bg-[#030804] border border-[#000000] rounded-lg px-4 py-3 text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#3DFF88] focus:outline-none" 
                          placeholder="Enter your email" 
                          required 
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 text-base md:text-[1vw] font-semibold text-white transition-all duration-200"
                      >
                        {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowResetPassword(false);
                          setResetStep('email');
                        }} 
                        className="w-full text-[#3DFF88] text-sm md:text-[0.9vw] hover:underline mt-2"
                      >
                        Back to Login
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="mb-6 flex justify-center">
                      <div className="w-16 h-16 md:w-[4vw] md:h-[4vw] bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 md:w-[2.5vw] md:h-[2.5vw] text-green-400" />
                      </div>
                    </div>
                    <h2 className="text-xl md:text-[1.5vw] font-semibold mb-4 text-center">Check Your Email</h2>
                    <p className="text-sm md:text-[0.9vw] text-gray-400 mb-6 text-center max-w-sm">
                      We've sent a password reset link to <span className="text-white font-medium">{formData.email}</span>
                    </p>
                    <div className="w-full max-w-sm md:w-[25vw] space-y-4">
                      <div className="bg-[#030804] border border-[#000000] rounded-lg p-4 space-y-2">
                        <p className="text-xs md:text-[0.8vw] text-gray-400">
                          ✓ Click the link in the email to reset your password
                        </p>
                        <p className="text-xs md:text-[0.8vw] text-gray-400">
                          ✓ The link will expire in 24 hours
                        </p>
                        <p className="text-xs md:text-[0.8vw] text-gray-400">
                          ✓ Check your spam folder if you don't see it
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowResetPassword(false);
                          setResetStep('email');
                          setFormData(prev => ({ ...prev, email: '' }));
                        }}
                        className="w-full bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-lg py-3 text-base md:text-[1vw] font-semibold text-white transition-all duration-200"
                      >
                        Back to Login
                      </button>
                      <button 
                        type="button"
                        onClick={() => setResetStep('email')}
                        className="w-full text-[#3DFF88] text-sm md:text-[0.9vw] hover:underline"
                      >
                        Didn't receive the email? Try again
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Example usage component
export default function App() {
  const auth = AuthenticationManager();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white mb-4">Authentication Demo</h1>
        
        {auth.user ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
            <div className="text-white">
              <p className="text-2xl font-semibold mb-2">Welcome, {auth.user.firstName}!</p>
              <p className="text-gray-300">{auth.user.email}</p>
            </div>
            <button
              onClick={auth.handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => auth.setIsAuthModalOpen(true)}
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Sign In / Register
          </button>
        )}

        <div className="text-gray-400 text-sm mt-8">
          <p>Click the button to test the authentication flow</p>
        </div>
      </div>

      <AuthModal
        isOpen={auth.isAuthModalOpen}
        onClose={() => auth.setIsAuthModalOpen(false)}
        setUser={auth.setUser}
      />
    </div>
  );
}