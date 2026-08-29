import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'platform', title: '2. The Platform' },
  { id: 'accounts', title: '3. User Accounts' },
  { id: 'payments', title: '4. Payments & Escrow' },
  { id: 'liability', title: '5. Limitation of Liability' },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  // Optional: Simple intersection observer logic could go here to update activeSection on scroll
  // For now, it relies on click-to-scroll.

  return (
   <div className="bg-zinc-50 dark:bg-[#030303] min-h-screen w-full max-w-[100vw] overflow-x-hidden text-zinc-900 dark:text-zinc-50 font-sans selection:bg-orange-500/30 relative pt-20 pb-32">
      
      {/* ── AMBIENT DIGITAL GRID ── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-start overflow-hidden">
        <div className="absolute top-[-10%] w-full max-w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
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
            Terms of Service.
          </h1>
          <p className="text-lg md:text-xl font-medium text-zinc-500 dark:text-zinc-400">
            Please read these terms carefully before using WorkMitra. These terms govern your use of our platform, whether you are a Customer or a Professional.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative">
          
          {/* Sticky Table of Contents (Desktop) */}
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
              <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-3">TL;DR (The Short Version)</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <li>WorkMitra is a technology platform connecting users with independent professionals. We do not directly employ the workers.</li>
                <li>All payments must go through our secure escrow system to guarantee protection for both parties.</li>
                <li>You must be at least 18 years old and provide accurate identity information to use the platform.</li>
                <li>Off-platform payments or circumvention of our system will result in immediate account termination.</li>
              </ul>
            </motion.div>

            {/* Typography Content */}
            <div className="space-y-20 text-zinc-600 dark:text-zinc-400 font-medium text-base md:text-lg leading-relaxed">
              
              <section id="acceptance" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">1. Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing or using the WorkMitra website, mobile application, or any associated services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the platform.
                </p>
                <p>
                  WorkMitra reserves the right to modify these terms at any time. We will notify you of any material changes via email or platform notification.
                </p>
              </section>

              <section id="platform" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">2. The Platform</h2>
                <p className="mb-4">
                  WorkMitra provides a digital marketplace connecting individuals seeking home services ("Customers") with independent professionals willing to provide those services ("Workers"). 
                </p>
                <p className="mb-4 text-zinc-900 dark:text-zinc-200 font-bold border-l-2 border-orange-500 pl-4 py-1">
                  WorkMitra does not perform the services and does not employ individuals to perform the services.
                </p>
                <p>
                  Professionals operate as independent business owners. While WorkMitra implements ID verification and quality control measures, we are not liable for the acts or omissions of any user.
                </p>
              </section>

              <section id="accounts" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">3. User Accounts</h2>
                <ul className="list-decimal pl-5 space-y-4">
                  <li><strong>Verification:</strong> All workers must undergo identity and credential verification before their profiles become active. Customers must verify their phone numbers.</li>
                  <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your login credentials. You must immediately notify WorkMitra of any unauthorized account access.</li>
                  <li><strong>Termination:</strong> We reserve the right to suspend or terminate accounts that violate these terms, exhibit fraudulent behavior, or receive consistently poor safety ratings.</li>
                </ul>
              </section>

              <section id="payments" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">4. Payments & Escrow</h2>
                <p className="mb-4">
                  To ensure a safe environment, all financial transactions must be conducted through the WorkMitra platform.
                </p>
                <p className="mb-4">
                  When a job is booked, customer funds are held in a secure digital escrow. Funds are only released to the professional upon confirmation of job completion. If a dispute arises, the funds remain in escrow while our mediation team investigates.
                </p>
                <p className="text-red-500 dark:text-red-400 font-bold">
                  Attempting to pay a worker in cash outside of the platform voids all WorkMitra guarantees and will result in a permanent ban.
                </p>
              </section>

              <section id="liability" className="scroll-mt-32">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-6">5. Limitation of Liability</h2>
                <p className="uppercase text-sm mb-4">
                  To the maximum extent permitted by law, WorkMitra shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of your access to or use of the platform.
                </p>
              </section>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}