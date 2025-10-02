import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Test account credentials (DEV ONLY - Remove in production)
const TEST_EMAIL = "dy3239073@gmail.com";
const TEST_PASSWORD = "TestPass123!";
const TEST_FIRSTNAME = "TestUser";

// AuthenticationManager hook for header usage
export function AuthenticationManager({ onUserChange }: { onUserChange?: (user: any) => void } = {}) {
  const [user, setUser] = useState<any>(() => {
    const stored = sessionStorage.getItem('customerData');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onUserChange) onUserChange(user);
  }, [user, onUserChange]);

  const handleSetUser = (u: any) => {
    setUser(u);
    if (u) sessionStorage.setItem('customerData', JSON.stringify(u));
    else sessionStorage.removeItem('customerData');
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('customerData');
    sessionStorage.removeItem('shopifyCustomerToken');
    sessionStorage.removeItem('shopifyTokenExpiry');
    setIsUserMenuOpen(false);
    setIsAuthModalOpen(false);
  };

  return {
    user,
    setUser: handleSetUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isUserMenuOpen,
    setIsUserMenuOpen,
    userMenuRef,
    handleLogout,
    handleSetUser,
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
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestAccountReady, setIsTestAccountReady] = useState(false); // New: Track test account status
  const [formData, setFormData] = useState({
    username: TEST_FIRSTNAME, // Auto-fill for test
    email: TEST_EMAIL, // Auto-fill for test
    password: TEST_PASSWORD, // Auto-fill for test
    confirmPassword: TEST_PASSWORD, // Auto-fill for test
    referralCode: '',
    agreeToTerms: true // Auto-agree for test
  });

  // Shopify Config (from parent or env)
  const SHOPIFY_DOMAIN = (import.meta as any).env.VITE_SHOPIFY_DOMAIN;
  const STOREFRONT_TOKEN = (import.meta as any).env.VITE_SHOPIFY_STOREFRONT_TOKEN;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const fetchCustomerData = async (token: string) => {
    const customerQuery = `
      query getCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          firstName
          lastName
          email
          phone
          addresses(first: 10) {
            edges {
              node {
                address1
                city
                country
                zip
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: customerQuery,
          variables: { customerAccessToken: token },
        }),
      });

      const data = await response.json();
      if (data.data?.customer) {
        sessionStorage.setItem('customerData', JSON.stringify(data.data.customer));
        return data.data.customer;
      }
      return null;
    } catch (error) {
      console.error('Error fetching customer data:', error);
      return null;
    }
  };

  // New: Auto-create test account if not exists (DEV ONLY)
  const createTestAccountIfNeeded = async () => {
    if (localStorage.getItem('testAccountCreated')) return; // Skip if already done

    setIsLoading(true);
    try {
      const registerMutation = `
        mutation customerCreate($input: CustomerCreateInput!) {
          customerCreate(input: $input) {
            customer {
              id
              email
              firstName
            }
            customerUserErrors {
              code
              field
              message
            }
          }
        }
      `;

      const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: registerMutation,
          variables: {
            input: {
              email: TEST_EMAIL,
              password: TEST_PASSWORD,
              firstName: TEST_FIRSTNAME,
              acceptsMarketing: false,
            },
          },
        }),
      });

      const data = await response.json();
      const errors = data.data?.customerCreate?.customerUserErrors || [];

      if (data.data?.customerCreate?.customer) {
        console.log('Test account created successfully!');
        localStorage.setItem('testAccountCreated', 'true');
        setIsTestAccountReady(true);
        alert(`Test account created! Use email: ${TEST_EMAIL} and password: ${TEST_PASSWORD} to login.`);
  } else if (errors.some((err: { message: string }) => err.message.includes('already exists'))) {
        // Account exists - ready for login
        console.log('Test account already exists.');
        localStorage.setItem('testAccountCreated', 'true');
        setIsTestAccountReady(true);
        alert(`Test account ready! Use email: ${TEST_EMAIL} and password: ${TEST_PASSWORD} to login.`);
      } else {
        console.error('Test account creation failed:', errors);
        alert(`Test setup issue: ${errors[0]?.message || 'Please create manually in Shopify admin.'}`);
      }
    } catch (error) {
      console.error('Test account setup error:', error);
      alert('Test setup failed. Check console and Shopify admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin && formData.email === TEST_EMAIL) {
      // Auto-fill password for test login convenience (optional - remove if unwanted)
      setFormData(prev => ({ ...prev, password: TEST_PASSWORD }));
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const loginMutation = `
          mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
            customerAccessTokenCreate(input: $input) {
              customerAccessToken {
                accessToken
                expiresAt
              }
              customerUserErrors {
                code
                field
                message
              }
            }
          }
        `;

        const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
          },
          body: JSON.stringify({
            query: loginMutation,
            variables: {
              input: {
                email: formData.email,
                password: formData.password,
              },
            },
          }),
        });

        const data = await response.json();
        const errors = data.data?.customerAccessTokenCreate?.customerUserErrors || [];

        if (data.data?.customerAccessTokenCreate?.customerAccessToken) {
          const token = data.data.customerAccessTokenCreate.customerAccessToken.accessToken;
          const expiresAt = data.data.customerAccessTokenCreate.customerAccessToken.expiresAt;
          
          // Check/refresh expiry (simple: if <1hr, warn but proceed)
          if (new Date(expiresAt) < new Date(Date.now() + 60 * 60 * 1000)) {
            console.warn('Token expires soon - consider refresh in prod.');
          }
          
          sessionStorage.setItem('shopifyCustomerToken', token);
          sessionStorage.setItem('shopifyTokenExpiry', expiresAt);
          
          const customerData = await fetchCustomerData(token);
          if (customerData) {
            setUser(customerData);
            onClose();
            alert('Login successful! You can now checkout.');
          }
        } else {
          alert(errors[0]?.message || 'Login failed. For test: Email=dy3239073@gmail.com, Pass=TestPass123!');
        }
      } else {
        // Register (non-test emails can register normally)
        const registerMutation = `
          mutation customerCreate($input: CustomerCreateInput!) {
            customerCreate(input: $input) {
              customer {
                id
                email
                firstName
              }
              customerUserErrors {
                code
                field
                message
              }
            }
          }
        `;

        const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
          },
          body: JSON.stringify({
            query: registerMutation,
            variables: {
              input: {
                email: formData.email,
                password: formData.password,
                firstName: formData.username,
                acceptsMarketing: formData.agreeToTerms,
              },
            },
          }),
        });

        const data = await response.json();
        const errors = data.data?.customerCreate?.customerUserErrors || [];

        if (data.data?.customerCreate?.customer) {
          alert('Registration successful! Please log in.');
          setIsLogin(true);
          setFormData({ ...formData, password: '', confirmPassword: '' }); // Clear sensitive fields
        } else {
          if (errors.some((err: { message: string }) => err.message.includes('already exists'))) {
            alert('Account exists! Switch to login.');
            setIsLogin(true);
          } else {
            alert(errors[0]?.message || 'Registration failed. Try again.');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Network error. Check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-setup test account on modal open
  useEffect(() => {
    if (isOpen) {
      createTestAccountIfNeeded();
      // Auto-fill for test email
      if (!formData.email) {
        setFormData({
          username: TEST_FIRSTNAME,
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          confirmPassword: TEST_PASSWORD,
          referralCode: '',
          agreeToTerms: true
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if ((window as any).google && isOpen) {
      (window as any).google.accounts.id.initialize({
        client_id: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID,
        callback: (response: unknown) => {
          // You can add more type safety here if you use Google types
          console.log('Google auth:', response);
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
          {/* Left side (unchanged) */}
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

            {/* Test Account Banner (New) */}
            {isTestAccountReady && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-3 rounded-lg mb-4 text-sm text-center">
                🚀 Test Mode: Use <strong>{TEST_EMAIL}</strong> / <strong>{TEST_PASSWORD}</strong> for instant login & checkout!
              </div>
            )}

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
                      className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" 
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
                      className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" 
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
                        className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" 
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
                        className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" 
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
                      className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" 
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
                      className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" 
                      placeholder="Enter your email or username" 
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
                        className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" 
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
                    onClick={() => alert(`Test reset: Email=${TEST_EMAIL}, Pass=${TEST_PASSWORD}. If issues, delete in Shopify admin.`)}
                  >
                    Forgot your password? (Test Reset)
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};