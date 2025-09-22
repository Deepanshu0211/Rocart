import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { motion } from "framer-motion";

const gameItems = [
  {
    name: "Chroma Evergun",
    image: "/10-1.png",
    maskImage: "/mask-group.png",
    bgGradient:
      "linear-gradient(180deg,rgba(61,255,136,1)_0%,rgba(19,52,32,1)_100%)",
    badgeColor: "#3dff87",
    top: "64%",
    left: "0%",
    rotation: "",
  },
  {
    name: "Control Fruit",
    image: "/permanent-control-fruit-1.png",
    maskImage: "/mask-group-1.png",
    bgGradient:
      "linear-gradient(180deg,rgba(63,109,247,1)_0%,rgba(0,17,67,1)_100%)",
    badgeColor: "#3f6df7",
    top: "32%",
    left: "72%",
    rotation: "rotate-[49.57deg]",
  },
  {
    name: "Gold disco Bee",
    image:
      "/rn-image-picker-lib-temp-303cba6c-796b-4321-adb9-f934f27de874-1.png",
    maskImage: "/mask-group-2.png",
    bgGradient:
      "linear-gradient(180deg,rgba(239,0,85,1)_0%,rgba(47,0,17,1)_100%)",
    badgeColor: "#ef0055",
    top: "5%",
    left: "16%",
    rotation: "rotate-[-20.90deg]",
  },
];

export const WelcomeBannerSection = (): JSX.Element => {
  return (
    <section className="relative w-full h-[75%] overflow-hidden">
      {/* Base background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/bg/ho.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "rotate(0deg)",
        }}
      />
      
      {/* Your custom image layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/bg/image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
        }}
      />
      
      {/* Gradient overlay */}
      {/* <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(61,255,136,0.3), rgba(0,0,0,1))",
        }}
      /> */}

      {/* Bottom Gradient Line */}
      <div
        className="absolute bottom-0 left-0 w-full h-1"
        style={{
          background: "linear-gradient(to right, #3DFF87, #000000)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 px-8 py-16 max-w-7xl mx-auto">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Buy Your Favorite Items
              <br />
              <span className="text-[#3dff87]">Fast, Safe, and Easy</span>
              <br />
              with Rocart!
            </h1>

            <p className="font-normal text-[#c8c8c8] text-[17px] leading-normal mb-8">
              Rocart the fastest, safest shop for in-game items with automated
              delivery. <br />
              Get what you need in seconds.
              <br />
              For items in Murder Mystery 2,&nbsp;&nbsp;Grow a Garden, Blox
              Fruits, Steal a Brainrot, Blade Ball.
            </p>
            <Button className="h-auto bg-transparent p-0 hover:bg-transparent border-none shadow-none">
              <div className="w-[170px] h-[50px] rounded-[18px] bg-gradient-to-r from-[#3dff87] to-[#25a651] flex items-center justify-center relative overflow-hidden group hover:from-[#45ff91] hover:to-[#2bb85a] transition-all duration-800">
                <img
                  className="absolute left-4 w-6 h-6 z-10"
                  alt="Cart icon"
                  src="/mask-group-3.png"
                />
                <span className="font-bold text-white text-[15px] ml-4 z-10">
                  Start Buying
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </div>
            </Button>
          </div>
        </div>

        {/* Right Content - Character + Floating Items */}
        <div className="flex-1 relative aspect-[4/3] max-w-[630px] mx-auto">
          {/* Main Character */}
          <img
            className="absolute top-[200px] left-[30%] w-[45%] h-auto object-contain"
            alt="Character"
            src="/073bb3b399c740a024f6d5bff073254ed283398d-2-690x388-efb76d42-17d1.png"
          />

          {/* Floating Game Items */}
          {gameItems.map((item, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{
                top: item.top,
                left: item.left,
                width: "28%",
                height: "28%",
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3 + index,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Card className="relative top-[60px] w-full h-full bg-transparent border-none">
                <CardContent className="p-0 relative w-full h-full">
                  {/* Background gradient */}
                  <div
                    className="absolute inset-0 rounded-[22px] opacity-[0.12] -rotate-45"
                    style={{ background: item.bgGradient }}
                  />

                  {/* Item Image */}
                  <img
                    className={`absolute inset-0 w-[70%] h-[70%] m-auto object-contain ${item.rotation}`}
                    alt={item.name}
                    src={item.image}
                  />

                  {/* Badge */}
                  <div
                    className="absolute bottom-[20%] right-[10%] w-[21px] h-[22px] rounded-[7px] -rotate-45"
                    style={{ backgroundColor: item.badgeColor }}
                  />

                  {/* Badge Icon */}
                  <img
                    className="absolute bottom-[20%] right-[10%] w-[17px] h-[17px]"
                    alt="Badge icon"
                    src={item.maskImage}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};