import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {toast} from 'sonner';
import workerService from '../../services/worker.service';

const PROFESSIONS = [
  { name: 'Electrician',       icon: '⚡' },
  { name: 'Plumber',           icon: '🔧' },
  { name: 'Carpenter',         icon: '🪚' },
  { name: 'Painter',           icon: '🎨' },
  { name: 'Mason',             icon: '🧱' },
  { name: 'Welder',            icon: '🔥' },
  { name: 'AC Technician',     icon: '❄️' },
  { name: 'Construction Worker', icon: '🏗️' },
];

const ALL_SKILLS = {
  'Electrician':         ['House Wiring', 'Panel Installation', 'Ceiling Fans', 'AC Fitting', 'Solar Panels', 'CCTV', 'Home Automation', 'Inverter Setup', 'LED Lighting'],
  'Plumber':             ['Pipe Fitting', 'Bathroom Renovation', 'Water Tank', 'Drainage', 'Geyser Installation', 'RO Installation', 'Leak Repair', 'Submersible Pump'],
  'Carpenter':           ['Custom Furniture', 'Modular Kitchen', 'Wardrobes', 'False Ceiling', 'Wooden Flooring', 'Door Frames', 'Window Fitting', 'Plywood Work'],
  'Painter':             ['Interior Painting', 'Exterior Painting', 'Texture Work', 'Wallpaper', 'Waterproofing', 'Wood Polish', 'Wall Putty', 'Enamel Paint'],
  'Mason':               ['Brickwork', 'Plastering', 'Tiling', 'RCC Work', 'Waterproofing', 'Flooring', 'Stone Masonry', 'Marble Fitting'],
  'Welder':              ['Arc Welding', 'MIG Welding', 'TIG Welding', 'Gate Fabrication', 'Steel Structures', 'Stainless Steel', 'Railing Fabrication'],
  'AC Technician':       ['AC Installation', 'AC Servicing', 'Gas Refilling', 'AC Repair', 'Split AC', 'PCB Repair', 'Compressor Replacement'],
  'Construction Worker': ['Site Supervision', 'Civil Work', 'Foundation', 'Concrete Mixing', 'Shuttering', 'Bar Bending', 'Waterproofing'],
};

const STEPS = [
  { id: 1, title: 'Your Profession',   icon: '👷', desc: 'What kind of work do you do?' },
  { id: 2, title: 'Your Location',     icon: '📍', desc: 'Where are you based?' },
  { id: 3, title: 'Your Rate',         icon: '💰', desc: 'How much do you charge?' },
  { id: 4, title: 'Your Skills',       icon: '🛠️', desc: 'What are you expert at?' },
  { id: 5, title: "You're all set!",   icon: '🎉', desc: 'Review and publish your profile' },
];

