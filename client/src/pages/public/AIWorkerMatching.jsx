import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MONO = "'IBM Plex Mono', monospace";
const DISPLAY = "'Oswald', sans-serif";

const T = {
  page: 'bg-[#EFEBE2] dark:bg-[#14120D]',
  card: 'bg-[#FAF8F3] dark:bg-[#1E1B15]',
  ink: 'text-[#16140F] dark:text-[#F3F0E8]',
  inkBorder: 'border-[#16140F] dark:border-[#F3F0E8]',
  inkBg: 'bg-[#16140F] dark:bg-[#F3F0E8]',
  steel: 'text-[#8B8577] dark:text-[#A39D8E]',
  hairline: 'border-[#E4E0D5] dark:border-[#2C2820]',
  hairlineBg: 'bg-[#E4E0D5] dark:bg-[#2C2820]',
  amber: 'text-[#FF6A1A]',
  amberBg: 'bg-[#FF6A1A]',
  amberBorder: 'border-[#FF6A1A]',
  denim: 'text-[#2C4257] dark:text-[#8FA9BE]',
  denimBorder: 'border-[#2C4257] dark:border-[#8FA9BE]',
  denimBg: 'bg-[#2C4257]/[0.06] dark:bg-[#8FA9BE]/10',
  red: 'text-[#B4232B] dark:text-[#E2707A]',
  redBorder: 'border-[#B4232B] dark:border-[#E2707A]',
  redBg: 'bg-[#B4232B]/[0.06] dark:bg-[#E2707A]/10',
};

const STEPS = [
  {
    id: 'job',
    question: 'What work do you need done?',
    placeholder: 'e.g. Fix a leaking bathroom pipe and install a new tap in kitchen...',
    type: 'textarea',
  },
  {
    id: 'city',
    question: 'Which city are you in?',
    placeholder: 'e.g. Delhi, Mumbai, Bangalore, Hyderabad...',
    type: 'input',
  },
  {
    id: 'budget',
    question: "What's your budget per day?",
    type: 'budget',
    options: [
      { label: 'Under ₹500',      value: '0-500'      },
      { label: '₹500 – ₹1,000',   value: '500-1000'   },
      { label: '₹1,000 – ₹3,000', value: '1000-3000'  },
      { label: '₹3,000 – ₹5,000', value: '3000-5000'  },
      { label: 'Above ₹5,000',    value: '5000-99999' },
      { label: 'Flexible',        value: '0-99999'    },
    ],
  },
];

const LOADING_MESSAGES = [
  'Searching workers in your city...',
  'Analyzing skills and ratings...',
  'Matching your budget...',
  'AI is ranking the best fits...',
];

const RANK_LABELS = ['TOP MATCH', '2ND MATCH', '3RD MATCH'];

