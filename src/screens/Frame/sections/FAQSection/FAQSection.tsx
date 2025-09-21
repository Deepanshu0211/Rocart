import { useState } from "react";

export const FAQSection = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  const faqData = [
    {
      id: "item-1",
      question: "Is Rocart a trusted place to buy game items?",
      answer:
        "Yes, Rocart is a secure and trusted marketplace for gaming items. We use advanced security measures, SSL encryption, and have a verified seller system to ensure safe transactions for all our users.",
    },
    {
      id: "item-2",
      question: "What if I don't receive my items after purchasing?",
      answer:
        "If you don't receive your items within the specified delivery time, contact our 24/7 support team immediately. We offer full refunds or instant replacements for undelivered items with our buyer protection guarantee.",
    },
    {
      id: "item-3",
      question: "What is your refund policy?",
      answer:
        "We offer a comprehensive 30-day refund policy for unused items. Digital items can be refunded within 24 hours if not redeemed. Physical items can be returned in original condition with free return shipping.",
    },
    {
      id: "item-4",
      question: "Can I trade my in-game items for items on Rocart?",
      answer:
        "Absolutely! Our advanced trading system allows you to exchange your valuable in-game items for other items or store credit. Simply list your items, set your preferences, and connect with verified traders worldwide.",
    },
    {
      id: "item-5",
      question: "How do I receive my purchased items?",
      answer:
        "Digital items are delivered instantly to your account or email within seconds of purchase. Physical items are shipped via express delivery to your address. You'll receive real-time tracking information for all orders.",
    },
    {
      id: "item-6",
      question: "Can I get free items?",
      answer:
        "Yes! We regularly offer free items through daily login rewards, seasonal events, tournaments, giveaways, and our referral program. Follow us on social media and check our promotions page for the latest free drops!",
    },
  ];

  return (
    <section className="w-full py-16 md:py-20 lg:py-24 bg-[#030804] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight mb-4 font-['Poppins',sans-serif]">
            <span className="text-white">Have </span>
            <span className="text-[#3dff87]">Questions? We Got You!</span>
          </h2>
          <p className="font-medium text-[#999999] text-base md:text-lg tracking-wide leading-relaxed font-['Poppins',sans-serif] max-w-lg mx-auto">
            Got questions? We've got answers!
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {faqData.map((faq) => {
            const isOpen = openItem === faq.id;

            return (
              <div key={faq.id} className="group">
                {/* FAQ Item */}
                <div
                  className={`
                  relative rounded-2xl border transition-all duration-500 ease-out overflow-hidden
                  ${
                    isOpen
                      ? "border-[#3dff87] shadow-[0_0_40px_rgba(61,255,135,0.15)]"
                      : "border-[#ffffff20] hover:border-[#3dff8750]"
                  }
                  bg-gradient-to-br from-[#0a1a0f] to-[#0e1f14]
                `}
                >
                  {/* Question Button */}
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-8 py-6 text-left focus:outline-none transition-all duration-300 hover:bg-gradient-to-br hover:from-[#0b1b10] hover:to-[#0f2015]"
                  >
                    <div className="flex items-center justify-between">
                      {/* Question Text */}
                      <span className="font-semibold text-white text-lg md:text-xl font-['Poppins',sans-serif] leading-relaxed pr-6">
                        {faq.question}
                      </span>

                      {/* Custom Icon */}
                      <div
                        className={`
                        w-12 h-12 rounded-[15px] flex items-center justify-center flex-shrink-0 transition-all duration-500 ease-out
                        ${
                          isOpen
                            ? "bg-[#3dff87] rotate-180 scale-110 shadow-[0_0_20px_rgba(61,255,135,0.4)]"
                            : "bg-[#ffffff10] group-hover:bg-[#ffffff15] group-hover:scale-105"
                        }
                      `}
                      >
                        <img
                          src="/icon/icon.png"
                          alt="toggle icon"
                          className={`w-10 h-10 transition-all duration-300 ${
                            isOpen ? "invert" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Answer Content */}
                  <div
                    className={`
                      transition-all duration-700 ease-out overflow-hidden
                      ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                    `}
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.25, 0.8, 0.25, 1)",
                    }}
                  >
                    {/* Separator Line */}
                    <div className="px-8">
                      <div
                        className={`
                        w-full h-px bg-gradient-to-r from-transparent via-[#3dff8730] to-transparent transition-all duration-500
                        ${isOpen ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}
                      `}
                      ></div>
                    </div>

                    {/* Answer Text */}
                    <div className="px-8 pb-8 pt-6">
                      <p
                        className={`
                        text-[#cccccc] font-normal text-base md:text-lg font-['Poppins',sans-serif] leading-relaxed transition-all duration-700 ease-out
                        ${
                          isOpen
                            ? "translate-y-0 opacity-100 delay-200"
                            : "translate-y-4 opacity-0"
                        }
                      `}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .group {
          animation: slideIn 0.6s ease-out forwards;
        }
        
        .group:nth-child(1) { animation-delay: 0ms; }
        .group:nth-child(2) { animation-delay: 100ms; }
        .group:nth-child(3) { animation-delay: 200ms; }
        .group:nth-child(4) { animation-delay: 300ms; }
        .group:nth-child(5) { animation-delay: 400ms; }
        .group:nth-child(6) { animation-delay: 500ms; }
      `}</style>
    </section>
  );
};
