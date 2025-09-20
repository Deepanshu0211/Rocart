
import { Card, CardContent } from "../../../../components/ui/card";
import { motion } from "framer-motion";
import { Gamepad, BookOpen, Zap, Headphones } from "lucide-react";

export const HowItWorksSection = (): JSX.Element => {
  const steps = [
    {
      id: 1,
      title: "Choose Your Game",
      description:
        "Begin by selecting the game you're interested in such as\nMurder Mystery 2",
      bgColor: "bg-[#1b1028]",
      borderColor: "border-[#d13bff]",
      iconColor: "text-[#d13bff]",
      icon: Gamepad,
    },
    {
      id: 2,
      title: "Follow the Tutorial",
      description:
        "Begin by selecting the game you're interested in such as\nMurder Mystery 2",
      bgColor: "bg-[#0f1827]",
      borderColor: "border-[#31a6ff]",
      iconColor: "text-[#31a6ff]",
      icon: BookOpen,
    },
    {
      id: 3,
      title: "Instant Delivery",
      description:
        "Begin by selecting the game you're interested in such as\nMurder Mystery 2",
      bgColor: "bg-[#0e2514]",
      borderColor: "border-[#3dff87]",
      iconColor: "text-[#3dff87]",
      icon: Zap,
    },
    {
      id: 4,
      title: "24/7 Support",
      description:
        "Begin by selecting the game you're interested in such as\nMurder Mystery 2",
      bgColor: "bg-[#250e0e]",
      borderColor: "border-[#ff3c3c]",
      iconColor: "text-[#ff3c3c]",
      icon: Headphones,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8,
      rotateY: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4">
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
            How{" "}
            <span className=" text-[#3dff87] ">
              Rocart
            </span>{" "}
            Works?
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
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.id}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02,
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="relative"
              >
                {/* Step Number Badge */}
               

                <Card
                  className={`${step.bgColor} ${step.borderColor} border border-solid rounded-[26px] h-[140px] overflow-hidden group`}
                  style={{
                    boxShadow: `0 0 20px ${step.borderColor.includes('#3dff87') ? '#d13bff20' : 
                               step.borderColor.includes('31a6ff') ? '#31a6ff20' :
                               step.borderColor.includes('3dff87') ? '#3dff8720' : '#ff3c3c20'}`
                  }}
                >
                  <CardContent className="p-6 h-full">
                    <div className="flex items-start gap-4 h-full">
                      {/* Icon */}
                      <motion.div 
                        className="flex-shrink-0 p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300"
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + 0.4, duration: 0.4 }}
                      >
                        <IconComponent 
                          className={`w-6 h-6 ${step.iconColor} group-hover:animate-pulse`}
                          strokeWidth={2}
                        />
                      </motion.div>

                      {/* Content */}
                      <div className="flex flex-col justify-center flex-grow">
                        <motion.h3 
                          className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[15px] tracking-[0] leading-[normal] mb-2 group-hover:text-opacity-90 transition-all duration-300"
                          initial={{ opacity: 0, y: -10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 + 0.5, duration: 0.3 }}
                        >
                          {step.title}
                        </motion.h3>
                        <motion.p 
                          className="[font-family:'Poppins',Helvetica] font-medium text-[#d9d9d9] text-[12px] tracking-[0] leading-relaxed whitespace-pre-line group-hover:text-white/90 transition-all duration-300"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 + 0.6, duration: 0.3 }}
                        >
                          {step.description}
                        </motion.p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Connecting Lines Animation (Optional Visual Enhancement) */}
        <motion.div 
          className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-32 pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 1 }}
        >
          <svg className="w-full h-full" viewBox="0 0 800 200">
            <motion.path
              d="M200 60 Q400 20 600 60 M200 140 Q400 180 600 140"
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2, duration: 2 }}
            />
        
          </svg>
        </motion.div>
      </div>
    </section>
  );
};
