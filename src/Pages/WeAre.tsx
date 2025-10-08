import { motion } from "framer-motion";
import React from "react";

const WeAre: React.FC = () => {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
  });

  return (
    <div className="min-h-screen from-[#06100A] to-[#0B1510] text-gray-300 py-16 px-2 sm:px-4">
      <div
        className="absolute inset-0 
          bg-[url('/bg/mesh.png')] bg-contain bg-repeat
          opacity-90 pointer-events-none 
          from-[#06100A] via-transparent to-[#2A2A2A]
        "
        style={{
          backgroundSize: "100% auto",
          backgroundPosition: "bottom 0%",
        }}
      />
      {/* Header */}
      <motion.div
        {...fadeUp(0)}
        className="max-w-5xl mx-auto text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          We Are Not Affiliated with Roblox Corporation<br></br> Big Games or
          Uplift Games
        </h1>

        <p className="text-xs  text-gray-500">
          RoCart.com is not affiliated, associated, or partnered with Roblox
          Corporation, Big Games, Uplift Games, or any other game developers in
          any way. <br></br>
          RoCart.com is an independent platform for digital skins & item sales
          and is not authorized, endorsed, or sponsored by Roblox Corporation,
          <br></br>
          Big Games, Uplift Games or any of their affiliates. All trademarks and
          copyrights belong to their respective owners.
        </p>
      </motion.div>

      {/* Grid of Q&A */}
      <motion.div
        {...fadeUp(0.2)}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {/* Left Column */}
        <div className="space-y-4">
          <div className="rounded-2xl   p-6">
            <h2 className="text-md font-semibold text-[#FFFFFF] mb-3">
              What is Grow a Garden and why do players want seeds and gears?
            </h2>
            <p className="text-[#ffffffb3] text-xs leading-relaxed">
              Grow a Garden is a massively popular Roblox farming game where
              players cultivate crops, collect pets, and build their dream
              gardens.  Seeds are essential items that let you grow different
              crops with varying growth times and profit potential.
               Gears provide important bonuses like faster growth rates and
              better harvest yields. Players eagerly seek rare seeds and
              powerful gears because they dramatically increase farming
              efficiency and profits. The game's unique mutation system also
              means certain seeds can evolve into valuable variants under
              special conditions, making seed collection an exciting part of the
              gameplay.
            </p>
          </div>

          <div className="rounded-2xl p-6">
            <h2 className="text-md font-semibold text-[#FFFFFF] mb-3">
              Where is the best place to buy Grow a Garden items?
            </h2>
            <p className="text-[#ffffffb3] text-xs leading-relaxed">
              The best place to buy Grow a Garden items is Rocart's GAG shop,
              which offers secure transactions and instant delivery of seeds,
              gears, and pets. Bloxcart provides competitive prices on
              everything from basic starter packs to rare mutated seeds and
              limited-time items. Players choose Bloxcart because it eliminates
              the grind of saving up in-game currency or waiting for special
              events to get premium items. With reliable 24/7 service and a
              trusted delivery system, Bloxcart has become the go-to marketplace
              for Grow a Garden players looking to expand their farming
              capabilities quickly and safely.
            </p>
          </div>

          <div className="rounded-2xl p-6">
            <h2 className="text-md font-semibold text-[#FFFFFF] mb-3">
              How do mutations work in Grow a Garden?
            </h2>
            <p className="text-[#FFFFFFb3] text-xs leading-relaxed">
              Mutations in Grow a Garden are special variants of regular crops
              that can occur under specific conditions. These mutations happen
              randomly during growth, especially during events like the 'Blood
              Moon' or seasonal festivities. Mutated crops sell for premium
              prices and often have unique appearances or special properties.
              While mutations can occur naturally, the process is very random
              and time-consuming. Many players choose to buy pre-mutated seeds
              from Bloxcart's shop to guarantee access to these valuable
              variants. This lets them immediately start growing high-value
              crops instead of waiting and hoping for lucky mutations.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="rounded-2xl p-6">
            <h2 className="text-md font-semibold text-[#FFFFFF] mb-3">
              Is it safe to buy Grow a Garden items from RoCart?
            </h2>
            <p className="text-[#FFFFFFb3] text-xs leading-relaxed">
              Yes, buying Grow a Garden items from Rocart is completely safe and
              secure. The platform uses trusted payment methods and a reliable
              delivery system that has completed thousands of successful
              transactions. Rocart's delivery works through legitimate in-game
              trading – after purchase, you'll receive instructions to join a
              private server where their delivery system will trade you the
              exact items you ordered. No account sharing or risky methods are
              ever used. The shop has built a strong reputation in the Grow a
              Garden community for reliable service, with 24/7 customer
              support available if you need assistance.
            </p>
          </div>

          <div className="rounded-2xl p-6">
            <div className="text-[#FFFFFFb3] leading-relaxed space-y-3">
              <h2 className="text-md font-semibold text-white mb-3">
                What are the most valuable items in Grow a Garden?
              </h2>
              <h3 className="text-[#FFFFFFb3] font-semibold text-xs">
                In Grow a Garden, several items stand out as particularly
                valuable:
              </h3>
              <ul className="list-disc ml-8 space-y-1">
                <li>
                  <span className="text-[#FFFFFFb3] font-semibold text-xs">
                    Rare Mutated Seeds:
                  </span>{" "}
                  Special variants like Blood Moon mutations or seasonal
                  exclusives that produce high-value crops
                </li>
                <li>
                  <span className="text-[#FFFFFFb3] font-semibold text-xs">
                    Premium Gears:
                  </span>{" "}
                  Top-tier tools that significantly boost farming efficiency and
                  harvest yields
                </li>
                <li>
                  <span className="text-[#FFFFFFb3] font-semibold text-xs">
                    Limited Pets:
                  </span>{" "}
                  Special companions that provide unique bonuses to growth rates
                  and profits
                </li>
                <li>
                  <span className="text-[#FFFFFFb3] font-semibold text-xs">
                    Event Items:
                  </span>{" "}
                  Exclusive items from special events that often have powerful
                  effects
                </li>
              </ul>
              <h3 className="text-[#FFFFFFb3] font-semibold text-xs">
                These items are highly sought after because they can
                dramatically improve your farming operation. While they can be
                obtained through regular gameplay, many players choose to
                purchase them directly from Rocart to save time and guarantee
                access to these game-changing items.
              </h3>
            </div>
          </div>

          <div className="rounded-2xl p-6">
            <div className="text-[#FFFFFFb3] leading-relaxed space-y-3">
              <h2 className="text-md font-semibold text-white mb-3">
                How does Rocart's Grow a Garden delivery work?
              </h2>

              <h3 className="text-[#FFFFFFb3] font-semibold text-xs">
                Rocart's Grow a Garden delivery process is quick and
                straightforward:
              </h3>

              <ol className="list-decimal ml-8 space-y-1 text-xs ">
                <li>
                  Select and purchase your desired seeds, gears, or pets from
                  the GAG section
                </li>
                <li>
                  Enter your Roblox username during checkout for delivery
                  identification
                </li>
                <li>
                  Follow the delivery instructions that appear after purchase
                </li>
                <li>Join the private server when prompted</li>
                <li>
                  Accept the trade request to receive your items directly into
                  your inventory
                </li>
              </ol>

              <h3 className="text-[#FFFFFFb3] font-semibold text-xs">
                The entire process typically takes just a few minutes from
                purchase to delivery. Rocart's system is designed to be
                efficient and secure, ensuring you get your new Grow a Garden
                items quickly so you can start using them to improve your farm
                right away.
              </h3>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WeAre;
