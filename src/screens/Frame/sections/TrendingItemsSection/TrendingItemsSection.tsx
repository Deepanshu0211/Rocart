import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { motion } from "framer-motion";

const gameData = [
  {
    id: 1,
    title: "Grow A Garden",
    icon: "/gag-jqsy7lwj-1.png",
    maskGroup: "/mask-group-21.png",
    buttonGradient:
      "bg-[linear-gradient(90deg,rgba(6,16,10,1)_0%,rgba(44,118,74,1)_100%)]",
    items: [
      {
        name: "RACCOON",
        price: "$15",
        image: "/img-5467--1--1.png",
        priceColor: "text-[#3dff87]",
        cardGradient:
          "bg-[linear-gradient(178deg,rgba(6,16,10,0.3)_0%,rgba(44,118,73,0)_100%)]",
        borderGradient:
          "before:[background:linear-gradient(180deg,rgba(61,255,136,0.7)_0%,rgba(37,153,81,0)_100%)]",
      },
      {
        name: "QUEEN BEE",
        price: "$10",
        image: "/img-5478-1.png",
        priceColor: "text-[#ffd801]",
        cardGradient:
          "bg-[linear-gradient(178deg,rgba(6,16,10,0.3)_0%,rgba(118,113,44,0)_100%)]",
        borderGradient:
          "before:[background:linear-gradient(180deg,rgba(255,236,61,0.7)_0%,rgba(153,130,37,0)_100%)]",
      },
    ],
  },
  {
    id: 2,
    title: "MM2",
    icon: "/mm2-ddbykew2-2.png",
    maskGroup: "/mask-group-22.png",
    buttonGradient:
      "bg-[linear-gradient(90deg,rgba(16,7,6,1)_0%,rgba(145,19,19,1)_100%)]",
    items: [
      {
        name: "RACCOON",
        price: "$15",
        image: "/p11-1.png",
        priceColor: "text-[#ff3c3c]",
        cardGradient:
          "bg-[linear-gradient(178deg,rgba(16,6,6,0.3)_0%,rgba(151,41,41,0)_100%)]",
        borderGradient:
          "before:[background:linear-gradient(180deg,rgba(255,61,61,0.7)_0%,rgba(153,37,37,0)_100%)]",
      },
      {
        name: "GINGERSCOPE",
        price: "$10",
        image: "/65-1.png",
        priceColor: "text-[#be8832]",
        cardGradient:
          "bg-[linear-gradient(178deg,rgba(16,12,6,0.3)_0%,rgba(118,82,44,0)_100%)]",
        borderGradient:
          "before:[background:linear-gradient(180deg,rgba(255,161,61,0.7)_0%,rgba(153,112,37,0)_100%)]",
      },
    ],
  },
  {
    id: 3,
    title: "Steal A brainrot",
    icon: "/ttd-cljlmppy-2.png",
    maskGroup: "/mask-group-24.png",
    buttonGradient:
      "bg-[linear-gradient(90deg,rgba(13,6,16,1)_0%,rgba(108,44,118,1)_100%)]",
    items: [
      {
        name: "RACCOON",
        price: "$15",
        image: "/image-2-1.png",
        priceColor: "text-[#dd00ff]",
        cardGradient:
          "bg-[linear-gradient(178deg,rgba(12,6,16,0.3)_0%,rgba(116,44,118,0)_100%)]",
        borderGradient:
          "before:[background:linear-gradient(180deg,rgba(255,61,242,0.7)_0%,rgba(149,37,153,0)_100%)]",
      },
      {
        name: "QUEEN BEE",
        price: "$10",
        image: "/undefined---imgur-1.png",
        priceColor: "text-[#ff38f1]",
        cardGradient:
          "bg-[linear-gradient(178deg,rgba(16,6,13,0.3)_0%,rgba(118,44,96,0)_100%)]",
        borderGradient:
          "before:[background:linear-gradient(180deg,rgba(255,61,197,0.7)_0%,rgba(153,37,118,0)_100%)]",
      },
    ],
  },
  {
    id: 4,
    title: "Adopt Me",
    icon: "/am-yek4mbfs-1.png",
    maskGroup: "/mask-group-26.png",
    buttonGradient:
      "bg-[linear-gradient(90deg,rgba(6,13,16,1)_0%,rgba(40,134,205,1)_100%)]",
    items: [
      {
        name: "RACCOON",
        price: "$15",
        image: "/elephant-17-9fcc194d-4ed1-475f-9992-6ede479175b9-1.png",
        priceColor: "text-[#31a6ff]",
        cardGradient:
          "bg-[linear-gradient(178deg,rgba(6,12,16,0.3)_0%,rgba(44,86,118,0)_100%)]",
        borderGradient:
          "before:[background:linear-gradient(180deg,rgba(61,200,255,0.7)_0%,rgba(37,103,153,0)_100%)]",
      },
      {
        name: "QUEEN BEE",
        price: "$10",
        image: "/cow-12-04a274cd-d0f3-448a-8729-45826f64f935-1.png",
        priceColor: "text-white",
        cardGradient:
          "bg-[linear-gradient(178deg,rgba(24,24,24,0.3)_0%,rgba(164,164,164,0)_100%)]",
        borderGradient:
          "before:[background:linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(210,210,210,0)_100%)]",
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
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 80, 
    scale: 0.8,
    rotateY: -15
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      duration: 0.8,
      bounce: 0.4
    }
  }
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
      damping: 15
    }
  }
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
      bounce: 0.3
    }
  }
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { 
    scaleX: 1, 
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      delay: 0.5
    }
  }
};

