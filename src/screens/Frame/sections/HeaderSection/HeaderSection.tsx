import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, Eye, EyeOff, Menu, X, LogOut } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ReactCountryFlag from "react-country-flag";

// Extend the Window interface to include the google property
declare global {
  interface Window {
    google?: any;
  }
}

// Currency mapping
const currencyMap: Record<string, string> = {
  US: "USD",
  IN: "INR",
  GB: "GBP",
  EU: "EUR",
  JP: "JPY",
};
// const domain: string = (import.meta as any).env.VITE_SHOPIFY_DOMAIN;
// const token: string = (import.meta as any).env.VITE_SHOPIFY_STOREFRONT_TOKEN;
// Shopify Configuration
const SHOPIFY_DOMAIN: string = (import.meta as any).env.VITE_SHOPIFY_DOMAIN;
const STOREFRONT_TOKEN: string = (import.meta as any).env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const GOOGLE_CLIENT_ID: string = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;

// =======================
// Login/Register Modal with Shopify Integration
// =======================
const AuthModal = ({ isOpen, onClose, setUser }: { isOpen: boolean; onClose: () => void; setUser: (user: any) => void }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeToTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Shopify Customer Login
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

        const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
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

        if (data.data?.customerAccessTokenCreate?.customerAccessToken) {
          const token = data.data.customerAccessTokenCreate.customerAccessToken.accessToken;
          const expiresAt = data.data.customerAccessTokenCreate.customerAccessToken.expiresAt;
          
          sessionStorage.setItem('shopifyCustomerToken', token);
          sessionStorage.setItem('shopifyTokenExpiry', expiresAt);
          
          const customerData = await fetchCustomerData(token);
          if (customerData) {
            setUser(customerData);
          }
          
          onClose();
        } else {
          const errors = data.data?.customerAccessTokenCreate?.customerUserErrors || [];
          alert(errors[0]?.message || 'Login failed. Please check your credentials.');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          setIsLoading(false);
          return;
        }

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

        const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
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
                acceptsMarketing: false,
              },
            },
          }),
        });

        const data = await response.json();

        if (data.data?.customerCreate?.customer) {
          alert('Registration successful! Please log in.');
          setIsLogin(true);
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            referralCode: '',
            agreeToTerms: false
          });
        } else {
          const errors = data.data?.customerCreate?.customerUserErrors || [];
          alert(errors[0]?.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (credential: string) => {
    setIsLoading(true);
    try {
      // Verify Google token
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${credential}` }
      });
      const userData = await response.json();

      // Attempt Shopify registration
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

      const registerResponse = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: registerMutation,
          variables: {
            input: {
              email: userData.email,
              firstName: userData.given_name,
              lastName: userData.family_name,
              acceptsMarketing: false,
            },
          },
        }),
      });

      const registerData = await registerResponse.json();
      if (registerData.data?.customerCreate?.customer) {
        // Registration successful, proceed to login
        await handleGoogleLogin(userData.email);
      } else {
        const errors = registerData.data?.customerCreate?.customerUserErrors || [];
        if (errors.some((err: any) => err.code === 'TAKEN')) {
          await handleGoogleLogin(userData.email);
        } else {
          alert(errors[0]?.message || 'Google registration failed.');
        }
      }
    } catch (error) {
      console.error('Google auth error:', error);
      alert('Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (email: string) => {
    try {
      // Note: Shopify doesn't store Google passwords, so we need a multipass or temporary token approach
      // This is a simplified version assuming a backend handles the multipass
      const loginMutation = `
        mutation customerAccessTokenCreateWithMultipass($multipassToken: String!) {
          customerAccessTokenCreateWithMultipass(multipassToken: $multipassToken) {
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

      // This requires a backend to generate a multipass token
      const multipassResponse = await fetch('/api/multipass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const { multipassToken } = await multipassResponse.json();

      const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: loginMutation,
          variables: { multipassToken },
        }),
      });

      const data = await response.json();
      if (data.data?.customerAccessTokenCreateWithMultipass?.customerAccessToken) {
        const token = data.data.customerAccessTokenCreateWithMultipass.customerAccessToken.accessToken;
        const expiresAt = data.data.customerAccessTokenCreateWithMultipass.customerAccessToken.expiresAt;
        
        sessionStorage.setItem('shopifyCustomerToken', token);
        sessionStorage.setItem('shopifyTokenExpiry', expiresAt);
        
        const customerData = await fetchCustomerData(token);
        if (customerData) {
          setUser(customerData);
        }
        
        onClose();
      } else {
        alert('Google login failed. Please try manual login.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed.');
    }
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
        }
      }
    `;

    try {
      const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: customerQuery,
          variables: {
            customerAccessToken: token,
          },
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

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => handleGoogleAuth(response.credential),
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { theme: 'outline', size: 'large', width: 300 }
      );
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0C1610] rounded-xl w-full max-w-4xl h-full max-h-[85vh] shadow-xl text-white flex overflow-hidden relative md:w-[60vw] md:h-[85vh]">
            <div className="hidden md:flex w-[55%] relative overflow-hidden flex-col justify-between bg-[url('/loginbg/logbg.png')] bg-cover bg-center">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%239C92AC\" fill-opacity=\"0.1\"><circle cx=\"30\" cy=\"30\" r=\"4\"/></g></g></svg>')", backgroundRepeat: "repeat" }} />
              <div className="relative z-10 text-center pt-[8vh]">
                <img className="w-[12vw] h-auto mx-auto" alt="Ro CART" src="/ro-cart-33-2.png" />
              </div>
              <div className="relative z-10 text-center px-[2vw] pb-[2vh]">
                <span className="text-[0.9vw] text-white leading-tight">By accessing the site, I attest that I am at least 18 years old and have read the Terms and Conditions</span>
              </div>
            </div>
            <div className="w-full md:w-[55%] p-4 md:p-[2vw] flex flex-col relative">
              <button type="button" onClick={onClose} className="absolute top-4 right-4 md:top-[1vw] md:right-[1vw] text-gray-400 hover:text-white text-2xl md:text-[1vw] p-3 md:p-[0.5vw] rounded-full hover:bg-gray-800 transition-colors z-10">
                <X className="w-8 h-8 md:w-[1.5vw] md:h-[1.5vw]" />
              </button>
              <div className="md:hidden text-center mb-6 mt-2">
                <img className="w-32 h-auto mx-auto" alt="Ro CART" src="/ro-cart-33-2.png" />
              </div>
              <div className="flex justify-center mb-4 mt-1 w-full max-w-sm md:max-w-[25vw] mx-auto">
                <button onClick={() => setIsLogin(false)} className={`flex-1 text-center px-6 py-2 text-lg md:text-[1.5vw] font-semibold transition-colors border-b-2 md:border-b-[0.5vh] ${!isLogin ? 'text-[#eff0ef] border-white border-b-4' : 'text-gray-400 border-gray-600 hover:text-white'}`}>Register</button>
                <button onClick={() => setIsLogin(true)} className={`flex-1 text-center px-6 py-2 text-lg md:text-[1.5vw] font-semibold transition-colors border-b-2 md:border-b-[0.5vh] ${isLogin ? 'text-white border-white border-b-4' : 'text-gray-400 border-gray-600 hover:text-white'}`}>Login</button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                <style>{`form::-webkit-scrollbar { display: none; }`}</style>
                {!isLogin ? (
                  <div className="flex flex-col items-center space-y-4 md:space-y-[1.5vh]">
                    <div className="w-full max-w-sm md:w-[25vw]">
                      <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Username*</label>
                      <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" placeholder="Enter Username" required />
                    </div>
                    <div className="w-full max-w-sm md:w-[25vw]">
                      <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Email*</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" placeholder="Enter Email" required />
                    </div>
                    <div className="w-full max-w-sm md:w-[25vw]">
                      <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Password*</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" placeholder="Enter Password" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                          {showPassword ? <EyeOff size={20} className="md:w-[1.5vw] md:h-[1.5vw]" /> : <Eye size={20} className="md:w-[1.5vw] md:h-[1.5vw]" />}
                        </button>
                      </div>
                    </div>
                    <div className="w-full max-w-sm md:w-[25vw]">
                      <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Confirm Password*</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" placeholder="Confirm Password" required />
                      </div>
                    </div>
                    <div className="w-full max-w-sm md:w-[25vw]">
                      <label className="flex items-start gap-2 md:gap-[0.5vw] cursor-pointer">
                        <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} className="mt-1 w-4 h-4 md:w-[1vw] md:h-[1vw] accent-[#3DFF88]" required />
                        <span className="text-sm md:text-[0.9vw] text-gray-300 leading-relaxed">I agree to the <span className="text-[#ffffff] hover:underline cursor-pointer">Terms and Conditions</span> and <span className="text-[#ffffff] hover:underline cursor-pointer">Privacy Policy</span>.</span>
                      </label>
                    </div>
                    <div className="w-full max-w-sm md:w-[25vw]">
                      <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Referral Code (Optional)</label>
                      <input type="text" name="referralCode" value={formData.referralCode} onChange={handleInputChange} className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" placeholder="Enter Code" />
                    </div>
                    <button type="submit" disabled={isLoading || !formData.agreeToTerms} className="w-full max-w-sm md:w-[25vw] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 md:py-[1.5vh] text-base md:text-[1vw] font-semibold text-white transition-all duration-200">{isLoading ? "Creating Account..." : "Register"}</button>
                    <span className="text-gray-400 text-sm md:text-[0.9vw]">or continue with</span>
                    <div id="googleSignInButton" className="w-full max-w-sm md:w-[25vw]"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4 md:space-y-[1.5vh]">
                    <div className="w-full max-w-sm md:w-[25vw]">
                      <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Email or Username*</label>
                      <input type="text" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" placeholder="Enter your email or username" required />
                    </div>
                    <div className="w-full max-w-sm md:w-[25vw]">
                      <label className="block text-sm md:text-[0.9vw] text-white mb-2 md:mb-[0.5vh]">Password*</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-[#030804] border border-[#000000] rounded-lg md:rounded-[0.5vw] px-4 py-3 md:px-[1vw] md:py-[1vh] text-sm md:text-[0.9vw] text-white placeholder-gray-500 focus:border-[#000000] focus:outline-none" placeholder="Enter your password" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                          {showPassword ? <EyeOff size={20} className="md:w-[1.5vw] md:h-[1.5vw]" /> : <Eye size={20} className="md:w-[1.5vw] md:h-[1.5vw]" />}
                        </button>
                      </div>
                    </div>
                    <button type="button" className="text-[#3DFF88] text-sm md:text-[0.9vw] hover:underline">Forgot your password?</button>
                    <button type="submit" disabled={isLoading} className="w-full max-w-sm md:w-[25vw] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-3 md:py-[1.5vh] text-base md:text-[1vw] font-semibold text-white transition-all duration-200">{isLoading ? "Signing In..." : "Sign In"}</button>
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
      )}
    </AnimatePresence>
  );
};

// =======================
// Language & Currency Modal 
// =======================
const LanguageModal = ({
  isOpen,
  onClose,
  country,
  setCountry,
  currency,
  setCurrency,
}: {
  isOpen: boolean;
  onClose: () => void;
  country: string;
  setCountry: (c: string) => void;
  currency: string;
  setCurrency: (c: string) => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111] rounded-xl p-6 w-full max-w-sm md:w-[22vw] md:p-[1.5vw] shadow-xl text-white">
            <h2 className="text-lg md:text-[1.2vw] font-semibold mb-4 md:mb-[1vh]">Language & Currency</h2>
            <div className="mb-4 md:mb-[0.8vh] flex items-center gap-2 md:gap-[0.5vw]">
              <p className="text-sm md:text-[0.9vw] text-gray-400">Current Country:</p>
              <ReactCountryFlag countryCode={country} svg style={{ width: "20px", height: "20px" }} title={country} className="md:w-[1.2vw] md:h-[1.2vw]" />
              <p className="text-base md:text-[1vw] font-medium">{country}</p>
            </div>
            <div className="mb-4 md:mb-[1vh]">
              <label className="text-sm md:text-[0.9vw] text-gray-400 block mb-2 md:mb-[0.3vh]">Change Country</label>
              <select className="w-full bg-[#222] p-3 md:p-[0.5vw] rounded-md text-white text-sm md:text-[0.9vw]" value={country} onChange={(e) => {
                const newCountry = e.target.value;
                const newCurrency = currencyMap[newCountry] || "USD";
                setCountry(newCountry);
                setCurrency(newCurrency);
                sessionStorage.setItem('userCountry', newCountry);
                sessionStorage.setItem('userCurrency', newCurrency);
                window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { country: newCountry, currency: newCurrency } }));
              }}>
                <option value="US">United States</option>
                <option value="IN">India</option>
                <option value="GB">United Kingdom</option>
                <option value="EU">Europe</option>
                <option value="JP">Japan</option>
              </select>
            </div>
            <div className="mb-6 md:mb-[1.5vh]">
              <p className="text-sm md:text-[0.9vw] text-gray-400">Currency</p>
              <p className="text-base md:text-[1vw] font-medium">{currency}</p>
            </div>
            <button onClick={onClose} className="w-full py-3 md:py-[0.5vh] rounded-md bg-green-600 hover:bg-green-700 font-semibold text-sm md:text-[0.9vw]">Confirm</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =======================
// Mobile Menu Component
// =======================
const MobileMenu = ({
  isOpen,
  onClose,
  games,
  selectedGame,
  onGameSelect,
  onLanguageClick,
  country,
  currency,
  user,
  handleLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  games: any[];
  selectedGame: any;
  onGameSelect: (game: any) => void;
  onLanguageClick: () => void;
  country: string;
  currency: string;
  user: any;
  handleLogout: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 md:hidden">
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="bg-[#0C1610] w-80 h-full shadow-xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-xl font-semibold">Menu</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <h3 className="text-white text-lg font-medium mb-4">Select Game</h3>
              <div className="space-y-3">
                {games.map((game) => (
                  <button key={game.id} onClick={() => { onGameSelect(game); onClose(); }} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${selectedGame.name === game.name ? 'bg-[#3DFF88]/20 border border-[#3DFF88]' : 'bg-[#142b16] hover:bg-[#2a2a2a]'}`}>
                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                      <img src={game.icon} alt={game.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white font-medium text-left">{game.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <button onClick={() => { onLanguageClick(); onClose(); }} className="flex items-center justify-between w-full p-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <ReactCountryFlag countryCode={country} svg style={{ width: "24px", height: "24px" }} title={country} />
                  <div className="text-left">
                    <div className="text-white font-medium">Language & Currency</div>
                    <div className="text-gray-400 text-sm">English/{currency}</div>
                  </div>
                </div>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {user && (
              <div className="mb-6">
                <button onClick={() => { handleLogout(); onClose(); }} className="flex items-center justify-between w-full p-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-6 h-6 text-white" />
                    <div className="text-left">
                      <div className="text-white font-medium">Logout</div>
                      <div className="text-gray-400 text-sm">{user.firstName}</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </motion.div>
          <div className="absolute inset-0 -z-10" onClick={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =======================
// Main Header Section with Auto-Detection & Persistence
// =======================
const HeaderSection = (): JSX.Element => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");
  const [user, setUser] = useState<any>(null);

  const [selectedGame, setSelectedGame] = useState<{
    subtitle?: string;
    name: string;
    bgImage?: string;
    bgColor?: string;
    useIcon?: boolean;
  }>({
    name: "Select Game",
    subtitle: "🎮",
    useIcon: true,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const games = [
    { id: 1, name: "Murder Mystery 2", subtitle: "🔪", icon: "/game/murder.png" },
    { id: 2, name: "Grow A Garden", subtitle: "🌱", icon: "/game/garden.png" },
    { id: 3, name: "Steal A Brainrot", subtitle: "💎", icon: "/logo/steal.png" },
    { id: 4, name: "Adopt Me!", subtitle: "🐾", icon: "/logo/adopt.png" },
    { id: 5, name: "Blade Ball", subtitle: "⚔️", icon: "/logo/blade.png" },
    { id: 6, name: "Blox Fruits", subtitle: "🍍", icon: "/logo/blox.png", useIcon: true },
    { id: 7, name: "99 Nights In The Forest", subtitle: "🌲", icon: "/logo/99.png" },
    { id: 8, name: "Anime Vanguards", subtitle: "🔥", icon: "/logo/anime.png" },
    { id: 9, name: "Dress To Impress", subtitle: "👗", icon: "/logo/impress.png" },
    { id: 10, name: "Garden Tower Defense", subtitle: "🛡️", icon: "/logo/tower.png" },
  ];

  const handleGameSelect = (game: any) => {
    setSelectedGame(game);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('shopifyCustomerToken');
      if (token) {
        const revokeTokenMutation = `
          mutation customerAccessTokenDelete($customerAccessToken: String!) {
            customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
              deletedAccessToken
              userErrors {
                field
                message
              }
            }
          }
        `;

        await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
          },
          body: JSON.stringify({
            query: revokeTokenMutation,
            variables: {
              customerAccessToken: token,
            },
          }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('shopifyCustomerToken');
      sessionStorage.removeItem('shopifyTokenExpiry');
      sessionStorage.removeItem('customerData');
      setUser(null);
      setIsUserMenuOpen(false);
    }
  };

  useEffect(() => {
    const storedCustomerData = sessionStorage.getItem('customerData');
    if (storedCustomerData) {
      setUser(JSON.parse(storedCustomerData));
    }

    const detectAndSetCurrency = async () => {
      const storedCountry = sessionStorage.getItem('userCountry');
      const storedCurrency = sessionStorage.getItem('userCurrency');

      if (storedCountry && storedCurrency) {
        setCountry(storedCountry);
        setCurrency(storedCurrency);
        return;
      }

      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const detectedCountry = (data.country_code || "").toUpperCase();
        
        if (detectedCountry && currencyMap[detectedCountry]) {
          const detectedCurrency = currencyMap[detectedCountry];
          setCountry(detectedCountry);
          setCurrency(detectedCurrency);
          sessionStorage.setItem('userCountry', detectedCountry);
          sessionStorage.setItem('userCurrency', detectedCurrency);
          window.dispatchEvent(new CustomEvent('currencyChanged', { 
            detail: { country: detectedCountry, currency: detectedCurrency } 
          }));
        } else {
          const userLang = navigator.language || "en-US";
          const fallbackCountry = userLang.split("-")[1]?.toUpperCase() || "US";
          const fallbackCurrency = currencyMap[fallbackCountry] || "USD";
          setCountry(fallbackCountry);
          setCurrency(fallbackCurrency);
          sessionStorage.setItem('userCountry', fallbackCountry);
          sessionStorage.setItem('userCurrency', fallbackCurrency);
          window.dispatchEvent(new CustomEvent('currencyChanged', { 
            detail: { country: fallbackCountry, currency: fallbackCurrency } 
          }));
        }
      } catch (error) {
        console.error("Error detecting location:", error);
        setCountry("US");
        setCurrency("USD");
        sessionStorage.setItem('userCountry', "US");
        sessionStorage.setItem('userCurrency', "USD");
      }
    };

    detectAndSetCurrency();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <header className="w-full h-16 md:h-[10vh] flex items-center justify-between px-4 md:px-[2vw] bg-[#0C1610] relative">
        <div className="md:hidden flex items-center justify-between w-full">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[#3DFF87] p-2 bg-[url('/icon/header.png')] bg-cover bg-center hover:bg-gray-800 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <img className="h-10 object-cover" alt="Ro CART" src="/ro-cart-33-2.png" />
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-[url(/icon/person.png)] bg-cover bg-center" />
                  <span className="text-white font-semibold">{user.firstName}</span>
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-40 bg-[#0C1610] rounded-lg shadow-lg p-2 z-50">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-white hover:bg-[#2a2a2a] rounded flex items-center gap-2">
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="w-5 h-5 bg-[url(/icon/person.png)] bg-cover bg-center" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between w-full">
          <div className="flex items-center gap-[2vw] relative" ref={dropdownRef}>
            <a href="/">
              <img className="w-auto h-[5vh] object-cover cursor-pointer" alt="Ro CART" src="/ro-cart-33-2.png" />
            </a>

            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-auto h-[6vh] rounded-[0.7vw] flex items-center relative overflow-hidden bg-center transition-colors`} style={{ backgroundImage: selectedGame.bgImage ? `url(${selectedGame.bgImage})` : undefined, backgroundSize: selectedGame.bgImage ? "contain" : undefined, backgroundRepeat: selectedGame.bgImage ? "no-repeat" : undefined }}>
                {!selectedGame.bgImage && <div className="absolute inset-0 bg-[#0f0f0f]" />}
                {selectedGame.bgImage && <div className="absolute inset-0 bg-black/40" />}
                <div className="ml-[1vw] w-[1.5vw] h-[1.5vw] flex items-center justify-center relative z-10">
                  {selectedGame.useIcon ? <img src="/icon/gamepad.png" alt="Gamepad" className="w-[4vw] h-[2vw] object-contain" /> : selectedGame.subtitle || "🎮"}
                </div>
                <div className="ml-[0.8vw] flex-1 flex items-center gap-[0.5vw] relative z-10">
                  <span className="font-poppins font-bold text-white text-[1vw] leading-tight">{selectedGame.name}</span>
                  <ChevronDownIcon className={`w-[1vw] h-[1vw] text-white mr-[1vw] transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : ""}`} />
                </div>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div initial="hidden" animate="show" exit="hidden" variants={containerVariants} className="absolute top-[6vh] left-0 w-[16vw] rounded-xl shadow-lg z-50 bg-[#0C1610] p-[0.5vw] h-auto overflow-y-auto">
                    <div className="flex flex-col">
                      {games.map((game) => (
                        <motion.button key={game.id} onClick={() => handleGameSelect(game)} variants={itemVariants} whileHover={{ scale: 1.02 }} className="relative flex items-center gap-[0.8vw] w-full px-[0.8vw] py-[3vh] h-[3vh] text-left bg-cover bg-center rounded-lg">
                          <div className="absolute inset-0 rounded-lg" />
                          <div className="w-[2vw] h-[2vw] rounded-md overflow-hidden flex-shrink-0 relative z-10">
                            <img src={game.icon} alt={game.name} className="w-full h-full object-cover rounded-md" />
                          </div>
                          <span className="flex flex-col text-white font-medium text-[0.9vw] relative z-10 leading-tight">
                            <span className="truncate">{game.name}</span>
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-[1.5vw]">
            <div onClick={() => setIsLangModalOpen(true)} className="cursor-pointer w-auto h-[5vh] bg-[linear-gradient(87deg,rgba(15,15,15,1)_0%,rgba(13,13,13,1)_100%)] rounded-[0.7vw] flex items-center">
              <ReactCountryFlag countryCode={country} svg style={{ width: "2vw", height: "2vw", marginLeft: "1vw" }} title={country} />
              <div className="ml-[0.5vw] flex-1 flex items-center gap-[0.5vw] justify-between">
                <span className="font-poppins font-semibold text-white text-[0.9vw] leading-tight">English/{currency}</span>
                <ChevronDownIcon className="w-[0.8vw] h-[0.8vw] text-white mr-[1vw]" />
              </div>
            </div>

            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <Button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-[8vw] h-[5vh] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-[0.7vw] border-0 p-0 flex items-center justify-center gap-[0.5vw]">
                    <div className="w-[1.2vw] h-[1.2vw] bg-[url(/icon/person.png)] bg-cover" />
                    <span className="font-poppins font-semibold text-white text-[0.9vw] leading-tight whitespace-nowrap">{user.firstName}</span>
                  </Button>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-40 bg-[#0C1610] rounded-lg shadow-lg p-2 z-50">
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-white hover:bg-[#2a2a2a] rounded flex items-center gap-2">
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Button onClick={() => setIsAuthModalOpen(true)} className="w-[6vw] h-[5vh] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-[0.7vw] border-0 p-0 flex items-center justify-center gap-[0.5vw]">
                  <div className="w-[1.2vw] h-[1.2vw] bg-[url(/icon/person.png)] bg-cover" />
                  <span className="font-poppins font-semibold text-white text-[0.9vw] leading-tight whitespace-nowrap">Log in</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        games={games} 
        selectedGame={selectedGame} 
        onGameSelect={handleGameSelect} 
        onLanguageClick={() => setIsLangModalOpen(true)} 
        country={country} 
        currency={currency} 
        user={user}
        handleLogout={handleLogout}
      />
      <LanguageModal 
        isOpen={isLangModalOpen} 
        onClose={() => setIsLangModalOpen(false)} 
        country={country} 
        setCountry={setCountry} 
        currency={currency} 
        setCurrency={setCurrency} 
      />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        setUser={setUser}
      />
    </>
  );
};

export default HeaderSection;