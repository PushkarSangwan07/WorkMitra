import { useState } from 'react';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'collection', title: '1. Information Collection' },
  { id: 'usage', title: '2. How We Use Data' },
  { id: 'sharing', title: '3. Data Sharing' },
  { id: 'security', title: '4. Data Security' },
  { id: 'rights', title: '5. Your Rights' },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  return (
<div className="bg-zinc-50 dark:bg-[#030303] min-h-screen w-full max-w-[100vw] overflow-x-hidden text-zinc-900 dark:text-zinc-50 font-sans selection:bg-orange-500/30 selection:text-white relative pt-20 pb-32">
      
      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center overflow-hidden">
        <div className="absolute top-0 w-full max-w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 max-w-[90rem] mx-auto px-6 pt-32 md:pt-48">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/5 mb-6">
            <span className="text-[10px] font-bold tracking-widest text-zinc-600 dark:text-zinc-400 uppercase">
              Last Updated: August 2026
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6">
            Privacy Policy.
          </h1>
          <p className="text-lg md:text-xl font-medium text-zinc-500 dark:text-zinc-400">
            Your privacy is not an afterthought; it is engineered into our architecture. This document explains how we collect, process, and protect your data.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative">
          
          {/* Sticky Table of Contents */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32">
              <p className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-6">Contents</p>
              <nav className="flex flex-col gap-1 border-l border-zinc-200 dark:border-zinc-800">
                {SECTIONS.map((section) => (
                  <a 
                    key={section.id} 
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={`pl-4 py-2 text-sm font-semibold transition-colors border-l-2 ${
                      activeSection === section.id 
                        ? 'border-orange-500 text-orange-500' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 max-w-3xl">

             {/* TL;DR Card */}
             <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 md:p-8 bg-zinc-100 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-white/5 mb-16"
            >
              <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-3">Core Principles</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <li>We only collect data necessary to match you with professionals or clients.</li>
                <li>We <span className="text-zinc-900 dark:text-white font-bold">never</span> sell your personal data to advertisers.</li>
                <li>Payment data is fully tokenized and handled by secure third-party processors.</li>
                <li>You can request the deletion of your account and personal data at any time.</li>
              </ul>
            </motion.div>

            <div className="space-y-20 text-zinc-600 dark:text-zinc-400 font-medium text-base md:text-lg leading-relaxed">
              
              <section id="collection" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">1. Information Collection</h2>
                <p className="mb-4">To operate the WorkMitra platform effectively, we collect the following types of information:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Account Data:</strong> Name, phone number, email address, and profile photo.</li>
                  <li><strong>Location Data:</strong> Zip code and service address to match customers with local professionals.</li>
                  <li><strong>Professional Data (Workers only):</strong> Government ID, trade certifications, and payout banking details.</li>
                  <li><strong>Platform Activity:</strong> Search queries, booking history, chat logs between users, and reviews.</li>
                </ul>
              </section>

              <section id="usage" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">2. How We Use Data</h2>
                <p className="mb-4">We use your information exclusively to provide, improve, and secure the WorkMitra ecosystem. Specifically, we use it to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Execute the matchmaking algorithm between customers and professionals.</li>
                  <li>Facilitate secure communication and escrow payments.</li>
                  <li>Investigate disputes, fraud, or safety incidents.</li>
                  <li>Send critical operational updates (e.g., booking confirmations).</li>
                </ul>
              </section>

              <section id="sharing" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">3. Data Sharing</h2>
                <p className="mb-4">We do not sell your personal data. We only share data in the following controlled scenarios:</p>
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-white/5 mb-4">
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Between Users</h4>
                  <p className="text-sm">When a booking is confirmed, we share the necessary details (customer address, worker profile) to allow the service to take place.</p>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-white/5">
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Service Providers</h4>
                  <p className="text-sm">We share data with secure third parties for payment processing (e.g., Stripe/Razorpay) and identity verification.</p>
                </div>
              </section>

              <section id="security" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">4. Data Security</h2>
                <p>
                  WorkMitra employs bank-level encryption, regular security audits, and strict access controls to protect your data. All data transmitted between your device and our servers is secured using TLS/SSL protocols. However, no digital transmission is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section id="rights" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">5. Your Rights</h2>
                <p className="mb-4">You have complete control over your digital footprint on WorkMitra:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Access & Modification:</strong> You can update your profile information at any time via your Dashboard.</li>
                  <li><strong>Deletion:</strong> You can request a complete deletion of your account and associated data by contacting support.</li>
                  <li><strong>Communication Preferences:</strong> You can opt out of non-essential marketing communications via your account settings.</li>
                </ul>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}