function MatchCard({ worker, reason, rank }) {
  const label = RANK_LABELS[rank] || `MATCH ${rank + 1}`;

  return (
    <Link
      to={`/workers/${worker._id}`}
      className={`relative rounded-2xl border-2 p-5 flex items-start gap-4 hover:-translate-y-1 transition-all duration-300 group overflow-hidden ${T.card} ${T.hairline}`}
    >
      <div
        className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-2xl ${T.amberBg}`}
        style={{ fontFamily: MONO }}
      >
        {label}
      </div>

      <div className="relative shrink-0">
        <img
          src={worker.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.user?.name || 'W')}&background=16140F&color=FAF8F3&size=96`}
          alt={worker.user?.name}
          className={`h-14 w-14 rounded-2xl object-cover border-2 ${T.inkBorder}`}
        />
        {worker.availability === 'available' && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#3E8E5A] border-2 border-[#FAF8F3] dark:border-[#1E1B15]" />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-16">
        <p className={`font-semibold group-hover:${T.amber} transition-colors ${T.ink}`} style={{ fontFamily: DISPLAY }}>
          {worker.user?.name?.toUpperCase()}
        </p>
        <p className={`text-sm ${T.steel}`}>
          {worker.profession} · {worker.location?.city}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ fontFamily: MONO }}>
          <span className={`flex items-center gap-1 font-semibold ${T.amber}`}>
            ★ {worker.ratingAvg?.toFixed(1)} <span className={`font-normal ${T.steel}`}>({worker.ratingCount})</span>
          </span>
          <span className={T.steel}>·</span>
          <span className={`font-semibold ${T.ink}`}>
            ₹{worker.rateAmount}/{worker.rateType === 'hourly' ? 'hr' : 'day'}
          </span>
          <span className={T.steel}>·</span>
          <span className={T.steel}>{worker.experienceYears} yrs exp</span>
        </div>

        {reason && (
          <div className={`mt-3 px-3 py-2 rounded-xl border-2 border-dashed ${T.denimBorder} ${T.denimBg}`}>
            <p className={`text-xs leading-relaxed ${T.denim}`}>
              <span className="font-semibold">Why this match: </span>{reason}
            </p>
          </div>
        )}

        {worker.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {worker.skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className={`px-2 py-0.5 rounded border text-[10px] ${T.hairline} ${T.steel}`}
                style={{ fontFamily: MONO }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function AIWorkerMatching() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ job: '', city: '', budget: '' });
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState('');

  const step = STEPS[currentStep];

  const canProceed = () => {
    if (step.id === 'job')    return answers.job.trim().length > 5;
    if (step.id === 'city')   return answers.city.trim().length > 1;
    if (step.id === 'budget') return answers.budget !== '';
    return true;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
    else findMatches();
  };

  const findMatches = async () => {
    setLoading(true);
    setError('');
    setMatches(null);

    const interval = setInterval(() => {
      setLoadingMsg((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1200);

    try {
      const { data } = await api.post('/ai/match-workers', {
        job: answers.job,
        city: answers.city,
        budget: answers.budget,
      });

      setMatches(data.data.matches || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not find matches. Please try again.';
      setError(msg);
      setMatches([]);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({ job: '', city: '', budget: '' });
    setMatches(null);
    setError('');
    setLoadingMsg(0);
  };

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${T.page}`} style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div className="text-center max-w-sm px-4">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
            <div className={`absolute inset-0 rounded-full border-4 border-dashed ${T.hairline}`} />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FF6A1A] animate-spin" />
            <span className={`text-[10px] font-bold tracking-widest ${T.amber}`} style={{ fontFamily: MONO }}>AI</span>
          </div>
          <h2 className={`text-2xl font-semibold mb-2 ${T.ink}`} style={{ fontFamily: DISPLAY }}>
            FINDING YOUR PERFECT MATCH
          </h2>
          <p className={`font-medium text-sm transition-all duration-500 ${T.amber}`} style={{ fontFamily: MONO }}>
            {LOADING_MESSAGES[loadingMsg]}
          </p>
          <div className="mt-6 space-y-2 text-left inline-block">
            {LOADING_MESSAGES.map((msg, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                  i <= loadingMsg ? T.ink : T.steel
                }`}
                style={{ fontFamily: MONO }}
              >
                <span>{i < loadingMsg ? '✓' : i === loadingMsg ? '→' : '○'}</span>
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (matches !== null) {
    return (
      <div className={`min-h-screen ${T.page}`} style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          {error && (
            <div className={`mb-6 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold flex items-center gap-2 ${T.redBorder} ${T.red} ${T.redBg}`}>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[11px] shrink-0 ${T.redBorder}`}>!</span>
              {error}
            </div>
          )}

          {matches.length === 0 ? (
            <div className={`rounded-2xl p-16 text-center border-2 border-dashed ${T.card} ${T.hairline}`}>
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full border-[3px] border-dashed flex items-center justify-center rotate-[-8deg] ${T.denimBorder} ${T.denim}`}>
                <span className="text-[10px] font-bold tracking-wider text-center leading-tight" style={{ fontFamily: MONO }}>
                  NOT<br />FOUND
                </span>
              </div>
              <h2 className={`text-2xl font-semibold ${T.ink}`} style={{ fontFamily: DISPLAY }}>NO WORKERS FOUND</h2>
              <p className={`mt-2 mb-6 text-sm ${T.steel}`}>
                We couldn't find available workers in <strong className={T.ink}>{answers.city}</strong> right now.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={reset}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold border-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${T.ink} ${T.inkBorder}`}
                >
                  Try another city
                </button>
                <Link
                  to="/search"
                  className={`px-6 py-3 rounded-lg text-sm font-semibold text-white hover:-translate-y-0.5 transition-transform ${T.amberBg}`}
                >
                  Browse all workers
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 animate-fade-up">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-dashed border-[1.5px] text-xs font-semibold mb-4 ${T.denimBorder} ${T.denim}`} style={{ fontFamily: MONO }}>
                  AI-POWERED RESULTS
                </div>
                <h2 className={`text-3xl font-semibold ${T.ink}`} style={{ fontFamily: DISPLAY }}>
                  TOP MATCHES IN {answers.city.toUpperCase()}
                </h2>
                <p className={`mt-1 text-sm ${T.steel}`}>
                  Ranked by AI based on your job, budget, and worker ratings
                </p>
              </div>

              <div className="space-y-4">
                {matches.map((m, i) => (
                  <div key={m.worker._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <MatchCard worker={m.worker} reason={m.reason} rank={i} />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3 justify-center">
                <button
                  onClick={reset}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold border-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${T.ink} ${T.inkBorder}`}
                >
                  Search again
                </button>
                <Link
                  to="/search"
                  className={`px-6 py-3 rounded-lg text-sm font-semibold text-white hover:-translate-y-0.5 transition-transform ${T.amberBg}`}
                >
                  Browse all workers
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Question screen ─────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex items-center justify-center pt-20 ${T.page}`} style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <div className="w-full max-w-lg px-4">

        <div className="text-center mb-8 animate-fade-up">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-dashed border-[1.5px] text-xs font-semibold mb-4 ${T.denimBorder} ${T.denim}`} style={{ fontFamily: MONO }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            AI WORKER MATCHING
          </div>
          <h1 className={`text-3xl font-semibold ${T.ink}`} style={{ fontFamily: DISPLAY }}>
            FIND YOUR PERFECT WORKER
          </h1>
          <p className={`mt-1 ${T.steel}`}>3 quick questions — AI does the rest</p>
        </div>

        {/* Progress — punch marks */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`transition-all duration-300 rounded-full ${
                i === currentStep ? `w-8 h-2.5 ${T.amberBg}` :
                i < currentStep  ? 'w-2.5 h-2.5 bg-[#FF6A1A]/50' :
                                    `w-2.5 h-2.5 ${T.hairlineBg}`
              }`}
            />
          ))}
        </div>

        <div className={`rounded-2xl p-8 border-2 animate-scale-in ${T.card} ${T.inkBorder}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${T.amber}`} style={{ fontFamily: MONO }}>
            Question {currentStep + 1} of {STEPS.length}
          </p>
          <h2 className={`text-xl font-semibold mb-6 ${T.ink}`} style={{ fontFamily: DISPLAY }}>
            {step.question}
          </h2>

          {step.type === 'textarea' && (
            <textarea
              autoFocus
              rows={4}
              value={answers[step.id]}
              onChange={(e) => setAnswers((p) => ({ ...p, [step.id]: e.target.value }))}
              placeholder={step.placeholder}
              className={`w-full rounded-xl border-2 px-4 py-3 text-base leading-relaxed resize-none outline-none transition-colors focus:border-[#FF6A1A] bg-transparent ${T.hairline} ${T.ink} placeholder:${T.steel}`}
            />
          )}

          {step.type === 'input' && (
            <input
              autoFocus
              type="text"
              value={answers[step.id]}
              onChange={(e) => setAnswers((p) => ({ ...p, [step.id]: e.target.value }))}
              placeholder={step.placeholder}
              className={`w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition-colors focus:border-[#FF6A1A] bg-transparent ${T.hairline} ${T.ink}`}
              onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
            />
          )}

          {step.type === 'budget' && (
            <div className="grid grid-cols-2 gap-3">
              {step.options.map((opt) => {
                const active = answers.budget === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers((p) => ({ ...p, budget: opt.value }))}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all duration-200 ${
                      active
                        ? `${T.amberBorder} ${T.denimBg} ${T.amber}`
                        : `border-dashed ${T.hairline} ${T.steel} hover:${T.amberBorder}`
                    }`}
                  >
                    {opt.label}
                    {active && <span className="ml-1">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentStep((s) => Math.max(s - 1, 0))}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg text-sm font-semibold border-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-0 disabled:pointer-events-none ${T.ink} ${T.inkBorder}`}
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-8 py-3 rounded-lg text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 ${T.amberBg}`}
          >
            {currentStep === STEPS.length - 1 ? 'Find my matches →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}








// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../../services/api';

// const STEPS = [
//   {
//     id: 'job',
//     question: 'What work do you need done?',
//     placeholder: 'e.g. Fix a leaking bathroom pipe and install a new tap in kitchen...',
//     type: 'textarea',
//   },
//   {
//     id: 'city',
//     question: 'Which city are you in?',
//     placeholder: 'e.g. Delhi, Mumbai, Bangalore, Hyderabad...',
//     type: 'input',
//   },
//   {
//     id: 'budget',
//     question: "What's your budget per day?",
//     type: 'budget',
//     options: [
//       { label: 'Under ₹500',      value: '0-500'      },
//       { label: '₹500 – ₹1,000',   value: '500-1000'   },
//       { label: '₹1,000 – ₹3,000', value: '1000-3000'  },
//       { label: '₹3,000 – ₹5,000', value: '3000-5000'  },
//       { label: 'Above ₹5,000',    value: '5000-99999' },
//       { label: 'Flexible',        value: '0-99999'    },
//     ],
//   },
// ];

// const LOADING_MESSAGES = [
//   'Searching workers in your city...',
//   'Analyzing skills and ratings...',
//   'Matching your budget...',
//   'AI is ranking the best fits...',
// ];

// function MatchCard({ worker, reason, rank }) {
//   const badges = [
//     { label: '🥇 Best Match',  bg: 'bg-yellow-400' },
//     { label: '🥈 2nd Match',   bg: 'bg-gray-400'   },
//     { label: '🥉 3rd Match',   bg: 'bg-amber-600'  },
//   ];
//   const badge = badges[rank];

//   return (
//     <Link
//       to={`/workers/${worker._id}`}
//       className="card p-5 flex items-start gap-4 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
//     >
//       <div className={`absolute top-0 right-0 px-3 py-1 text-[11px] font-black text-white ${badge.bg} rounded-bl-2xl`}>
//         {badge.label}
//       </div>

//       <div className="relative shrink-0">
//         <img
//           src={worker.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.user?.name || 'W')}&background=16a34a&color=fff&size=96`}
//           alt={worker.user?.name}
//           className="h-14 w-14 rounded-2xl object-cover"
//         />
//         {worker.availability === 'available' && (
//           <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-[#0f1f35]" />
//         )}
//       </div>

//       <div className="flex-1 min-w-0 pr-20">
//         <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
//           {worker.user?.name}
//         </p>
//         <p className="text-sm text-gray-500 dark:text-gray-400">
//           {worker.profession} · {worker.location?.city}
//         </p>
//         <div className="flex items-center gap-3 mt-1 text-xs">
//           <span className="flex items-center gap-1 text-yellow-500 font-semibold">
//             ⭐ {worker.ratingAvg?.toFixed(1)} <span className="text-gray-400 font-normal">({worker.ratingCount})</span>
//           </span>
//           <span className="text-gray-300 dark:text-gray-600">·</span>
//           <span className="font-bold text-gray-900 dark:text-white">
//             ₹{worker.rateAmount}/{worker.rateType === 'hourly' ? 'hr' : 'day'}
//           </span>
//           <span className="text-gray-300 dark:text-gray-600">·</span>
//           <span className="text-gray-500 dark:text-gray-400">{worker.experienceYears} yrs exp</span>
//         </div>

//         {reason && (
//           <div className="mt-3 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-900/40">
//             <p className="text-xs text-primary-700 dark:text-primary-400 leading-relaxed">
//               <span className="font-bold">Why this match: </span>{reason}
//             </p>
//           </div>
//         )}

//         {worker.skills?.length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-2">
//             {worker.skills.slice(0, 3).map((s) => (
//               <span key={s} className="badge bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[10px]">{s}</span>
//             ))}
//           </div>
//         )}
//       </div>
//     </Link>
//   );
// }

// export default function AIWorkerMatching() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [answers, setAnswers] = useState({ job: '', city: '', budget: '' });
//   const [loading, setLoading] = useState(false);
//   const [loadingMsg, setLoadingMsg] = useState(0);
//   const [matches, setMatches] = useState(null);
//   const [error, setError] = useState('');

//   const step = STEPS[currentStep];

//   const canProceed = () => {
//     if (step.id === 'job')    return answers.job.trim().length > 5;
//     if (step.id === 'city')   return answers.city.trim().length > 1;
//     if (step.id === 'budget') return answers.budget !== '';
//     return true;
//   };

//   const handleNext = () => {
//     if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
//     else findMatches();
//   };

//   const findMatches = async () => {
//     setLoading(true);
//     setError('');
//     setMatches(null);

//     // Cycle loading messages
//     const interval = setInterval(() => {
//       setLoadingMsg((prev) => (prev + 1) % LOADING_MESSAGES.length);
//     }, 1200);

//     try {
//       const { data } = await api.post('/ai/match-workers', {
//         job: answers.job,
//         city: answers.city,
//         budget: answers.budget,
//       });

//       setMatches(data.data.matches || []);
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Could not find matches. Please try again.';
//       setError(msg);
//       setMatches([]);
//     } finally {
//       clearInterval(interval);
//       setLoading(false);
//     }
//   };

//   const reset = () => {
//     setCurrentStep(0);
//     setAnswers({ job: '', city: '', budget: '' });
//     setMatches(null);
//     setError('');
//     setLoadingMsg(0);
//   };

//   // ── Loading screen ──────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-[#060d1a] flex items-center justify-center  ">
//         <div className="text-center max-w-sm " >
//           <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8 ">
//             <div className="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-primary-900/30 " />
//             <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
//             <span className="text-3xl">✨</span>
//           </div>
//           <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Finding your perfect match</h2>
//           <p className="text-primary-600 dark:text-primary-400 font-medium text-sm transition-all duration-500">
//             {LOADING_MESSAGES[loadingMsg]}
//           </p>
//           <div className="mt-6 space-y-2">
//             {LOADING_MESSAGES.map((msg, i) => (
//               <div key={i} className={`flex items-center gap-2 text-xs transition-all duration-300 ${
//                 i <= loadingMsg ? 'text-gray-600 dark:text-gray-300' : 'text-gray-300 dark:text-gray-700'
//               }`}>
//                 <span>{i < loadingMsg ? '✓' : i === loadingMsg ? '→' : '○'}</span>
//                 {msg}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── Results screen ──────────────────────────────────────────────────────────
//   if (matches !== null) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-[#060d1a]">
//         <div className="max-w-2xl mx-auto px-4 py-12">
//           {error && (
//             <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
//               ⚠️ {error}
//             </div>
//           )}

//           {matches.length === 0 ? (
//             <div className="card p-16 text-center">
//               <p className="text-5xl mb-4">😕</p>
//               <h2 className="text-2xl font-black text-gray-900 dark:text-white">No workers found</h2>
//               <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
//                 We couldn't find available workers in <strong>{answers.city}</strong> right now.
//               </p>
//               <div className="flex gap-3 justify-center">
//                 <button onClick={reset} className="btn-secondary">Try another city</button>
//                 <Link to="/search" className="btn-primary">Browse all workers</Link>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="text-center mb-8 animate-fade-up">
//                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-4">
//                   ✨ AI-Powered Results
//                 </div>
//                 <h2 className="text-3xl font-black text-gray-900 dark:text-white">
//                   Top matches in {answers.city}
//                 </h2>
//                 <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
//                   Ranked by AI based on your job, budget, and worker ratings
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 {matches.map((m, i) => (
//                   <div key={m.worker._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
//                     <MatchCard worker={m.worker} reason={m.reason} rank={i} />
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-8 flex gap-3 justify-center">
//                 <button onClick={reset} className="btn-secondary">Search again</button>
//                 <Link to="/search" className="btn-primary">Browse all workers</Link>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // ── Question screen ─────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-[#060d1a] flex items-center justify-center pt-20">
//       <div className="w-full max-w-lg">

//         <div className="text-center mb-8 animate-fade-up">
//           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-4">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
//             </svg>
//             AI Worker Matching
//           </div>
//           <h1 className="text-3xl font-black text-gray-900 dark:text-white">Find your perfect worker</h1>
//           <p className="text-gray-500 dark:text-gray-400 mt-1">3 quick questions — AI does the rest</p>
//         </div>

//         {/* Progress dots */}
//         <div className="flex items-center justify-center gap-2 mb-8">
//           {STEPS.map((s, i) => (
//             <div key={s.id} className={`transition-all duration-300 rounded-full ${
//               i === currentStep ? 'w-8 h-2.5 bg-primary-600' :
//               i < currentStep  ? 'w-2.5 h-2.5 bg-primary-400' :
//                                   'w-2.5 h-2.5 bg-gray-200 dark:bg-white/10'
//             }`} />
//           ))}
//         </div>

//         <div className="card p-8 animate-scale-in">
//           <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
//             Question {currentStep + 1} of {STEPS.length}
//           </p>
//           <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">{step.question}</h2>

//           {step.type === 'textarea' && (
//             <textarea
//               autoFocus
//               rows={4}
//               value={answers[step.id]}
//               onChange={(e) => setAnswers((p) => ({ ...p, [step.id]: e.target.value }))}
//               placeholder={step.placeholder}
//               className="input resize-none text-base leading-relaxed"
//             />
//           )}

//           {step.type === 'input' && (
//             <input
//               autoFocus
//               type="text"
//               value={answers[step.id]}
//               onChange={(e) => setAnswers((p) => ({ ...p, [step.id]: e.target.value }))}
//               placeholder={step.placeholder}
//               className="input text-base"
//               onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
//             />
//           )}

//           {step.type === 'budget' && (
//             <div className="grid grid-cols-2 gap-3">
//               {step.options.map((opt) => (
//                 <button
//                   key={opt.value}
//                   onClick={() => setAnswers((p) => ({ ...p, budget: opt.value }))}
//                   className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold text-left transition-all duration-200 ${
//                     answers.budget === opt.value
//                       ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
//                       : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-primary-300'
//                   }`}
//                 >
//                   {opt.label}
//                   {answers.budget === opt.value && <span className="ml-1">✓</span>}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="flex items-center justify-between mt-6">
//           <button
//             onClick={() => setCurrentStep((s) => Math.max(s - 1, 0))}
//             disabled={currentStep === 0}
//             className="btn-secondary disabled:opacity-0 disabled:pointer-events-none"
//           >
//             ← Back
//           </button>
//           <button
//             onClick={handleNext}
//             disabled={!canProceed()}
//             className="btn-primary disabled:opacity-50 px-8"
//           >
//             {currentStep === STEPS.length - 1 ? '✨ Find my matches' : 'Next →'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }