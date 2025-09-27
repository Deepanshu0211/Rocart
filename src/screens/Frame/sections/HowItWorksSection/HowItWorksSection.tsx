import { Card, CardContent } from "../../../../components/ui/card";
import { motion } from "framer-motion";

export const HowItWorksSection = (): JSX.Element => {
  const steps = [
    {
      id: 1,
      title: "Choose Your Game",
      description:
        "Begin by selecting the game you're interested in, such as Murder Mystery 2, Grow a Garden, steal a brainrot or bladeball.",
      bgColor: "bg-[#1b1028]",
      borderColor: "border-[#d13bff]",
      icon: "/benefit/game.png", // replace with your path
    },
    {
      id: 2,
      title: "Follow the Tutorial",
      description:
        "Choose a product you like, add it to your cart, and proceed to checkout. After completing your purchase, send us your Roblox username. Our staff will message you shortly and deliver your items in-game.",
      bgColor: "bg-[#0f1827]",
      borderColor: "border-[#31a6ff]",
      icon: "/benefit/1.png",
    },
    {
      id: 3,
      title: "Instant Delivery",
      description:
        "Every order is handled with priority and care, ensuring your items reach your account swiftly. A short wait, and you’ll be ready to enjoy them.",
      bgColor: "bg-[#0e2514]",
      borderColor: "border-[#3dff87]",
      icon: "/benefit/instant.png",
    },
    {
      id: 4,
      title: "24/7 Support",
      description:
        "If you have any questions or encounter any issues, our friendly support team is available around the clock to assist you.",
      bgColor: "bg-[#250e0e]",
      borderColor: "border-[#ff3c3c]",
      icon: "/benefit/sup.png",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8, rotateY: -15 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.2, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full py-16 bg-[url('/bg/pattern.png')] bg-repeat bg-[#06100A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Title Section */}
        <motion.div
          className="text-center mb-16"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="[font-family:'Poppins',Helvetica] font-bold text-white text-4xl lg:text-5xl tracking-[-0.02em] leading-tight mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            How <span className="text-[#3dff87]">Rocart</span> Works?
          </motion.h2>
          <motion.p
            className="[font-family:'Poppins',Helvetica] font-medium text-[#999999] text-base lg:text-lg tracking-[0] leading-relaxed max-w-4xl mx-auto"
            variants={descriptionVariants}
          >
            Buying Items on RoCart is designed to be simple, fast, and reliable!
            <br />
            Here's how you can get started
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={cardVariants}
              whileHover={{
                scale: 1.02,
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="relative"
            >
              <Card
                className={`${step.bgColor} ${step.borderColor} border border-solid rounded-[26px] h-[140px] overflow-hidden group`}
                style={{
                  boxShadow: `0 0 20px ${
                    step.borderColor.includes("3dff87")
                      ? "#3dff8720"
                      : step.borderColor.includes("31a6ff")
                      ? "#31a6ff20"
                      : step.borderColor.includes("d13bff")
                      ? "#d13bff20"
                      : "#ff3c3c20"
                  }`,
                }}
              >
                <CardContent className="p-6 h-">
                  <div className="flex items-start gap-4 h-full">
                    {/* Icon */}
                    <motion.div
                      className="flex-shrink-0 p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.2 + 0.4,
                        duration: 0.4,
                      }}
                    >
                      <motion.img
                        src={step.icon}
                        alt={step.title}
                        className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </motion.div>

                    {/* Content */}
                    <div className="flex flex-col justify-center flex-grow">
                      <motion.h3
                        className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[15px] tracking-[0] leading-[normal] mb-1 group-hover:text-opacity-90 transition-all duration-300"
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.2 + 0.5,
                          duration: 0.3,
                        }}
                      >
                        {step.title}
                      </motion.h3>
                      <motion.p
                        className="[font-family:'Poppins',Helvetica] font-medium text-[#d9d9d9] text-[12px] tracking-[0] leading-relaxed whitespace-pre-line group-hover:text-white/90 transition-all duration-300"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.2 + 0.6,
                          duration: 0.3,
                        }}
                      >
                        {step.description}
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
