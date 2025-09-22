import { motion } from "framer-motion";
import { Twitter, Youtube, Music2, MessageCircle, CreditCard, ShoppingBag } from "lucide-react";

const socialMediaIcons = [
  { icon: Twitter, name: "Twitter", href: "#" },
  { icon: Youtube, name: "YouTube", href: "#" },
  { icon: Music2, name: "TikTok", href: "#" },
  { icon: MessageCircle, name: "Discord", href: "#" },
];

const supportLinks = [
  { name: "Contact Us", href: "#" },
  { name: "FAQ", href: "#" },
  { name: "Trust Pilot", href: "#" },
];

const resourceLinks = [
  { name: "Blogs", href: "#" },
  { name: "Affiliates", href: "#" },
  { name: "Claim Order", href: "#" },
  { name: "Tutorial", href: "#" },
];

const legalLinks = [
  { name: "Terms Of Service", href: "#" },
  { name: "Privacy Policy", href: "#" },
  { name: "Refund Policy", href: "#" },
];

const paymentMethods = [
  { 
    name: "visa", 
    icon: CreditCard,
    color: "#1a1f71"
  },
  { 
    name: "amex", 
    icon: CreditCard,
    color: "#0055a4"
  },
  { 
    name: "mastercard", 
    icon: CreditCard,
    color: "#eb001b"
  },
  { 
    name: "paypal", 
    icon: ShoppingBag,
    color: "#003087"
  },
  { 
    name: "discover", 
    icon: CreditCard,
    color: "#ff6600"
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const linkHover = {
  scale: 1.05,
  x: 4,
  color: "#00ff88",
  transition: { duration: 0.2, ease: "easeOut" }
};

const buttonHover = {
  scale: 1.1,
  rotateZ: 5,
  transition: { duration: 0.2, ease: "easeOut" }
};

const paymentHover = {
  scale: 1.1,
  y: -2,
  transition: { duration: 0.2, ease: "easeOut" }
};

export const MainContentSection = (): JSX.Element => {
  return (
    <motion.footer 
      className="w-full bg-[#030a06] bg-opacity-90 py-8 px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Left Section - Logo and Info */}
          <motion.div 
            className="flex flex-col space-y-4"
            variants={itemVariants}
          >
            <motion.div 
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                className="w-32 h-auto object-contain"
                alt="Ro CART"
                src="/ro-cart-33-2.png"
              />
            </motion.div>

            <div className="space-y-3">
              <h3 className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm">
                Disclaimer
              </h3>

              <p className="[font-family:'Poppins',Helvetica] font-medium text-[#7b7b7b] text-sm leading-relaxed max-w-md">
                RoCart is not affiliated, endorsed by, or in any way associated
                with ROBLOX Corporation, Roblox.com, or any of its
                subsidiaries or affiliates.
              </p>

              <p className="[font-family:'Poppins',Helvetica] font-medium text-[#7b7b7b] text-xs">
                © 2025 Rocart All rights reserved.
              </p>
            </div>
          </motion.div>

          {/* Right Section - Links */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={itemVariants}
          >
            
            {/* Social Media Column */}
            <div className="flex flex-col space-y-3">
              <h4 className="[font-family:'Inter',Helvetica] font-semibold text-white text-sm">
                Social Media
              </h4>
              <nav className="flex flex-col space-y-2">
                {socialMediaIcons.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    className="[font-family:'Inter',Helvetica] font-normal text-[#999999] text-sm cursor-pointer"
                    whileHover={linkHover}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Support Column */}
            <div className="flex flex-col space-y-3">
              <h4 className="[font-family:'Inter',Helvetica] font-semibold text-white text-sm">
                Support
              </h4>
              <nav className="flex flex-col space-y-2">
                {supportLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    className="[font-family:'Inter',Helvetica] font-normal text-[#999999] text-sm cursor-pointer"
                    whileHover={linkHover}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Resources Column */}
            <div className="flex flex-col space-y-3">
              <h4 className="[font-family:'Inter',Helvetica] font-semibold text-white text-sm">
                Resources
              </h4>
              <nav className="flex flex-col space-y-2">
                {resourceLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    className="[font-family:'Inter',Helvetica] font-normal text-[#999999] text-sm cursor-pointer"
                    whileHover={linkHover}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Legal Column */}
            <div className="flex flex-col space-y-3">
              <h4 className="[font-family:'Inter',Helvetica] font-semibold text-white text-sm">
                Legal
              </h4>
              <nav className="flex flex-col space-y-2">
                {legalLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    className="[font-family:'Inter',Helvetica] font-normal text-[#999999] text-sm cursor-pointer"
                    whileHover={linkHover}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.name}
                  </motion.a>
                ))}
              </nav>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Social Media (left) + Payment Methods (right) */}
        <motion.div 
          className="flex items-center justify-between pt-6 border-t border-[#ffffff15]"
          variants={itemVariants}
        >
          {/* Social Media Icons (Left) */}
          <div className="flex space-x-3">
            {socialMediaIcons.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.a
                  key={index}
                  href={item.href}
                  className="w-8 h-8 bg-[#1a2f1e] rounded-full flex items-center justify-center text-[#9ca3af] hover:bg-[#00ff88] hover:text-black transition-colors cursor-pointer"
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.9 }}
                  title={item.name}
                >
                  <IconComponent size={16} />
                </motion.a>
              );
            })}
          </div>

          {/* Payment Methods (Right) */}
          <div className="flex items-center gap-3">
            {paymentMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <motion.div
                  key={index}
                  className="w-12 h-8 bg-white rounded-md flex items-center justify-center shadow-sm cursor-pointer relative overflow-hidden"
                  style={{ 
                    border: `2px solid ${method.color || '#e5e7eb'}`,
                    color: method.color || '#374151'
                  }}
                  whileHover={paymentHover}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Fallback icon */}
                  <IconComponent 
                    size={18} 
                    className="text-gray-600"
                  />
                  
                  {/* Image overlay - will show if image loads successfully */}
                  <img
                    src={`/cards/${method.name}.png`}
                    alt={method.name}
                    className="absolute inset-0 w-full h-full object-contain opacity-100 transition-opacity duration-200"
                    onError={(e) => {
                      // Hide image if it fails to load, icon will show instead
                      e.currentTarget.style.opacity = '0';
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};