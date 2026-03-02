import React from 'react';
import { motion } from 'framer-motion';
import { School, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Partnerships() {

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const partnerTypes = [
    {
      icon: School,
      title: 'Schools',
      description: 'Partner with us to bring psychological resilience training directly to your students.'
    },
    {
      icon: Users,
      title: 'Youth Development Organisations',
      description: 'Join forces with organisations aligned with youth development and mental wellness.'
    },
    {
      icon: Heart,
      title: 'Individual Supporters',
      description: 'Support the mission through donations or volunteer your expertise.'
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
            Partner With Epsy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg leading-relaxed"
            style={{ color: 'var(--epsy-slate-blue)' }}
          >
            We partner with schools, organisations, and individuals who believe in the goal Epsy is working toward — helping students strengthen their mentality and prepare for life mentally before life challenges them outwardly.
          </motion.p>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.h2
            {...fadeInUp}
            className="text-3xl font-bold mb-12 text-center"
            style={{ color: 'var(--epsy-charcoal)' }}
          >
            Partnership Opportunities
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {partnerTypes.map((partner, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="p-8 rounded-2xl"
                style={{ backgroundColor: 'var(--epsy-off-white)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--epsy-sky-blue)' }}
                >
                  <partner.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--epsy-charcoal)' }}>
                  {partner.title}
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--epsy-slate-blue)' }}>
                  {partner.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: 'var(--epsy-off-white)' }}>
        <div className="max-w-2xl mx-auto px-6 lg:px-12 text-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: 'var(--epsy-charcoal)' }}>
              Support the Mission
            </h2>

            <Button
              size="lg"
              className="text-white font-medium px-12 py-6 rounded-xl transition-all duration-300 hover:shadow-lg text-base"
              style={{ backgroundColor: 'var(--epsy-sky-blue)' }}
              onClick={() => window.open('#', '_blank')}
            >
              Donate Now
            </Button>

            <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--epsy-slate-blue)' }}>
              Your donation supports the development of EpsyApp, the creation of structured psychological learning resources, and outreach to more schools.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}