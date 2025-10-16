import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const gameData = [
  {
    id: 1,
    title: "Grow A Garden",
    icon: "/gag-jqsy7lwj-1.png",
    maskGroup: "/bgs/image4.png",
    buttonImage: "/buttonbg/1.png",
    route: "/GrowAGarden",
    items: [
      {
        name: "Raccoon",
        price: "$15",
        image: "/img-5467--1--1.png",
        priceColor: "text-[#3dff87]",
        backgroundImage: "/trendingbg/1.png",
      },
      {
        name: "Kitsune",
        price: "$10",
        image: "/pets/kitsume.png",
        priceColor: "text-[#861C1C]",
        backgroundImage: "/trendingbg/9.png",
      },
    ],
  },
  {
    id: 2,
    title: "MM2",
    icon: "/icon/mm2.png",
    maskGroup: "/bgs/image2.png",
    buttonImage: "/buttonbg/2.png",
    route: "/murderMystery",
    items: [
      {
        name: "Gingerscope",
        price: "$15",
        image: "/pets/Gingerscope.png",
        priceColor: "text-[#ff3c3c]",
        backgroundImage: "/trendingbg/3.png",
      },
      {
        name: "Bat Knife",
        price: "$10",
        image: "/pets/bat.png",
        priceColor: "text-[#be8832]",
        backgroundImage: "/trendingbg/4.png",
      },
    ],
  },
  {
    id: 3,
    title: "Steal A brainrot",
    icon: "/logo/brain.png",
    maskGroup: "/bgs/image1.png",
    buttonImage: "/buttonbg/3.png",
    route: "/StealABrainrot",
    items: [
      {
        name: "Medussi",
        price: "$15",
        image: "/pets/Medussi.png",
        priceColor: "text-[#821BF0]",
        backgroundImage: "/trendingbg/10.png",
      },
      {
        name: "Combinasion",
        price: "$10",
        image: "/pets/Combinasion.png",
        priceColor: "text-[#31a6ff]",
        backgroundImage: "/trendingbg/7.png",
      },
    ],
  },
  {
    id: 4,
    title: "Adopt Me",
    icon: "/am-yek4mbfs-1.png",
    maskGroup: "/bgs/image3.png",
    buttonImage: "/buttonbg/4.png",
    route: "/AdoptMe",
    items: [
      {
        name: "Elephant",
        price: "$15",
        image: "/elephant-17-9fcc194d-4ed1-475f-9992-6ede479175b9-1.png",
        priceColor: "text-[#999999]",
        backgroundImage: "/trendingbg/7.png",
      },
      {
        name: "Cow ",
        price: "$10",
        image: "/cow-12-04a274cd-d0f3-448a-8729-45826f64f935-1.png",
        priceColor: "text-white",
        backgroundImage: "/trendingbg/8.png",
      },
    ],
  },
];

const AnimatedCard = motion(Card);
const AnimatedImg = motion.img;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.8,
    rotateY: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      duration: 0.8,
      bounce: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.6,
      bounce: 0.3,
    },
  },
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      delay: 0.5,
    },
  },
};

// Mobile-specific animation variants for item cards
const mobileItemTap = {
  scale: 0.95,
  y: 2,
  rotateZ: -1,
  boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  transition: {
    type: "spring",
    stiffness: 600,
    damping: 30,
    duration: 0.15,
  },
};

const mobileImageTap = {
  scale: 1.2,
  rotateZ: 5,
  transition: {
    type: "spring",
    stiffness: 500,
    damping: 20,
    duration: 0.2,
  },
};

