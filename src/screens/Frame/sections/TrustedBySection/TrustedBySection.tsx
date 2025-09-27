import { motion } from "framer-motion";

import { Card, CardContent } from "../../../../components/ui/card";

export const TrustedBySection = (): JSX.Element => {
  const testimonials = [
    {
      id: 1,
      name: "Melony J.",
      testimonial: "Best process! Super smooth, got my items fast for cheap!",
      verified: true,
      avatar: "/avatars/melony.png",
    },
    {
      id: 2,
      name: "Sarah K.",
      testimonial: "Amazing service! Super smooth, got my items fast for cheap!",
      verified: true,
      avatar: "/avatars/sarah.png",
    },
    {
      id: 3,
      name: "David M.",
      testimonial: "Best process! Super smooth, got my items fast for cheap!",
      verified: true,
      avatar: "/avatars/david.png",
    },
    {
      id: 4,
      name: "Alex R.",
      testimonial: "Best process! Super smooth, got my items fast for cheap!",
      verified: false,
      avatar: "/avatars/alex.png",
    },
    {
      id: 5,
      name: "Jessica L.",
      testimonial: "Incredible selection and lightning-fast delivery! Exactly what I needed for my gaming setup.",
      verified: true,
      avatar: "/avatars/jessica.png",
    },
    {
      id: 6,
      name: "Michael B.",
      testimonial: "Top-tier customer support and quality items. Been using Rocart for months now!",
      verified: true,
      avatar: "/avatars/michael.png",
    },
    {
      id: 7,
      name: "Emma T.",
      testimonial: "Never had any issues, always reliable. Great prices and authentic items every time.",
      verified: true,
      avatar: "/avatars/emma.png",
    },
    {
      id: 8,
      name: "Ryan C.",
      testimonial: "Game-changing service! Quick transactions and fair pricing. Highly recommend to everyone.",
      verified: false,
      avatar: "/avatars/ryan.png",
    },
  ];

  const StarRating = () => (
    <div className="flex gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 0L7.854 4.146H12L8.573 6.708L10.427 10.854L6 8.292L1.573 10.854L3.427 6.708L0 4.146H4.146L6 0Z" fill="#3DFF87"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section className="relative w-full bg-[#030804] bg-[url('/bg/pattern.png')] bg-repeat py-16 scrollbar-none">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center md:text-left md:flex md:items-start md:justify-between mb-12">
          <div>
            <motion.h2 
              className="text-white text-4xl font-bold mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Trusted with by <span className="text-[#3DFF87]">1,500+</span> Happy Buyers
            </motion.h2>
            <motion.p 
              className="text-[#999999] text-sm max-w-2xl leading-relaxed text-center md:text-left"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Join thousands of happy buyers who trust Rocart for their in-game items!<br />
              From casual players to serious collectors, our customers keep coming back for quality and reliability. See some of our amazing supporters below:
            </motion.p>
          </div>

          {/* Rating Card */}
          <motion.div
            className="bg-[#0A1A0F] rounded-2xl px-6 py-4 border border-[#2A2A2A] inline-block md:min-w-[200px]"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex gap-1 mb-2 justify-center md:justify-start">
               <img src="/icon/fourstart.png" alt="star" className=" h-4 object-contain" />
            </div>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="text-[#3DFF87] font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Amazing 4.5
              </span>
              <span className="text-[#999999] text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                out of 5.0
              </span>
            </div>
          </motion.div>
        </div>

        {/* Testimonials */}
          <div className="relative overflow-hidden">
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030804] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030804] to-transparent z-10 pointer-events-none" />

            {/* Scrolling Row */}
            <motion.div
              className="flex gap-6"
              animate={{ 
                x: [0, -((testimonials.length * (280 + 24)))] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 30, 
                ease: "linear",
                repeatType: "loop"
              }}
              style={{ willChange: "transform" }}
            >
              {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                <Card
                  key={index}
                  className="bg-[#0A1A0F] border-[#2A2A2A] rounded-2xl min-w-[280px] hover:border-[#3DFF87]/30 transition-colors duration-300"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <StarRating />
                      {testimonial.verified && (
                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 0L9.798 5.202H15.607L11.005 8.596L12.803 13.798L8 10.404L3.197 13.798L4.995 8.596L0.393 5.202H6.202L8 0Z" fill="#3DFF87"/>
                          </svg>
                          <span className="text-[#3DFF87] text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Verified
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#3DFF87]/20"
                      />
                      <h3 className="text-white font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {testimonial.name}
                      </h3>
                    </div>
                    
                    <p className="text-[#CCCCCC] text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {testimonial.testimonial}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>

      </div>
    </section>
  );
};