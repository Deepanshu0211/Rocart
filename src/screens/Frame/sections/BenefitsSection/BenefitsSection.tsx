import { Card, CardContent } from "../../../../components/ui/card";
import { motion } from "framer-motion";

export const BenefitsSection = (): JSX.Element => {
  const benefitCards = [
    {
      bgColor: "bg-[#250e0e]",
      borderColor: "border-[#ff3c3c]",
      icon: "/why/4.png",
      title: "Best Prices",
      description:
        "RoCart has the best prices, keeping everything cheap and easy so you can get the items you want without stress.",
    },
    {
      bgColor: "bg-[#0e2514]",
      borderColor: "border-[#3dff87]",
      icon: "/why/3.png",
      title: "Security",
      description:
        "Your Financial Security Is Our Top Priority. We Ensure Safe And Compliant Processing Of All Payments.",
    },
    {
      bgColor: "bg-[#1b1028]",
      borderColor: "border-[#cf25ff]",
      icon: "/why/2.png",
      title: "Support",
      description:
        "Our Dedicated Support Team Is Available To Assist You With Any Questions Or Concerns.",
    },
    {
      bgColor: "bg-[#0f1827]",
      borderColor: "border-[#31a6ff]",
      icon: "/why/1.png",
      title: "Wide Collection",
      description:
        "We offer a huge collection of Roblox items from MM2, Adopt Me, and many more.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full  py-16">
      <div
        className="absolute inset-0 bg-[url('/bg/mesh.png')]  bg-no-repeat bg-center opacity-100 pointer-events-none"
        style={{ backgroundSize: "120em auto", top: "20%" }}
      />

      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="[font-family:'Poppins',Helvetica] font-bold text-white text-4xl lg:text-5xl tracking-[-0.02em] leading-tight mb-6"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Why Choose <span className=" text-[#3dff87] ">Rocart</span>?
          </motion.h2>
          <p className="[font-family:'Poppins',Helvetica] font-medium text-[#999999] text-sm tracking-[0] leading-[normal] max-w-4xl mx-auto">
            Enjoy lightning - fast delivery, unbeatable prices, and a safe,
            secure shopping experience for all your
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            favorite Roblox item. Our dedicated support team is always here to
            help!
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {benefitCards.map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className={`${card.bgColor} ${card.borderColor} border border-solid rounded-[26px] h-[154px]`}
              >
                <CardContent className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <motion.h3
                        className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[13px] tracking-[0] leading-[normal]"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                      >
                        {card.title}
                      </motion.h3>
                      <motion.img
                        className="w-5 h-5 flex-shrink-0"
                        alt="Mask group"
                        src={card.icon}
                        initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                        whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.1 + 0.4,
                          duration: 0.4,
                          ease: "easeOut",
                        }}
                        whileHover={{
                          rotate: 10,
                          scale: 1.1,
                          transition: { duration: 0.2 },
                        }}
                      />
                    </div>
                    <motion.p
                      className="[font-family:'Poppins',Helvetica] font-medium text-[#d9d9d9] text-[11px] tracking-[0] leading-[normal] whitespace-pre-line"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                    >
                      {card.description}
                    </motion.p>
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