export const TrendingItemsSection = (): JSX.Element => {
  return (
    <section className="relative w-full min-h-screen bg-[#030804] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Animated Lines */}
        <div className="relative mb-16">
          <motion.div 
            className="absolute top-8 -left-[40px] w-[35%] h-0.5 rounded-[0px_30px_42px_0px] bg-[linear-gradient(90deg,rgba(49,49,49,0)_0%,rgba(255,255,255,1)_100%)] "
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          />
          <motion.div 
            className="absolute top-8 -right-[40px] w-[35%] h-0.5 rounded-[50px_0px_0px_50px] bg-[linear-gradient(90deg,rgba(255,255,255,1)_0%,rgba(49,49,49,0)_100%)] "
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          />
        </div>

        {/* Title Section */}
        <motion.div 
          className="text-center mb-16"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent font-bold text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            Trending Now
          </motion.h2>
          <motion.p 
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Items gaining popularity right now.<br />
            Most users are active on their catalog pages.
          </motion.p>
        </motion.div>

        {/* Game Cards */}
        <motion.div 
          className="flex flex-wrap gap-8 justify-center items-end"
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
                transition: { type: 'spring', stiffness: 300, damping: 20 }
              }}
              className="group"
            >
              <AnimatedCard className="w-[280px] h-[380px] bg-[#030804] border border-[#2A2A2A] rounded-2xl shadow-2xl flex flex-col items-center relative overflow-hidden group-hover:border-[#3DFF87]/30 transition-colors duration-300">
                <CardContent className="flex flex-col items-center justify-start w-full h-full p-0 relative z-10">
                  
                  {/* Game Header */}
                  <motion.div 
                    className="w-full flex flex-col items-center pt-8 pb-4"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: gameIndex * 0.1 + 0.4, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <motion.img
                      className="w-8 h-8 rounded-lg object-cover mb-3 shadow-lg"
                      alt={game.title}
                      src={game.icon}
                      whileHover={{ 
                        scale: 1.2, 
                        rotate: 360,
                        transition: { duration: 0.6, type: "spring" }
                      }}
                    />
                    <motion.div 
                      className="w-full text-center font-bold text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {game.title}
                    </motion.div>
                  </motion.div>

                  {/* Items Grid */}
                  <motion.div 
                    className="flex gap-4 justify-center w-full mb-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {game.items.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className={`relative w-[110px] h-[140px] rounded-xl flex flex-col items-center bg-opacity-60 ${item.cardGradient} backdrop-blur-sm border border-white/10 group/item`}
                        whileHover={{ 
                          scale: 1.1, 
                          y: -8,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                          transition: { type: 'spring', stiffness: 300, damping: 20 }
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"
                        />
                        <AnimatedImg
                          className="mt-4 rounded-lg object-cover shadow-xl z-10"
                          style={{ width: 70, height: 70 }}
                          alt={item.name}
                          src={item.image}
                          whileHover={{ 
                            scale: 1.15, 
                            rotate: -5,
                            transition: { type: "spring", stiffness: 300 }
                          }}
                          animate={{ 
                            y: [0, -12, 0],
                            transition: { 
                              duration: 3 + index * 0.5, 
                              repeat: Infinity, 
                              ease: "easeInOut",
                              delay: index * 0.2
                            }
                          }}
                        />
                        <motion.div 
                          className="w-full text-center font-semibold text-xs mt-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent px-2"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {item.name}
                        </motion.div>
                        <motion.div 
                          className={`w-full text-center font-bold text-sm mt-1 ${item.priceColor} drop-shadow-lg`}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                          whileHover={{ scale: 1.1 }}
                          initial={{ opacity: 0, scale: 0.8 }}
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: gameIndex * 0.1 + 0.6, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Button
                      className={`mt-4 w-[140px] h-[40px] rounded-xl border-none ${game.buttonGradient} shadow-xl hover:shadow-2xl transition-shadow duration-300 group-hover:scale-105`}
                    >
                      <motion.span 
                        className="font-bold text-white text-sm tracking-wide leading-normal"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        whileHover={{ scale: 1.05 }}
                      >
                        Visit Market
                      </motion.span>
                    </Button>
                  </motion.div>

                 
                  {/* Background Mask */}
                  <motion.img
                    className="flex justify-center items-center absolute bottom-0 left-0 -translate-x-1/2 w-[810px] h-[69px] 
                      z-0 opacity-100 filter brightness-150"
                    alt="Mask group"
                    src={game.maskGroup}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: gameIndex * 0.1 + 0.8, duration: 0.8 }}
                    viewport={{ once: true }}
                  />

                </CardContent>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Decorative Elements */}
        <motion.div 
          className="mt-20 flex justify-center"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
        >
        
        </motion.div>
      </div>
    </section>
  );
};