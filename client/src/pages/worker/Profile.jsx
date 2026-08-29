import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import workerService from '../../services/worker.service';
import Loader from '../../components/common/Loader';

function VerificationUpload({ currentStatus, onUploaded }) {
  const [files, setFiles] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!files?.length) return toast.error('Select at least one document');
    setSubmitting(true);
    try {
      const worker = await workerService.submitVerification(files);
      toast.success('Submitted for review');
      onUploaded(worker);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 md:p-8 mt-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Identity Verification</h3>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Build trust with customers by verifying your identity.
          </p>
        </div>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
          currentStatus === 'verified' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
          currentStatus === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
          currentStatus === 'rejected' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 
          'bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400'
        }`}>
          {currentStatus === 'verified' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          {currentStatus === 'pending' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          {currentStatus === 'rejected' && <span className="w-2 h-2 rounded-full bg-red-500" />}
          {currentStatus}
        </div>
      </div>

      {currentStatus === 'verified' ? (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Your profile is verified. You now display a trusted badge on your public profile.
          </p>
        </div>
      ) : currentStatus === 'pending' ? (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Your documents are currently under review by our admin team.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Upload your [Aadhaar Redacted] card, ID proof, or certification to get a verified badge.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="w-full sm:flex-1 relative border-2 border-dashed border-zinc-300 dark:border-white/10 rounded-2xl p-4 hover:bg-zinc-50 dark:hover:bg-white/5 hover:border-orange-500/50 transition-colors cursor-pointer text-center group">
              <input type="file" multiple accept="image/*,application/pdf" onChange={(e) => setFiles(e.target.files)} className="hidden" />
              <div className="flex flex-col items-center justify-center gap-2">
                <svg className="w-6 h-6 text-zinc-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-orange-500">
                  {files?.length ? `${files.length} file(s) selected` : 'Click to browse files'}
                </span>
              </div>
            </label>
            <button
              onClick={submit} disabled={submitting || !files?.length}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm px-6 py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 whitespace-nowrap"
            >
              {submitting ? 'Uploading...' : 'Submit ID'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    workerService.getMyProfile().then((p) => {
      setProfile(p);
      setForm({
        profession: p.profession === 'Not specified' ? '' : (p.profession || ''),
        bio: p.bio || '',
        experienceYears: p.experienceYears || 0,
        rateType: p.rateType || 'daily',
        rateAmount: p.rateAmount || 0,
        city: p.location?.city || '',
        state: p.location?.state || '',
        skills: (p.skills || []).join(', '),
        languages: (p.languages || []).join(', '),
      });
    }).finally(() => setLoading(false));
  }, []);

  const fetchWorkerLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    
    setIsLocating(true);
    const toastId = toast.loading("Detecting area...");

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
              city: a.city || a.town || a.village || a.state_district || '',
              state: a.state || ''
            }));
            toast.success("Location updated!", { id: toastId });
          }
        } catch (err) {
          toast.error("Network error", { id: toastId });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error("Allow location access", { id: toastId });
      }, { enableHighAccuracy: true }
    );
  };

  const handleAvailabilityToggle = async (availability) => {
    try {
      const updated = await workerService.updateAvailability(availability);
      setProfile(updated);
      toast.success(`Status set to ${availability}`);
    } catch {
      toast.error('Could not update availability');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const updated = await workerService.updateMyProfile(payload);
      setProfile(updated);
      toast.success('Profile saved successfully!');
      
    
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const toastId = toast.loading('Uploading photo...');
    try {
      const avatar = await workerService.uploadAvatar(file);
      toast.success('Photo updated', { id: toastId });
      setProfile((p) => ({ ...p, user: { ...p.user, avatar } }));
    } catch {
      toast.error('Upload failed', { id: toastId });
    }
  };

  const handleWorkImagesChange = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    setUploadingMedia(true);
    const toastId = toast.loading('Uploading portfolio images...');
    try {
      const workImages = await workerService.uploadWorkImages(files);
      toast.success('Work images added', { id: toastId });
      setProfile((p) => ({ ...p, workImages }));
    } catch {
      toast.error('Upload failed', { id: toastId });
    } finally {
      setUploadingMedia(false);
    }
  };

  if (loading || !form) return <Loader text="Loading profile editor..." />;

  const inputClass = "w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-[#0a0a0a] px-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all";
  const labelClass = "block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pt-24 px-4 pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Edit Profile</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Manage your public presence and settings.</p>
        </div>

        {/* Availability Toggle */}
        <div className="bg-white dark:bg-[#141414] p-1.5 rounded-2xl border border-zinc-200 dark:border-white/5 inline-flex">
          {['available', 'busy', 'offline'].map((s) => (
            <button
              key={s}
              onClick={() => handleAvailabilityToggle(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                profile.availability === s
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${s === 'available' ? 'bg-emerald-500' : s === 'busy' ? 'bg-amber-500' : 'bg-zinc-400'}`} />
              {s}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* CARD 1: Basic Info & Avatar */}
        <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            
            {/* Avatar Upload */}
            <div className="shrink-0 relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-50 dark:border-zinc-800 shadow-xl relative bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={profile.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.user?.name || 'W')}&background=f97316&color=fff&size=200`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-[10px] font-bold uppercase">Change</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Inputs */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Profession *</label>
                <input required value={form.profession} onChange={(e) => setForm((p) => ({ ...p, profession: e.target.value }))} placeholder="e.g. Electrician" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Experience (Years)</label>
                <div className="relative">
                  <input type="number" min="0" value={form.experienceYears} onChange={(e) => setForm((p) => ({ ...p, experienceYears: e.target.value }))} className={inputClass} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">YRS</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>About You</label>
                <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Describe your experience, specializations..." className={`${inputClass} h-auto py-3 resize-none`} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 2: Location */}
          <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Service Area</h3>
              <button type="button" onClick={fetchWorkerLocation} disabled={isLocating} className="text-[10px] font-bold bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors uppercase tracking-wider">
                {isLocating ? 'Detecting...' : '📍 Auto-Detect'}
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>City</label>
                <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="e.g. Delhi" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} placeholder="e.g. Haryana" className={inputClass} />
              </div>
            </div>
          </div>

          {/* CARD 3: Pricing & Skills */}
          <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 md:p-8">
             <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-5">Pricing & Skills</h3>
             <div className="space-y-5">
               <div className="flex gap-4">
                 <div className="flex-1">
                   <label className={labelClass}>Rate Type</label>
                   <select value={form.rateType} onChange={(e) => setForm((p) => ({ ...p, rateType: e.target.value }))} className={inputClass}>
                     <option value="daily">Per Day</option>
                     <option value="hourly">Per Hour</option>
                   </select>
                 </div>
                 <div className="flex-1">
                   <label className={labelClass}>Rate Amount</label>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
                     <input type="number" required min="0" value={form.rateAmount} onChange={(e) => setForm((p) => ({ ...p, rateAmount: e.target.value }))} className={`${inputClass} pl-8`} />
                   </div>
                 </div>
               </div>
               <div>
                  <label className={labelClass}>Skills <span className="lowercase font-normal text-zinc-400">(comma separated)</span></label>
                  <input value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} placeholder="e.g. Wiring, Panels, CCTV" className={inputClass} />
               </div>
               <div>
                  <label className={labelClass}>Languages <span className="lowercase font-normal text-zinc-400">(comma separated)</span></label>
                  <input value={form.languages} onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))} placeholder="e.g. Hindi, English" className={inputClass} />
               </div>
             </div>
          </div>
        </div>

        {/* CARD 4: Media Portfolio */}
        <div className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 md:p-8">
          <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-5">Work Portfolio</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {/* Upload Button Box */}
            <label className="aspect-square rounded-2xl border-2 border-dashed border-zinc-300 dark:border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
              <input type="file" accept="image/*" multiple onChange={handleWorkImagesChange} className="hidden" />
              {uploadingMedia ? (
                <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-8 h-8 text-zinc-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-orange-500">Add Photos</span>
                </>
              )}
            </label>

            {/* Existing Images */}
            {profile.workImages?.map((img) => (
              <div key={img.publicId} className="aspect-square rounded-2xl overflow-hidden relative group bg-zinc-100 dark:bg-zinc-900">
                <img src={img.url} alt="Work sample" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button  type="submit" disabled={saving} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-10 py-4 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none">
            {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Verification Area */}
      <VerificationUpload currentStatus={profile.verification?.status || 'unverified'} onUploaded={(w) => setProfile(w)} />
      
    </motion.div>
  );
}