export default function WorkerOnboarding({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [form, setForm] = useState({
    profession: '',
    city: '',
    state: '',
    rateType: 'daily',
    rateAmount: 500,
    skills: [],
    languages: ['Hindi'],
    bio: '',
    experienceYears: 1,
  });

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const toggleSkill = (skill) => {
    setForm((p) => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter((s) => s !== skill)
        : [...p.skills, skill],
    }));
  };

  // --- Smart GPS Location Fetcher ---
  const fetchWorkerLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    const toastId = toast.loading("Pinpointing your service area...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();

          if (data?.address) {
            const a = data.address;
            setForm((p) => ({
              ...p,
              // Grabs Indian cities safely
              city: a.city || a.town || a.village || a.state_district || '',
              state: a.state || ''
            }));
            toast.success("Service area verified!", { id: toastId });
          } else {
            toast.error("Could not determine exact city", { id: toastId });
          }
        } catch (err) {
          toast.error("Network error while locating", { id: toastId });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error("Please allow location access in browser", { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await workerService.updateMyProfile(form);
      toast.success('Profile published! Welcome to WorkMitra 🎉');
      onComplete?.();
      navigate('/worker/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const availableSkills = ALL_SKILLS[form.profession] || [];
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4 pt-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-4">
            Step {step} of {STEPS.length}
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            {STEPS[step - 1].icon} {STEPS[step - 1].title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{STEPS[step - 1].desc}</p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step content */}
        <div className="card p-8 animate-scale-in border border-gray-200 dark:border-white/5 bg-white dark:bg-[#141414] shadow-xl rounded-3xl">

          {/* Step 1 — Profession */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {PROFESSIONS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => { setForm((f) => ({ ...f, profession: p.name, skills: [] })); }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    form.profession === p.name
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                      : 'border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-gray-700'
                  }`}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <span className={`text-sm font-semibold ${
                    form.profession === p.name
                      ? 'text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>{p.name}</span>
                  {form.profession === p.name && (
                    <svg className="w-4 h-4 text-primary-600 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Location (UPDATED WITH GPS) */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Service Area GPS Box */}
              <div className="space-y-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Service Area</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Customers will search for you using this city.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={fetchWorkerLocation} 
                    disabled={isLocating}
                    className="text-[11px] font-bold bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors disabled:opacity-50 uppercase tracking-wider"
                  >
                    {isLocating ? <span className="w-3 h-3 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" /> : '📍'}
                    {isLocating ? 'Detecting...' : 'Auto-Detect'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">City *</label>
                    <input 
                      value={form.city} 
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Ambala" 
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">State *</label>
                    <input 
                      value={form.state} 
                      onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                      placeholder="e.g. Haryana" 
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary-500" 
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-white/5" />

              {/* Experience Slider */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4">Years of experience in {form.profession || 'your field'}</label>
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-200 dark:border-white/5">
                  <input
                    type="range"
                    min="1" max="30"
                    value={form.experienceYears}
                    onChange={(e) => setForm((p) => ({ ...p, experienceYears: Number(e.target.value) }))}
                    className="flex-1 accent-primary-600"
                  />
                  <div className="bg-white dark:bg-[#141414] px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-center min-w-[70px]">
                    <span className="text-xl font-black text-primary-600">{form.experienceYears}</span>
                    <span className="text-xs text-gray-500 block font-semibold mt-0.5">YRS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Rate */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex gap-3">
                {[
                  { value: 'daily',  label: 'Per Day',  icon: '📅' },
                  { value: 'hourly', label: 'Per Hour', icon: '⏰' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm((p) => ({ ...p, rateType: opt.value }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-bold text-sm transition-all ${
                      form.rateType === opt.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-md'
                        : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-[#1a1a1a] p-5 rounded-2xl border border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Your rate ({form.rateType === 'daily' ? 'per day' : 'per hour'})
                  </label>
                  <span className="text-3xl font-black text-primary-600">₹{form.rateAmount}</span>
                </div>
                <input
                  type="range"
                  min={form.rateType === 'daily' ? 200 : 50}
                  max={form.rateType === 'daily' ? 5000 : 500}
                  step={form.rateType === 'daily' ? 50 : 10}
                  value={form.rateAmount}
                  onChange={(e) => setForm((p) => ({ ...p, rateAmount: Number(e.target.value) }))}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs font-semibold text-gray-400 mt-2">
                  <span>₹{form.rateType === 'daily' ? '200' : '50'}</span>
                  <span>₹{form.rateType === 'daily' ? '5,000' : '500'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium flex gap-2">
                  <span>💡</span> 
                  <span>Average rate for {form.profession || 'workers'} in your area is <strong>₹{form.rateType === 'daily' ? '600-800/day' : '120-150/hour'}</strong></span>
                </p>
              </div>
            </div>
          )}

          {/* Step 4 — Skills */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                      form.skills.includes(skill)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {form.skills.includes(skill) ? '✓ ' : '+ '}{skill}
                  </button>
                ))}
              </div>
              {form.skills.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2 font-medium">Tap skills to add them to your profile</p>
              )}
              
              <hr className="border-gray-100 dark:border-white/5" />
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Write a short bio (optional but recommended)
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder="Tell customers about your experience and what makes you the best choice..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 5 — Review */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
                {[
                  { label: 'Profession',  value: form.profession },
                  { label: 'Location',    value: `${form.city}${form.state ? ', ' + form.state : ''}` },
                  { label: 'Rate',        value: `₹${form.rateAmount}/${form.rateType === 'daily' ? 'day' : 'hour'}` },
                  { label: 'Experience',  value: `${form.experienceYears} year${form.experienceYears !== 1 ? 's' : ''}` },
                  { label: 'Skills',      value: form.skills.length > 0 ? form.skills.join(', ') : 'None selected' },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-white/5 last:border-0">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{row.label}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white text-right max-w-[200px] leading-snug">{row.value || '—'}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/20 mt-4">
                <p className="text-sm text-green-700 dark:text-green-400 font-bold text-center flex items-center justify-center gap-2">
                  <span>🎉</span> Your profile is ready to go live! 
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 px-2">
          <button
            onClick={prev}
            disabled={step === 1}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-0 transition-colors"
          >
            ← Back
          </button>

          {step < 5 ? (
            <button
              onClick={next}
              disabled={
                (step === 1 && !form.profession) ||
                (step === 2 && (!form.city || !form.state))
              }
              className="btn-primary px-8 py-3 rounded-xl font-bold disabled:opacity-50 shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-8 py-3 rounded-xl font-bold disabled:opacity-70 shadow-lg shadow-primary-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : '🚀 Publish Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}