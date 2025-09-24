import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { motion } from "framer-motion";

const gameData = [
  {
    id: 1,
    title: "Grow A Garden",
    icon: "/gag-jqsy7lwj-1.png",
    maskGroup: "/mask-group-21.png",
    buttonImage: "/buttonbg/1.png",
    items: [
      {
        name: "RACCOON",
        price: "$15",
        image: "/img-5467--1--1.png",
        priceColor: "text-[#3dff87]",
        backgroundImage: "/trendingbg/1.png",
      },
      {
        name: "QUEEN BEE",
        price: "$10",
        image: "/img-5478-1.png",
        priceColor: "text-[#ffd801]",
        backgroundImage: "/trendingbg/2.png",
      },
    ],
  },
  {
    id: 2,
    title: "MM2",
    icon: "/mm2-ddbykew2-2.png",
    maskGroup: "/mask-group-22.png",
    buttonImage: "/buttonbg/2.png",
    items: [
      {
        name: "RACCOON",
        price: "$15",
        image: "/p11-1.png",
        priceColor: "text-[#ff3c3c]",
        backgroundImage: "/trendingbg/3.png",
      },
      {
        name: "GINGERSCOPE",
        price: "$10",
        image: "/65-1.png",
        priceColor: "text-[#be8832]",
        backgroundImage: "/trendingbg/4.png",
      },
    ],
  },
  {
    id: 3,
    title: "Steal A brainrot",
    icon: "/logo/brain.png",
    maskGroup: "/mask-group-24.png",
    buttonImage: "/buttonbg/3.png",
    items: [
      {
        name: "RACCOON",
        price: "$15",
        image: "/image-2-1.png",
        priceColor: "text-[#dd00ff]",
        backgroundImage: "/trendingbg/5.png",
      },
      {
        name: "QUEEN BEE",
        price: "$10",
        image: "/undefined---imgur-1.png",
        priceColor: "text-[#ff38f1]",
        backgroundImage: "/trendingbg/6.png",
      },
    ],
  },
  {
    id: 4,
    title: "Adopt Me",
    icon: "/am-yek4mbfs-1.png",
    maskGroup: "/mask-group-26.png",
    buttonImage: "/buttonbg/4.png",
    items: [
      {
        name: "RACCOON",
        price: "$15",
        image: "/elephant-17-9fcc194d-4ed1-475f-9992-6ede479175b9-1.png",
        priceColor: "text-[#31a6ff]",
        backgroundImage: "/trendingbg/7.png",
      },
      {
        name: "QUEEN BEE",
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

export const TrendingItemsSection = () => {
  return (
    <section className="relative w-full min-h-screen bg-[#06100A] py-[5vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-[url('/bg/mesh.png')] bg-repeat opacity-90 pointer-events-none from-[#06100A] via-transparent to-[#2A2A2A]"
        style={{
          backgroundSize: "800px 800px",
          backgroundBlendMode: "overlay",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="max-w-[95vw] mx-auto px-[3vw] z-10">
        {/* Animated Lines */}
        <div className="relative mb-[10vh]">
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
            className="bg-gradient-to-r from-white via-gray-200 z-10 h-[12vh] to-gray-400 bg-clip-text text-transparent font-bold text-[6vw] sm:text-[5vw] lg:text-[4vw] mb-0"
            style={{ fontFamily: "Poppins, sans-serif" }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            Trending Now
          </motion.h2>
          <motion.p
            className="text-gray-300 text-[2.5vw] sm:text-[2vw] lg:text-[1.5vw] max-w-[80vw] mx-auto leading-relaxed"
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

        {/* Game Cards */}
        <motion.div
          className="flex flex-wrap gap-[1.5vw] justify-center items-end"
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
              className="group"
            >
              <AnimatedCard className="w-[22vw] sm:w-[22vw] lg:w-[18vw] h-[52vh] sm:h-[48vh] lg:h-[43vh] bg-[#030804] border border-[#2A2A2A] rounded-[2.5vw] shadow-2xl flex flex-col items-center relative overflow-hidden group-hover:border-[#3DFF87]/30 transition-colors duration-300">
                <CardContent className="flex flex-col items-center justify-start w-full h-full p-0 relative z-10">
                  {/* Game Header */}
                  <motion.div
                    className="w-auto gap-[1vw] flex flex-row items-center pt-[3vh] pb-[2vh]"
                    initial={{ opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: gameIndex * 0.1 + 0.4, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <motion.img
                      className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] object-cover mb-[1.5vh] shadow-lg"
                      alt={game.title}
                      src={game.icon}
                    />
                    <motion.div
                      className="w-full text-center font-bold text-[0.5vw] sm:text-[0.5vw] lg:text-[0.8vw] bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-[1vh]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {game.title}
                    </motion.div>
                  </motion.div>

                  {/* Items Grid */}
                  <motion.div
                    className="flex gap-[1.2vw] justify-center w-[20vw] mb-[4vh]"
                    variants={containerVariants}
                    initial="visible"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {game.items.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="relative w-[7vw] h-[22vh] sm:h-[20vh] lg:h-[18vh] rounded-[1.2vw] flex flex-col items-center backdrop-blur-sm border-none group/item"
                        style={{ backgroundImage: `url(${item.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
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
                      >
                        <motion.div className="absolute inset-0 rounded-[1.2vw] bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                        <AnimatedImg
                          className="mt-[2vh] rounded-[0.8vw] object-cover shadow-xl z-10"
                          style={{ width: "5vw", height: "5vw" }}
                          alt={item.name}
                          src={item.image}
                          whileHover={{
                            scale: 1.15,
                            rotate: -5,
                            transition: { type: "spring", stiffness: 300 },
                          }}
                        />
                        <motion.div
                          className="w-full text-left font-bold text-[1.3vw] sm:text-[1.1vw] lg:text-[0.9vw] mt-[3vh] bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent px-[0.8vw]"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                          initial={{ opacity: 1 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {item.name}
                        </motion.div>
                        <motion.div
                          className={`w-full text-left font-bold text-[1.1vw] sm:text-[1vw] lg:text-[0.8vw] mt-0 px-[0.8vw] ${item.priceColor} drop-shadow-lg`}
                          style={{ fontFamily: "Poppins, sans-serif" }}
                          initial={{ opacity: 1, scale: 1 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                        >
                          {item.price}
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Visit Market Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 1, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: gameIndex * 0.1 + 0.6, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Button
                      className="mt-[4vh] w-[8vw] h-[4vh] z-100 rounded-[0.8vw] group-hover:scale-105 transition-transform duration-300"
                      style={{ backgroundImage: `url(${game.buttonImage})`, backgroundSize: '100% 100%', backgroundPosition: 'center',  opacity: 1, border: 'none' }}
                    >
                      <motion.span
                        className="font-medium text-white text-[0.9vw] sm:text-[0.8vw] lg:text-[0.7vw] opacity-100 tracking-tight leading-none pointer-events-none"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                        whileHover={{ scale: 1.05 }}
                      >
                        Visit Market
                        <img
                          src="/icon/icon2.png"
                          alt="arrow right"
                          className="inline w-[0.8vw] h-[0.8vw] ml-[0.3vw] object-contain"
                        />
                      </motion.span>
                    </Button>
                  </motion.div>

                  {/* Background Mask */}
                  <motion.img
                    className="flex justify-center items-center absolute bottom-0 left-0 w-[70vw] h-[8vh] z-0 opacity-100 filter brightness-150"
                    alt="Mask group"
                    src={game.maskGroup}
                    initial={{ opacity: 1, scale: 1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
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