import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, Menu, X, LogOut } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ReactCountryFlag from "react-country-flag";
import { AuthenticationManager, AuthModal } from "../../../../components/auth";

// Interfaces for type safety
interface Game {
  id: number;
  name: string;
  subtitle: string;
  icon: string;
  route: string;
  useIcon?: boolean;
  bgImage?: string;
}

interface User {
  firstName: string;
  email: string;
  id: string;
  lastName?: string;
  phone?: string;
  addresses?: { edges: { node: { address1: string; city: string; country: string; zip: string } }[] };
}

// Currency mapping
const currencyMap: Record<string, string> = {
  US: "USD",
  IN: "INR",
  GB: "GBP",
  EU: "EUR",
  JP: "JPY",
};

// =======================
// GAME SELECTOR COMPONENT
// =======================
export const GameSelector = ({
  onGameSelect
}: {
  onGameSelect?: (game: Game) => void
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game>({
    name: "Select Game",
    subtitle: "🎮",
    useIcon: true,
    id: 0,
    icon: "/icon/gamepad.png",
    route: "/"
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  const games: Game[] = [
    { id: 1, name: "Murder Mystery 2", subtitle: "🔪", icon: "/game/murder.png", route: "/MurderMystery2" },
    { id: 2, name: "Grow A Garden", subtitle: "🌱", icon: "/game/garden.png", route: "/GrowAGarden" },
    { id: 3, name: "Steal A Brainrot", subtitle: "💎", icon: "/logo/steal.png", route: "/StealABrainrot" },
    { id: 4, name: "Adopt Me!", subtitle: "🐾", icon: "/logo/adopt.png", route: "/AdoptMe" },
    { id: 5, name: "Blade Ball", subtitle: "⚔️", icon: "/logo/blade.png", route: "/BladeBall" },
    { id: 6, name: "Blox Fruits", subtitle: "🍍", icon: "/logo/blox.png", useIcon: true, route: "/BloxFruits" },
    { id: 7, name: "99 Nights In The Forest", subtitle: "🌲", icon: "/logo/99.png", route: "/NinetyNineNights" },
    { id: 8, name: "Anime Vanguards", subtitle: "🔥", icon: "/logo/anime.png", route: "/AnimeVanguards" },
    { id: 9, name: "Dress To Impress", subtitle: "👗", icon: "/logo/impress.png", route: "/DressToImpress" },
  ];

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setIsDropdownOpen(false);
    if (onGameSelect) {
      onGameSelect(game);
    }
    if (game.route) {
      window.location.href = game.route;
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
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
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
        className={`w-auto h-[6vh] rounded-[0.7vw] flex items-center relative overflow-hidden bg-center transition-colors`} 
        style={{ 
          backgroundImage: selectedGame.bgImage ? `url(${selectedGame.bgImage})` : undefined, 
          backgroundSize: selectedGame.bgImage ? "contain" : undefined, 
          backgroundRepeat: selectedGame.bgImage ? "no-repeat" : undefined 
        }}
      >
        {!selectedGame.bgImage && <div className="absolute inset-0 bg-[#0f0f0f]" />}
        {selectedGame.bgImage && <div className="absolute inset-0 bg-black/40" />}
        <div className="ml-[1vw] w-[1.5vw] h-[1.5vw] flex items-center justify-center relative z-10">
          {selectedGame.useIcon ? 
            <img src={selectedGame.icon} alt="Gamepad" className="w-[4vw] h-[2vw] object-contain" /> : 
            selectedGame.subtitle
          }
        </div>
        <div className="ml-[0.8vw] flex-1 flex items-center gap-[0.5vw] relative z-10">
          <span className="font-poppins font-bold text-white text-[1vw] leading-tight">{selectedGame.name}</span>
          <ChevronDownIcon className={`w-[2vw] h-[2vw] text-white mr-[1vw] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div 
            initial="hidden" 
            animate="show" 
            exit="hidden" 
            variants={containerVariants} 
            className="absolute top-[6vh] left-0 w-[16vw] rounded-xl shadow-lg z-50 bg-[#0C1610] p-[0.5vw] h-auto overflow-y-auto"
          >
            <div className="flex flex-col">
              {games.map((game) => (
                <motion.button 
                  key={game.id} 
                  onClick={() => handleGameSelect(game)} 
                  variants={itemVariants} 
                  whileHover={{ scale: 1.02 }} 
                  className="relative flex items-center gap-[0.8vw] w-full px-[0.8vw] py-[3vh] h-[3vh] text-left bg-cover bg-center rounded-lg"
                >
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
  );
};

// =======================
// LANGUAGE & CURRENCY MODAL
// =======================
export const LanguageModal = ({
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
// MOBILE MENU COMPONENT
// =======================
export const MobileMenu = ({
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
  games: Game[];
  selectedGame: Game;
  onGameSelect: (game: Game) => void;
  onLanguageClick: () => void;
  country: string;
  currency: string;
  user: User | null;
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
                  <button 
                    key={game.id} 
                    onClick={() => { onGameSelect(game); onClose(); }} 
                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${selectedGame.name === game.name ? 'bg-[#3DFF88]/20 border border-[#3DFF88]' : 'bg-[#142b16] hover:bg-[#2a2a2a]'}`}
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                      {game.useIcon ? (
                        <img src={game.icon} alt={game.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">{game.subtitle}</div>
                      )}
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
// MAIN HEADER COMPONENT (Integrating All Components)
// =======================
const HeaderSection = (): JSX.Element => {
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [country, setCountry] = useState<string>("US");
  const [currency, setCurrency] = useState<string>("USD");
  const [selectedGame, setSelectedGame] = useState<Game>({
    id: 0,
    name: "Select Game",
    subtitle: "🎮",
    useIcon: true,
    icon: "/icon/gamepad.png",
    route: "/"
  });

  const games: Game[] = [
    { id: 1, name: "Murder Mystery 2", subtitle: "🔪", icon: "/game/murder.png", route: "/MurderMystery2" },
    { id: 2, name: "Grow A Garden", subtitle: "🌱", icon: "/game/garden.png", route: "/GrowAGarden" },
    { id: 3, name: "Steal A Brainrot", subtitle: "💎", icon: "/logo/steal.png", route: "/StealABrainrot" },
    { id: 4, name: "Adopt Me!", subtitle: "🐾", icon: "/logo/adopt.png", route: "/AdoptMe" },
    { id: 5, name: "Blade Ball", subtitle: "⚔️", icon: "/logo/blade.png", route: "/BladeBall" },
    { id: 6, name: "Blox Fruits", subtitle: "🍍", icon: "/logo/blox.png", useIcon: true, route: "/BloxFruits" },
    { id: 7, name: "99 Nights In The Forest", subtitle: "🌲", icon: "/logo/99.png", route: "/NinetyNineNights" },
    { id: 8, name: "Anime Vanguards", subtitle: "🔥", icon: "/logo/anime.png", route: "/AnimeVanguards" },
    { id: 9, name: "Dress To Impress", subtitle: "👗", icon: "/logo/impress.png", route: "/DressToImpress" },
  ];

  const authManager = AuthenticationManager({ 
    onUserChange: (user: User | null) => console.log('User changed:', user) 
  });

  const handleGameSelectWithRedirect = (game: Game) => {
    setSelectedGame(game);
    if (game.route) {
      window.location.href = game.route;
    }
  };

  useEffect(() => {
    const detectAndSetCurrency = async () => {
      const storedCountry = sessionStorage.getItem('userCountry');
      const storedCurrency = sessionStorage.getItem('userCurrency');

      if (storedCountry && storedCurrency && currencyMap[storedCountry] === storedCurrency) {
        setCountry(storedCountry);
        setCurrency(storedCurrency);
        return;
      }

      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error('Failed to fetch IP data');
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
          throw new Error('Invalid country code');
        }
      } catch (error) {
        console.error("Error detecting location:", error);
        const fallbackCountry = navigator.language.split("-")[1]?.toUpperCase() || "US";
        const fallbackCurrency = currencyMap[fallbackCountry] || "USD";
        setCountry(fallbackCountry);
        setCurrency(fallbackCurrency);
        sessionStorage.setItem('userCountry', fallbackCountry);
        sessionStorage.setItem('userCurrency', fallbackCurrency);
        window.dispatchEvent(new CustomEvent('currencyChanged', { 
          detail: { country: fallbackCountry, currency: fallbackCurrency } 
        }));
      }
    };

    detectAndSetCurrency();
  }, []);

  return (
    <>
      <header className="w-full h-16 md:h-[10vh] flex items-center justify-between px-4 md:px-[2vw] bg-[#060606] relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between w-full">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-[#3DFF87] p-2 bg-[url('/icon/header.png')] bg-cover bg-center hover:bg-gray-800 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <img className="h-10 object-cover" alt="Ro CART" src="/ro-cart-33-2.png" />
          <div className="relative" ref={authManager.userMenuRef}>
            {authManager.user ? (
              <>
                <button onClick={() => authManager.setIsUserMenuOpen(!authManager.isUserMenuOpen)} className="bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-[url(/icon/person.png)] bg-cover bg-center" />
                  <span className="text-white font-semibold">{authManager.user.firstName}</span>
                </button>
                <AnimatePresence>
                  {authManager.isUserMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-40 bg-[#0C1610] rounded-lg shadow-lg p-2 z-50">
                      <button onClick={authManager.handleLogout} className="w-full text-left px-4 py-2 text-white hover:bg-[#2a2a2a] rounded flex items-center gap-2">
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <button onClick={() => authManager.setIsAuthModalOpen(true)} className="bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="w-5 h-5 bg-[url(/icon/person.png)] bg-cover bg-center" />
                <span className="text-white font-semibold">Log in</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between w-full">
          <div className="flex items-center gap-[2vw]">
            <a href="/">
              <img className="w-auto h-[5vh] object-cover cursor-pointer" alt="Ro CART" src="/ro-cart-33-2.png" />
            </a>
            <GameSelector onGameSelect={handleGameSelectWithRedirect} />
          </div>

          <div className="flex items-center gap-[1.5vw]">
            <div onClick={() => setIsLangModalOpen(true)} className="cursor-pointer w-auto h-[5vh] bg-[linear-gradient(87deg,rgba(15,15,15,1)_0%,rgba(13,13,13,1)_100%)] rounded-[0.7vw] flex items-center">
              <ReactCountryFlag countryCode={country} svg style={{ width: "2vw", height: "2vw", marginLeft: "1vw" }} title={country} />
              <div className="ml-[0.5vw] flex-1 flex items-center gap-[0.5vw] justify-between">
                <span className="font-poppins font-semibold text-white text-[0.9vw] leading-tight">English/{currency}</span>
                <ChevronDownIcon className="w-[0.8vw] h-[0.8vw] text-white mr-[1vw]" />
              </div>
            </div>

            <div className="relative" ref={authManager.userMenuRef}>
              {authManager.user ? (
                <>
                  <Button onClick={() => authManager.setIsUserMenuOpen(!authManager.isUserMenuOpen)} className="w-[8vw] h-[5vh] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-[0.7vw] border-0 p-0 flex items-center justify-center gap-[0.5vw]">
                    <div className="w-[1.2vw] h-[1.2vw] bg-[url(/icon/person.png)] bg-cover" />
                    <span className="font-poppins font-semibold text-white text-[0.9vw] leading-tight whitespace-nowrap">{authManager.user.firstName}</span>
                  </Button>
                  <AnimatePresence>
                    {authManager.isUserMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-40 bg-[#0C1610] rounded-lg shadow-lg p-2 z-50">
                        <button onClick={authManager.handleLogout} className="w-full text-left px-4 py-2 text-white hover:bg-[#2a2a2a] rounded flex items-center gap-2">
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Button onClick={() => authManager.setIsAuthModalOpen(true)} className="w-[6vw] h-[5vh] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-[0.7vw] border-0 p-0 flex items-center justify-center gap-[0.5vw]">
                  <div className="w-[1.2vw] h-[1.2vw] bg-[url(/icon/person.png)] bg-cover" />
                  <span className="font-poppins font-semibold text-white text-[0.9vw] leading-tight whitespace-nowrap">Log in</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        games={games} 
        selectedGame={selectedGame} 
        onGameSelect={handleGameSelectWithRedirect} 
        onLanguageClick={() => setIsLangModalOpen(true)} 
        country={country} 
        currency={currency} 
        user={authManager.user}
        handleLogout={authManager.handleLogout}
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
        isOpen={authManager.isAuthModalOpen} 
        onClose={() => authManager.setIsAuthModalOpen(false)} 
        setUser={authManager.handleSetUser}
      />
    </>
  );
};

export default HeaderSection;