export const TrendingItemsSection = () => {
  const navigate = useNavigate();

  const handleVisitMarket = (route: string) => {
    navigate(route);
  };

  return (
   <section className="relative w-full min-h-screen bg-[#06100A] pt-[2vh] pb-[5vh] scrollbar-none">

      <div
        className="
          absolute inset-0 
          bg-[url('/bg/mesh.png')] 
          bg-no-repeat bg-center 
          sm:bg-repeat
          opacity-90 pointer-events-none 
          from-[#06100A] via-transparent to-[#2A2A2A]
        "
        style={{
          backgroundSize: "200vw 200vh",
          backgroundBlendMode: "overlay",
          backgroundAttachment: "fixed",
        }}
      />

      <div className="max-w-[95vw] mx-auto px-[3vw] z-10">
        {/* Animated Lines */}
        <div className="relative mb-[10vh] hidden sm:block">
          <motion.div
            className="absolute top-[6vh] -left-[2vw] w-[35%] h-[0.2vh] rounded-[0px_2vw_3vw_0px] bg-[linear-gradient(90deg,rgba(49,49,49,0)_0%,rgba(255,255,255,1)_100%)]"
            variants={lineVariants}
            initial="visible"
            viewport={{ once: true }}
          />
          <motion.div
            className="absolute top-[6vh] -right-[2vw] w-[35%] h-[0.2vh] rounded-[3vw_0px_0px_3vw] bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(49,49,49,0)_100%)]"
            variants={lineVariants}
            initial="visible"
            viewport={{ once: true }}
          />
        </div>

        {/* Title Section */}
        <motion.div
          className="text-center mb-[10vh]"
          variants={titleVariants}
          initial="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            className="bg-gradient-to-r from-white via-gray-200 z-10 h-[8vh] sm:h-[12vh] to-gray-400 bg-clip-text text-transparent font-bold text-[8vw] sm:text-[6vw] lg:text-[4vw] mb-0"
            style={{ fontFamily: "Poppins, sans-serif" }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            Trending Now
          </motion.h2>
          <motion.p
            className="text-gray-300 text-[3.5vw] sm:text-[2.5vw] lg:text-[1.5vw] max-w-[90vw] sm:max-w-[80vw] mx-auto leading-relaxed px-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Items gaining popularity right now.
            <br />
            Most users are active on their catalog pages.
          </motion.p>
        </motion.div>

        {/* Game Cards - Mobile shows only first 2 cards */}
        <motion.div
          className="flex flex-wrap gap-[4vw] sm:gap-[1.5vw] justify-center items-end"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {gameData.map((game, gameIndex) => (
            <motion.div
              key={game.id}
              variants={cardVariants}
              whileHover={{
                scale: 1.05,
                rotate: gameIndex % 2 === 0 ? 2 : -2,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className={`group ${
                gameIndex >= 2 ? 'hidden sm:block' : ''
              }`}
            >
              <AnimatedCard className="w-[70vw] sm:w-[22vw] lg:w-[18vw] h-[44vh] sm:h-[43vh] lg:h-[45vh] 
                bg-[#030804] border border-[#2A2A2A] 
                rounded-[10vw] sm:rounded-[2.5vw] lg:rounded-[2vw] 
                shadow-2xl flex flex-col items-center relative overflow-hidden 
                group-hover:border-[#3DFF87]/30 transition-colors duration-300">

                <CardContent className="flex flex-col items-center justify-start w-full h-full p-0 relative z-10">
                  {/* Game Header */}
                  <motion.div
                    className="w-auto gap-[2vw] sm:gap-[1vw] flex flex-row items-center pt-[3vh] pb-[2vh]"
                    initial={{ opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: gameIndex * 0.1 + 0.4, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <motion.img
                      className="w-[4vw] sm:w-[1.8vw] h-[4vw] sm:h-[1.8vw] rounded-[0.8vw] sm:rounded-[0.4vw] object-cover mb-[1.5vh] shadow-lg"
                      alt={game.title}
                      src={game.icon}
                    />
                    <motion.div
                      className="w-full text-center font-bold text-[3vw] sm:text-[0.5vw] lg:text-[0.8vw] bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-[1vh]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {game.title}
                    </motion.div>
                  </motion.div>

                  {/* Items Grid with Enhanced Mobile Click Animation */}
                  <motion.div
                    className="flex gap-[3vw] sm:gap-[1.2vw] justify-center w-[75vw] sm:w-[20vw] mb-[4vh]"
                    variants={containerVariants}
                    initial="visible"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {game.items.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="relative w-[30vw] sm:w-[7vw] h-[22vh] sm:h-[22vh] lg:h-[18vh] rounded-[3vw] sm:rounded-[1.2vw] flex flex-col items-center backdrop-blur-sm border-none group/item cursor-pointer select-none"
                        style={{ 
                          backgroundImage: `url(${item.backgroundImage})`, 
                          backgroundSize: 'cover', 
                          backgroundPosition: 'center',
                          touchAction: 'manipulation'
                        }}
                        whileHover={{
                          scale: 1.1,
                          y: -8,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                          transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          },
                        }}
                        onClick={() => {
                          if (
                            typeof window !== "undefined" &&
                            window.navigator
                          ) {
                            if (window.navigator.vibrate) {
                              window.navigator.vibrate([200]);
                            }
                            if ("vibrate" in window.navigator === false) {
                              if (window.navigator && (window.navigator as Navigator).userAgent.includes("iPhone")) {
                                console.log("iPhone detected — basic haptic feedback triggered");
                              }
                            }
                          }
                          console.log(`Clicked on ${item.name}`);
                        }}
                      >
                        <motion.div 
                          className="absolute inset-0 rounded-[3vw] sm:rounded-[1.2vw] bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" 
                        />
                        <AnimatedImg
                          className="mt-[2vh] rounded-[2vw] sm:rounded-[0.8vw] object-cover shadow-xl z-10 w-[20vw] h-[20vw] sm:w-[5vw] sm:h-[5vw] select-none"
                          alt={item.name}
                          src={item.image}
                          whileHover={{
                            scale: 1.15,
                            rotate: -5,
                            transition: { type: "spring", stiffness: 300 },
                          }}
                          whileTap={typeof window !== 'undefined' && window.innerWidth <= 768 ? mobileImageTap : {
                            scale: 1.1,
                            rotate: -3,
                            transition: { type: "spring", stiffness: 500, duration: 0.15 }
                          }}
                          drag={false}
                          style={{ 
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            pointerEvents: 'auto'
                          }}
                        />
                        <motion.div
                          className="w-full text-left font-bold text-[3.5vw] sm:text-[1.3vw] lg:text-[0.9vw] mt-[3vh] bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent px-[2vw] sm:px-[0.8vw] select-none"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                          initial={{ opacity: 1 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          animate={{
                            scale: 1,
                            transition: { type: "spring", stiffness: 200 }
                          }}
                        >
                          {item.name}
                        </motion.div>
                        <motion.div
                          className={`w-full text-left font-bold text-[3vw] sm:text-[1.1vw] lg:text-[0.8vw] mt-0 px-[2vw] sm:px-[0.8vw] ${item.priceColor} drop-shadow-lg select-none`}
                          style={{ fontFamily: "Poppins, sans-serif" }}
                          initial={{ opacity: 1, scale: 1 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          whileTap={typeof window !== 'undefined' && window.innerWidth <= 768 ? {
                            scale: 1.05,
                            transition: { duration: 0.1 }
                          } : {}}
                        >
                          {item.price}
                        </motion.div>
                        <motion.div
                          className="absolute inset-0 rounded-[3vw] sm:rounded-[1.2vw] border-2 border-[#3DFF87] opacity-0 pointer-events-none"
                          animate={{ opacity: 0 }}
                          whileTap={typeof window !== 'undefined' && window.innerWidth <= 768 ? {
                            opacity: [0, 0.6, 0],
                            scale: [1, 1.02, 1],
                            transition: { duration: 0.3 }
                          } : {}}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Visit Market Button - Mobile */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 1, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: gameIndex * 0.1 + 0.6, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="block sm:hidden"
                  >
                    <Button
                      onClick={() => handleVisitMarket(game.route)}
                      className="mt-[2vh] 
                                w-[30vw] 
                                h-[4.5vh] 
                                z-100 rounded-[3vw] 
                                group-hover:scale-105 transition-transform duration-300"
                      style={{ 
                        backgroundImage: `url(${game.buttonImage})`,
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        opacity: 1,
                        border: 'none'
                      }}
                    >
                      <motion.span
                        className="font-medium text-white 
                                  text-[3vw] 
                                  opacity-100 tracking-tight leading-none pointer-events-none"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                        whileHover={{ scale: 1.05 }}
                      >
                        Visit Market
                        <img
                          src="/icon/icon2.png"
                          alt="arrow right"
                          className="inline 
                                    w-[2.2vw] h-[2.2vw] 
                                    ml-[0.8vw] object-contain"
                        />
                      </motion.span>
                    </Button>
                  </motion.div>

                  {/* Visit Market Button - Desktop */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 1, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: gameIndex * 0.1 + 0.6, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="hidden sm:block"
                  >
                    <Button
                      onClick={() => handleVisitMarket(game.route)}
                      className="mt-[6vh] 
                                sm:mt-[5vh] 
                                w-[12vw] lg:w-[8vw] 
                                h-[5vh] lg:h-[5vh] 
                                z-100 rounded-[1.2vw] lg:rounded-[0.8vw] 
                                group-hover:scale-105 transition-transform duration-300"
                      style={{ 
                        backgroundImage: `url(${game.buttonImage})`,
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        opacity: 1,
                        border: 'none'
                      }}
                    >
                      <motion.span
                        className="font-medium text-white 
                                  text-[1vw] lg:text-[0.7vw] 
                                  opacity-100 tracking-tight leading-none pointer-events-none"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                        whileHover={{ scale: 1.05 }}
                      >
                        Visit Market
                        <img
                          src="/icon/icon2.png"
                          alt="arrow right"
                          className="inline 
                                    w-[1vw] lg:w-[0.8vw] 
                                    h-[1vw] lg:h-[0.8vw] 
                                    ml-[0.3vw] object-contain"
                        />
                      </motion.span>
                    </Button>
                  </motion.div>

                  {/* Desktop Mask Group Image */}
                  <motion.img
                    className="hidden lg:block absolute bottom-0 left-0 
                              w-[55vw] h-auto max-h-[20vh] 
                              z-[-1] opacity-50 object-contain"
                    alt="Mask group desktop"
                    src={game.maskGroup}
                    initial={{ opacity: 0, y: 20, scale: 1 }}
                    whileInView={{ opacity: 0.5, y: 0, scale: 1 }}
                    transition={{ delay: gameIndex * 0.1 + 0.8, duration: 0.8 }}
                    viewport={{ once: true }}
                  />

                  {/* Mobile Mask Group Image */}
                  <motion.img
                    className="block lg:hidden absolute bottom-0 left-0 
                              w-[70vw] h-auto max-h-[10vh] 
                              z-[-1] opacity-50 "
                    alt="Mask group mobile"
                    src={game.maskGroup}
                    initial={{ opacity: 0, y: 20, scale: 1 }}
                    whileInView={{ opacity: 0.5, y: 0, scale: 1 }}
                    transition={{ delay: gameIndex * 0.1 + 0.8, duration: 0.8 }}
                    viewport={{ once: true }}
                  />
                </CardContent>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};