import React from 'react';
import { motion } from 'framer-motion';
import { Library, Search, MessageSquare } from 'lucide-react';

export default function EpsyApp() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: Library,
      title: 'Psychological Insight Library',
      description: 'Content curated and uploaded by Epsy covering real challenges students face.',
      details: [
        'Topics: Bullying, imposter syndrome, exam anxiety, friend groups, gifts and talents, procrastination, fear of failure',
        'Each topic includes: Why this happens, How to reframe, If you ignore, If you act, Practical steps',
        'Daily Execution shows visible day-by-day growth, with detailed depth inside each specific day'
      ]
    },
    {
      icon: Search,
      title: 'Question Decoder',
      description: 'Content uploaded by Epsy to help students understand how exam questions are built.',
      details: [
        'Includes past paper examples',
        'Explains how exam questions are framed',
        'Embedded sections: How to Respond, How to Remember the Response'
      ]
    },
    {
      icon: MessageSquare,
      title: 'Question Builder',
      description: 'Structured guidance created by Epsy to help students ask clearer academic questions.',
      details: [
        'Step-by-step framework for building better questions',
        'Learn to identify what you actually need to know',
        'Develop critical thinking through question formation'
      ]
    }
  ];

  return (
    <div>
      {/* Header */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--epsy-off-white)' }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: 'var(--epsy-charcoal)' }}
          >
            EpsyApp
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg leading-relaxed"
            style={{ color: 'var(--epsy-slate-blue)' }}
          >
            EpsyApp is a structured student cognitive literacy and psychological resilience platform. It is not a chatbot. It is not therapy. It is a structured thinking and learning system.
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="p-8 lg:p-10 rounded-2xl"
                style={{ backgroundColor: 'var(--epsy-off-white)' }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--epsy-sky-blue)' }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--epsy-charcoal)' }}>
                      {feature.title}
                    </h3>
                    <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--epsy-slate-blue)' }}>
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: 'var(--epsy-sky-blue)' }}
                          />
                          <span className="text-sm leading-relaxed" style={{ color: 'var(--epsy-slate-blue)' }}>
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}