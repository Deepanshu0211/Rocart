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
            className="bg-[#111] rounded-xl p-6 w-[350px] shadow-xl text-white"
          >
            <h2 className="text-lg font-semibold mb-4">Language & Currency</h2>

            {/* Auto-detected */}
            <div className="mb-3 flex items-center gap-3">
              <p className="text-sm text-gray-400">Detected Country:</p>
              {loading ? (
                <p className="text-base font-medium">Detecting...</p>
              ) : (
                <>
                  <ReactCountryFlag
                    countryCode={country}
                    svg
                    style={{ width: "1.5em", height: "1.5em" }}
                    title={country}
                  />
                  <p className="text-base font-medium">{country}</p>
                </>
              )}
            </div>

            {/* Manual selection */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">
                Change Country
              </label>
              <select
                className="w-full bg-[#222] p-2 rounded-md text-white"
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

            <div className="mb-6">
              <p className="text-sm text-gray-400">Currency</p>
              <p className="text-base font-medium">{currency}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 rounded-md bg-green-600 hover:bg-green-700 font-semibold"
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
    <header className="w-full h-[103px] flex items-center justify-between px-10 bg-[#0C1610] relative">
      {/* Left: Logo + Dropdown */}
      <div className="flex items-center gap-8 relative" ref={dropdownRef}>
        <img
          className="w-[159px] h-10 object-cover"
          alt="Ro CART"
          src="/ro-cart-33-2.png"
        />

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-[212px] h-[50px] rounded-[11px] flex items-center relative overflow-hidden bg-center transition-colors`}
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
            <div className="ml-[15px] w-[27px] h-[27px] flex items-center justify-center relative z-10">
              {selectedGame.useIcon ? (
                <img
                  src="/icon/gamepad.png"
                  alt="Gamepad"
                  className="w-6 h-6 object-contain"
                />
              ) : (
                selectedGame.subtitle || "🎮"
              )}
            </div>

            <div className="ml-[10px] flex-1 flex items-center justify-between relative z-10">
              <span className="font-poppins font-semibold text-white text-sm leading-[21px]">
                {selectedGame.name}
              </span>
              <ChevronDownIcon
                className={`w-[13px] h-[13px] text-white mr-[15px] transition-transform duration-200 ${
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
                className="absolute top-[55px] left-0 w-[250px] 
                          rounded-xl shadow-lg z-50 border border-[#213d2d] 
                          bg-[#0C1610] p-2
                          h-auto overflow-y-auto" // 🔹 fixed height + scroll
              >
                <div className="flex flex-col ">
                  {games.map((game) => (
                    <motion.button
                      key={game.id}
                      onClick={() => handleGameSelect(game)}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="relative flex items-center gap-3 w-full px-3 py-2 
                                h-[45px] text-left bg-cover bg-center rounded-lg"
                    >
                      <div className="absolute inset-0 bg-black/30 rounded-lg" />
                     <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 relative z-10">
                      <img
                        src={game.icon}
                        alt={game.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                      <span className="flex flex-col text-white font-medium text-[14px] relative z-10 leading-tight">
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
      <div className="flex items-center gap-6">
        <div
          onClick={() => setIsLangModalOpen(true)}
          className="cursor-pointer w-[194px] h-[50px] bg-[linear-gradient(87deg,rgba(15,15,15,1)_0%,rgba(13,13,13,1)_100%)] rounded-[11px] flex items-center"
        >
          <ReactCountryFlag
            countryCode={country}
            svg
            style={{ width: "1.5em", height: "1.5em", marginLeft: "16px" }}
            title={country}
          />
          <div className="ml-[8px] flex-1 flex items-center justify-between">
            <span className="font-poppins font-semibold text-white text-sm leading-[21px]">
              English/{currency}
            </span>
            <ChevronDownIcon className="w-[13px] h-[13px] text-white mr-[15px]" />
          </div>
        </div>

        <Button className="w-[100px] h-[37px] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-[11px] border-0 p-0 flex items-center justify-center gap-2">
          <div className="w-[19px] h-[19px] bg-[url(/mask-group-38.png)] bg-cover" />
          <span className="font-poppins font-semibold text-white text-sm leading-[21px] whitespace-nowrap">
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
