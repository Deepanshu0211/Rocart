import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ReactCountryFlag from "react-country-flag";

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
  const [loading, setLoading] = useState<boolean>(true);

  const currencyMap: Record<string, string> = {
    US: "USD",
    IN: "INR",
    GB: "GBP",
    EU: "EUR",
    JP: "JPY",
    // add more here
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // auto-detect
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          const code = (data.country_code || "").toUpperCase();
          if (code) {
            setCountry(code);
            setCurrency(currencyMap[code] || "USD");
          } else {
            const userLang = navigator.language || "en-US";
            const code2 = userLang.split("-")[1]?.toUpperCase() || "US";
            setCountry(code2);
            setCurrency(currencyMap[code2] || "USD");
          }
        })
        .catch(() => {
          const userLang = navigator.language || "en-US";
          const code2 = userLang.split("-")[1]?.toUpperCase() || "US";
          setCountry(code2);
          setCurrency(currencyMap[code2] || "USD");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#111] rounded-xl p-[1.5vw] w-[22vw] shadow-xl text-white"
          >
            <h2 className="text-[1.2vw] font-semibold mb-[1vh]">Language & Currency</h2>

            {/* Auto-detected */}
            <div className="mb-[0.8vh] flex items-center gap-[0.5vw]">
              <p className="text-[0.9vw] text-gray-400">Detected Country:</p>
              {loading ? (
                <p className="text-[1vw] font-medium">Detecting...</p>
              ) : (
                <>
                  <ReactCountryFlag
                    countryCode={country}
                    svg
                    style={{ width: "1.2vw", height: "1.2vw" }}
                    title={country}
                  />
                  <p className="text-[1vw] font-medium">{country}</p>
                </>
              )}
            </div>

            {/* Manual selection */}
            <div className="mb-[1vh]">
              <label className="text-[0.9vw] text-gray-400 block mb-[0.3vh]">
                Change Country
              </label>
              <select
                className="w-full bg-[#222] p-[0.5vw] rounded-md text-white text-[0.9vw]"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  const currencyMap: Record<string, string> = {
                    US: "USD",
                    IN: "INR",
                    GB: "GBP",
                    EU: "EUR",
                    JP: "JPY",
                  };
                  setCurrency(currencyMap[e.target.value] || "USD");
                }}
              >
                <option value="US">United States</option>
                <option value="IN">India</option>
                <option value="GB">United Kingdom</option>
                <option value="EU">Europe</option>
                <option value="JP">Japan</option>
              </select>
            </div>

            <div className="mb-[1.5vh]">
              <p className="text-[0.9vw] text-gray-400">Currency</p>
              <p className="text-[1vw] font-medium">{currency}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-[0.5vh] rounded-md bg-green-600 hover:bg-green-700 font-semibold text-[0.9vw]"
            >
              Confirm
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =======================
// Main Header Section
// =======================
export const HeaderSection = (): JSX.Element => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");

  const [selectedGame, setSelectedGame] = useState<{
    subtitle?: string;
    name: string;
    bgImage?: string;
    bgColor?: string;
    useIcon?: boolean;
  }>({
    name: "Choose a game",
    subtitle: "🎮",
    useIcon: true,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
const games = [
  {
    id: 1,
    name: "Murder Mystery 2",
    subtitle: "🔪",
    icon: "/game/murder.png",
  },
  {
    id: 2,
    name: "Grow A Garden",
    subtitle: "🌱",
    icon: "/game/garden.png",
  },
  {
    id: 3,
    name: "Steal A Brainrot",
    subtitle: "💎",
    icon: "/game/brainrot.png",
  },
  {
    id: 4,
    name: "Adopt Me!",
    subtitle: "🏠",
    icon: "/game/adopt.png",
  },
  {
    id: 5,
    name: "Blade Ball",
    subtitle: "⚔️",
    icon: "/game/blade.png",
  },
  {
    id: 6,
    name: "Blox Fruits",
    subtitle: "🏁",
    icon: "/game/blox.png",
    useIcon: true,
  },
  {
    id: 7,
    name: "99 Nights In The Forest",
    subtitle: "🌲",
    icon: "/game/99.png",
  },
  {
    id: 8,
    name: "Anime Vanguards",
    subtitle: "🔥",
    icon: "/game/anime.png",
  },
  {
    id: 9,
    name: "Dress To Impress",
    subtitle: "👗",
    icon: "/game/dress.png",
  },
  {
    id: 10,
    name: "Garden Tower Defense",
    subtitle: "🛡️",
    icon: "/game/tower.png",
  },
];

  const handleGameSelect = (game: any) => {
    setSelectedGame(game);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
    <header className="w-full h-[10vh] flex items-center justify-between px-[2vw] bg-[#0C1610] relative">
      {/* Left: Logo + Dropdown */}
      <div className="flex items-center gap-[2vw] relative" ref={dropdownRef}>
        <img
          className="w-auto h-[5vh] object-cover"
          alt="Ro CART"
          src="/ro-cart-33-2.png"
        />

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-auto h-[6vh] rounded-[0.7vw] flex items-center relative overflow-hidden bg-center transition-colors`}
            style={{
              backgroundImage: selectedGame.bgImage
                ? `url(${selectedGame.bgImage})`
                : undefined,
              backgroundSize: selectedGame.bgImage ? "contain" : undefined,
              backgroundRepeat: selectedGame.bgImage ? "no-repeat" : undefined,
            }}
          >
            {!selectedGame.bgImage && (
              <div className="absolute inset-0 bg-[#0f0f0f]" />
            )}
            {selectedGame.bgImage && (
              <div className="absolute inset-0 bg-black/40" />
            )}

            {/* 🔹 Custom Gamepad Icon here */}
            <div className="ml-[1vw] w-[1.5vw] h-[1.5vw] flex items-center justify-center relative z-10">
              {selectedGame.useIcon ? (
                <img
                  src="/icon/gamepad.png"
                  alt="Gamepad"
                  className="w-[4vw] h-[2vw] object-contain"
                />
              ) : (
                selectedGame.subtitle || "🎮"
              )}
            </div>

            <div className="ml-[0.8vw] flex-1 flex items-center gap-[0.5vw] relative z-10">
              <span className="font-poppins font-bold text-white text-[1vw] leading-tight">
                {selectedGame.name}
              </span>
              <ChevronDownIcon
                className={`w-[1vw] h-[1vw] text-white mr-[1vw] transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : ""
                }`}
              />
            </div>
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={containerVariants}
                className="absolute top-[6vh] left-0 w-[16vw] 
                          rounded-xl shadow-lg z-50 
                          bg-[#0C1610] p-[0.5vw]
                          h-auto overflow-y-auto" // 🔹 fixed height + scroll
              >
                <div className="flex flex-col ">
                  {games.map((game) => (
                    <motion.button
                      key={game.id}
                      onClick={() => handleGameSelect(game)}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="relative flex items-center gap-[0.8vw] w-full px-[0.8vw] py-[3vh] 
                                h-[3vh] text-left bg-cover bg-center rounded-lg"
                    >
                      <div className="absolute inset-0  rounded-lg" />
                     <div className="w-[2vw] h-[2vw] rounded-md overflow-hidden flex-shrink-0 relative z-10">
                      <img
                        src={game.icon}
                        alt={game.name}
                        className="w-full h-full object-cover rounded-md"
                      />
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

      {/* Right: Language + Login */}
      <div className="flex items-center gap-[1.5vw]">
        <div
          onClick={() => setIsLangModalOpen(true)}
          className="cursor-pointer w-auto h-[5vh] bg-[linear-gradient(87deg,rgba(15,15,15,1)_0%,rgba(13,13,13,1)_100%)] rounded-[0.7vw] flex items-center"
        >
          <ReactCountryFlag
            countryCode={country}
            svg
            style={{ width: "2vw", height: "2vw", marginLeft: "1vw" }}
            title={country}
          />
          <div className="ml-[0.5vw] flex-1 flex items-center gap-[0.5vw] justify-between">
            <span className="font-poppins font-semibold text-white text-[0.9vw] leading-tight">
              English/{currency}
            </span>
            <ChevronDownIcon className="w-[0.8vw] h-[0.8vw] text-white mr-[1vw]" />
          </div>
        </div>

        <Button className="w-[6vw] h-[5vh] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-[0.7vw] border-0 p-0 flex items-center justify-center gap-[0.5vw]">
          <div className="w-[1.2vw] h-[1.2vw] bg-[url(/icon/person.png)] bg-cover" />
          <span className="font-poppins font-semibold text-white text-[0.9vw] leading-tight whitespace-nowrap">
            Log in
          </span>
        </Button>
      </div>

      {/* Modal */}
      <LanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        country={country}
        setCountry={setCountry}
        currency={currency}
        setCurrency={setCurrency}
      />
    </header>
  );
};