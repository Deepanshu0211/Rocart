import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { AnimatePresence, motion } from "framer-motion";

const gameItems = [
  {
    name: "Chroma Evergun",
    image: "/homeico/1.png",
    top: "10%",
    left: "0%",
    rotation: "rotate-[-55deg]",
  },
  {
    name: "Control Fruit",
    image: "/homeico/3.png",
    top: "-25%",
    left: "65%",
    rotation: "rotate-[45.57deg]",
  },
  {
    name: "Gold disco Bee",
    image: "/homeico/2.png",
    top: "-35%",
    left: "20%",
    rotation: "rotate-[-30.90deg]",
  },
];

const games = [
  {
    name: "Blox Fruits",
    icon: "/logo/blox.png",
    bgImage: "/logo/bloxmain.png",
    gradient: "linear-gradient(90deg, #41A7FF, #D9EDFF)",
  },
  {
    name: "Murder Mystery 2",
    icon: "/logo/murder.png",
    bgImage: "/logo/murdermain.png",
    gradient: "linear-gradient(90deg, #E90303, #FFA3A3)",
  },
  {
    name: "Adopt Me",
    icon: "/logo/adopt.png",
    bgImage: "/logo/adoptmain.png",
    gradient: "linear-gradient(90deg, #F7FE49, #D9EDFF)",
  },
  {
    name: "Blade Ball",
    icon: "/logo/blade.png",
    bgImage: "/logo/blademain.png",
    gradient: "linear-gradient(90deg, #FF41A3, #D9EDFF)",
  },
  {
    name: "Steal a Brainrot",
    icon: "/logo/steal.png",
    bgImage: "/logo/stealmain.png",
    gradient: "linear-gradient(90deg, #A641FF, #D9EDFF)",
  },
  {
    name: "Grow a Garden",
    icon: "/logo/grow.png",
    bgImage: "/logo/growmain.png",
    gradient: "linear-gradient(90deg, #2ECC71, #27AE60)",
  },
  {
    name: "Anime Vanguards",
    icon: "/logo/anime.png",
    bgImage: "/logo/anime-main.png",
    gradient: "linear-gradient(90deg, #FF8132, #E9E9E9)",
  },
  {
    name: "Garden Tower Defense",
    icon: "/logo/tower.png",
    bgImage: "/logo/towermain.png",
    gradient: "linear-gradient(90deg, #F7A35D, #E9E9E9)",
  },
  {
    name: "Dress To Impress",
    icon: "/logo/impress.png",
    bgImage: "/logo/impressmain.png",
    gradient: "linear-gradient(90deg, #FF327D, #E9E9E9)",
  },
  {
    name: "99 nights in the forest",
    icon: "/logo/99.png",
    bgImage: "/logo/99main.png",
    gradient: "linear-gradient(90deg, #FF9832, #E9E9E9)",
  },
];

