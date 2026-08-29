import { motion } from 'framer-motion';

const MONO = "'IBM Plex Mono', monospace";
const DISPLAY = "'Oswald', sans-serif";

const T = {
  card: 'bg-[#FAF8F3] dark:bg-[#1E1B15]',
  ink: 'text-[#16140F] dark:text-[#F3F0E8]',
  hairline: 'border-[#E4E0D5] dark:border-[#2C2820]',
  hairlineBg: 'bg-[#E4E0D5] dark:bg-[#2C2820]',
  steel: 'text-[#8B8577] dark:text-[#A39D8E]',
  amber: 'text-[#FF6A1A]',
  amberBg: 'bg-[#FF6A1A]',
  red: 'text-[#B4232B] dark:text-[#E2707A]',
  redBorder: 'border-[#B4232B] dark:border-[#E2707A]',
  redBg: 'bg-[#B4232B]/10 dark:bg-[#E2707A]/10',
};

const STEPS = [
  {
    key: 'pending',
    label: 'Requested',
    desc: 'Waiting for response',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    key: 'accepted',
    label: 'Accepted',
    desc: 'Worker has accepted',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    desc: 'Worker on the job',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    key: 'completed',
    label: 'Completed',
    desc: 'Job done successfully',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
];

const STEP_ORDER = ['pending', 'accepted', 'in_progress', 'completed'];

export default function BookingProgressTracker({ status }) {
  // ── ERROR STATES (Rejected / Cancelled) ──
  if (status === 'rejected' || status === 'cancelled') {
    const isRejected = status === 'rejected';
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed ${
          isRejected ? `${T.redBg} ${T.redBorder} ${T.red}` : `${T.hairlineBg} ${T.hairline} ${T.steel}`
        }`}
      >
        <div className={`p-2.5 rounded-full border-2 border-current flex-shrink-0`}>
          {isRejected ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold capitalize" style={{ fontFamily: DISPLAY }}>{status}</p>
          <p className="text-xs font-medium opacity-80 mt-0.5">
            {isRejected ? 'The worker was unable to take this booking.' : 'This booking has been cancelled.'}
          </p>
        </div>
      </motion.div>
    );
  }

  // ── PROGRESS TRACKER STATE ──
  const currentIndex = Math.max(0, STEP_ORDER.indexOf(status));

  return (
    <div className={`py-6 px-4 sm:px-6 rounded-2xl border-2 ${T.card} ${T.hairline}`}>
      <div className="flex items-start justify-between relative">

        {/* ── Background Track Line ── */}
        <div className={`absolute top-5 left-[10%] right-[10%] h-1 rounded-full z-0 overflow-hidden ${T.hairlineBg}`}>
          <motion.div
            className={`h-full rounded-full ${T.amberBg}`}
            initial={{ width: '0%' }}
            animate={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {/* ── Step Indicators ── */}
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">

              {/* Circle — color driven entirely by className now, not inline style */}
              <motion.div
                initial={false}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.4 }}
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm shadow-lg transition-colors duration-500 border-2 ${
                  isDone
                    ? `${T.amberBg} text-white border-[#FF6A1A] shadow-[#FF6A1A]/20`
                    : isCurrent
                    ? `${T.amberBg} text-white border-[#FF6A1A] shadow-[#FF6A1A]/30 ring-4 ring-[#FF6A1A]/20`
                    : `${T.card} ${T.hairline} ${T.steel}`
                }`}
              >
                {isDone ? (
                  <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <div className={isCurrent ? "animate-pulse" : "opacity-70"}>
                    {step.icon}
                  </div>
                )}
              </motion.div>

              {/* Text Labels */}
              <div className="mt-3 text-center">
                <p
                  className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors duration-300 ${
                    isCurrent ? T.amber : isDone ? T.ink : T.steel
                  }`}
                  style={{ fontFamily: DISPLAY }}
                >
                  {step.label}
                </p>
                <p className={`text-[10px] mt-1 hidden sm:block font-medium transition-colors duration-300 ${T.steel} ${!isCurrent && 'opacity-70'}`} style={{ fontFamily: MONO }}>
                  {step.desc}
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
