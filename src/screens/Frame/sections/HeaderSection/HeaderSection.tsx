import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";

export const HeaderSection = (): JSX.Element => {
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState("Choose a game");

  const games = [
    {
      id: 1,
      name: "Race Traits",
      subtitle: "Tap to view Items",
      image: "🏁",
      bgColor: "bg-blue-600"
    },
    {
      id: 2,
      name: "Murder Mystery 2",
      subtitle: "Tap to view Items",
      image: "🔪",
      bgColor: "bg-red-600"
    },
    {
      id: 3,
      name: "Adopt Me!",
      subtitle: "Tap to view Items",
      image: "🏠",
      bgColor: "bg-green-600"
    },
    {
      id: 4,
      name: "Blade Ball",
      subtitle: "Tap to view Items",
      image: "⚔️",
      bgColor: "bg-cyan-600"
    },
    {
      id: 5,
      name: "Steal A Baghemet",
      subtitle: "Tap to view Items",
      image: "💎",
      bgColor: "bg-purple-600"
    },
    {
      id: 6,
      name: "Grow A Garden",
      subtitle: "Tap to view Items",
      image: "🌱",
      bgColor: "bg-emerald-600"
    }
  ];

  const handleGameSelect = (game: { id?: number; name: any; subtitle?: string; image?: string; bgColor?: string; }) => {
    setSelectedGame(game.name);
    setIsGameModalOpen(false);
  };

  return (
    <>
      <header className="w-full h-[103px] flex items-center justify-between px-10 bg-[#060606]">
        {/* Left: Logo + Game dropdown */}
        <div className="flex items-center gap-8">
          <img
            className="w-[159px] h-10 object-cover"
            alt="Ro CART"
            src="/ro-cart-33-2.png"
          />

          <button
            onClick={() => setIsGameModalOpen(true)}
            className="w-[212px] h-[50px] bg-[#0f0f0f] rounded-[11px] flex items-center hover:bg-[#1a1a1a] transition-colors"
          >
            <img
              className="ml-[15px] w-[27px] h-[27px]"
              alt="Mask group"
              src="/mask-group-35.png"
            />
            <div className="ml-[10px] flex-1 flex items-center justify-between">
              <span className="font-poppins font-semibold text-white text-sm leading-[21px]">
                {selectedGame}
              </span>
              <ChevronDownIcon className="w-[13px] h-[13px] text-white mr-[15px]" />
            </div>
          </button>
        </div>

        {/* Right: Language + Login */}
        <div className="flex items-center gap-6">
          {/* Language */}
          <div className="w-[194px] h-[50px] bg-[linear-gradient(87deg,rgba(15,15,15,1)_0%,rgba(13,13,13,1)_100%)] rounded-[11px] flex items-center">
            <img
              className="ml-5 w-[30px] h-4 rounded object-cover"
              alt="Download"
              src="/download-1.png"
            />
            <div className="ml-[8px] flex-1 flex items-center justify-between">
              <span className="font-poppins font-semibold text-white text-sm leading-[21px]">
                English/USD
              </span>
              <ChevronDownIcon className="w-[13px] h-[13px] text-white mr-[15px]" />
            </div>
          </div>

          {/* Login Button */}
          <Button className="w-[100px] h-[37px] bg-[linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(37,153,81,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(61,255,136,0.9)_0%,rgba(37,153,81,0.9)_100%)] rounded-[11px] border-0 p-0 flex items-center justify-center gap-2">
            <div className="w-[19px] h-[19px] bg-[url(/mask-group-38.png)] bg-cover" />
            <span className="font-poppins font-semibold text-white text-sm leading-[21px] whitespace-nowrap">
              Log in
            </span>
          </Button>
        </div>
      </header>

      {/* Game Selection Modal */}
      {isGameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-green-500 rounded-2xl p-8 max-w-2xl w-full mx-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsGameModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-green-400 transition-colors text-2xl"
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold mb-2">CHOOSE A GAME</h2>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-3 gap-6">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className={`${game.bgColor} rounded-xl p-6 text-center hover:scale-105 transition-transform duration-200 flex flex-col items-center justify-center min-h-[140px]`}
                >
                  <div className="text-4xl mb-3">{game.image}</div>
                  <h3 className="text-white font-bold text-sm mb-1">{game.name}</h3>
                  <p className="text-white text-xs opacity-80">{game.subtitle}</p>
                </button>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="text-center mt-8">
              <img
                className="w-[159px] h-10 object-cover mx-auto"
                alt="Ro CART"
                src="/ro-cart-33-2.png"
              />
              <p className="text-gray-400 text-sm mt-2">Select your favorite game</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};