export const WelcomeBannerSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative w-full h-[75vh] overflow-hidden">
      {/* Base Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg/ho.png')",
        }}
      />

      {/* Custom Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg/image.png')",
        }}
      />

      {/* Bottom Gradient Line */}
      <div
        className="absolute bottom-0 left-0 w-full h-[0.2vh]"
        style={{
          background: "linear-gradient(to right, #3DFF87, #000000)",
        }}
      />

      {/* Main Content */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-[2vh] px-[4vw] sm:px-[2vw] py-[4vh] max-w-[95vw] mx-auto h-full">
        {/* Left Content - Centered on mobile */}
        <div className="flex-1 w-full text-center lg:text-left flex flex-col justify-center h-full">
          <div className="mb-[2vh]">
            <h1 className="text-[6vw] sm:text-[5vw] lg:text-[3vw] font-bold text-white mb-[2vh] sm:mb-[1.5vh] leading-tight">
              Buy Your Favorite Items
              <br />
              <span className="text-[#3dff87]">Fast, Safe, and Easy</span>
              <br />
              with Rocart!
            </h1>

            <p className="font-normal text-[#c8c8c8] text-[3.5vw] sm:text-[2.5vw] lg:text-[1.2vw] leading-relaxed mb-[4vh] sm:mb-[3vh] px-[2vw] lg:px-0">
              Rocart the fastest, safest shop for in-game items with automated
              delivery. <br className="hidden sm:block" />
              Get what you need in seconds.
              <br className="hidden sm:block" />
              For items in Murder Mystery 2,&nbsp;Grow a Garden, Blox
              Fruits, Steal a Brainrot, Blade Ball.
            </p>

            {/* Start Buying Button - Centered on mobile */}
            <div className="flex justify-center lg:justify-start">
              <Button
                onClick={() => setIsOpen(true)}
                className="mt-[2vh] sm:mt-[4vh] lg:mt-[6vh] h-[8vh] sm:h-[7vh] w-[40vw] sm:w-[25vw] lg:w-[12vw]
                  rounded-[15px] p-2 flex items-center justify-center
                  bg-gradient-to-r from-[#a9d692] via-[#3DFF88] to-[#259951]
                  hover:shadow-xl hover:shadow-[#259951]/30
                  transition-all duration-300 overflow-hidden"
              >
                {/* Background overlay for hover effect */}
                <motion.div
                  className="absolute inset-0 bg-white/10 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.15 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Icon + Text */}
                <div className="relative z-10 flex items-center space-x-2">
                  <img
                    className="w-[4vw] sm:w-[3vw] lg:w-[2vw] h-[4vw] sm:h-[3vw] lg:h-[2.5vw] object-contain"
                    alt="Cart icon"
                    src="/icon/shop.png"
                  />
                  <span className="font-bold text-white text-[4vw] sm:text-[2.5vw] lg:text-[1vw]">
                    Start Buying
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Content - Character + Floating Items (Hidden on mobile and small tablets) */}
        <div className="hidden lg:flex flex-1 relative aspect-[4/3] w-full max-w-[40vw] mx-auto">
          {/* Main Character */}
          <img
            className="absolute top-[25vh] left-[30%] w-[50%] h-auto object-contain"
            alt="Character"
            src="/logo/char.png"
          />

          {/* Floating Game Items */}
          {gameItems.map((item, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{
                top: item.top,
                left: item.left,
                width: "30%",
                height: "30%",
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3 + index,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Card className="relative top-[15vw] w-full h-full bg-transparent shadow-none border-none">
                <CardContent className="p-0 relative w-full h-full">
                  {/* Background gradient */}
                  <div className="absolute inset-0 rounded-[2.5vw] opacity-[0.12] -rotate-45" />

                  {/* Item Image */}
                  <img
                    className={`absolute inset-0 w-[100%] h-[100%] m-auto object-contain scale-150 ${item.rotation}`}
                    alt={item.name}
                    src={item.image}
                  />

                  {/* Badge */}
                  <div className="absolute bottom-[20%] right-[10%] w-[2.5vw] h-[2.5vw] rounded-[0.8vw] -rotate-45" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative rounded-[3vw] p-[4vw] sm:p-[2vw] 
                        w-[90vw] sm:w-[80vw] lg:w-[70vw] 
                        max-h-[85vh] overflow-y-auto
                        bg-[url('/bg/modalbg.png')] bg-cover bg-center bg-no-repeat
                        scrollbar-thin lg:scrollbar-none
                        scrollbar-thumb-[#3dff87]/70 scrollbar-track-transparent scrollbar-thumb-rounded-full
                        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >


              {/* Header */}
              <div className="flex justify-center relative mb-[3vh] sm:mb-[1.5vh]">
                <h2 className="text-[5vw] sm:text-[3vw] lg:text-[2vw] font-extrabold tracking-tight text-[#FFFFFF]">
                  CHOOSE A GAME
                </h2>

              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-0 -top-2.5  text-white hover:text-[#3dff87] 
                          text-[8vw] sm:text-[2.5vw] lg:text-[1.8vw]"
              >
                ✕
              </button>

              </div>

              {/* Grid of Games - Responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3vw] sm:gap-[1.5vw]">
                {games.map((game, i) => (
                  <Card
                    key={i}
                    className="relative rounded-[25px] w-full h-[25vh] sm:h-[20vh] overflow-hidden hover:scale-[1.03] transition-transform duration-300 cursor-pointer bg-transparent shadow-none border-none"
                    style={{
                      backgroundImage: `url(${game.bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundBlendMode: "overlay",
                    }}
                  >
                    <CardContent className="relative z-10 flex flex-col items-center justify-center p-[2vw] sm:p-[1vw] text-center h-full">
                      <img
                        src={game.icon}
                        alt={game.name}
                        className="w-[12vw] h-[12vw] sm:w-[8vw] sm:h-[8vw] lg:w-[4vw] lg:h-[4vw] mb-[1vh] sm:mb-[0.5vh] object-contain"
                      />
                      <p
                        className="font-bold text-[3vw] sm:text-[2vw] lg:text-[1.2vw] bg-clip-text text-transparent"
                        style={{ backgroundImage: game.gradient }}
                      >
                        {game.name}
                      </p>
                      <p className="text-[#FFFFFF] font-extrabold text-[2.5vw] sm:text-[1.5vw] lg:text-[0.9vw] mt-[0.5vh] sm:mt-[0.3vh]">
                        Tap to view Items
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Footer Rocart Logo */}
              <div className="flex justify-center mt-[3vh] sm:mt-[1.5vh]">
                <img
                  src="/logo/rocart.png"
                  alt="Rocart logo"
                  className="h-auto w-[80vw] sm:w-[60vw] lg:w-[90vw] object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};