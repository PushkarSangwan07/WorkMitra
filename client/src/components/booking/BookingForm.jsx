import { useState } from 'react';
import {toast} from 'sonner';
import bookingService from '../../services/booking.service';

export default function BookingForm({ workerId, rateAmount, onSuccess }) {
  const [form, setForm] = useState({ date: '', timeSlot: '', description: '' });
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const updateForm = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const updateAddress = (e) => setAddress((p) => ({ ...p, [e.target.name]: e.target.value }));

  // --- Smarter GPS for Indian Addresses ---
  const fetchExactLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }

    setIsLocating(true);
    const toastId = toast.loading("Detecting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();

          if (data && data.address) {
            const a = data.address;
            
            // Indian maps use different labels. This safely catches all of them.
            const streetInfo = [a.road, a.neighbourhood, a.residential, a.suburb].filter(Boolean).join(", ");
            const cityInfo = a.city || a.town || a.village || a.state_district || a.county || '';
            
            setAddress({
              street: streetInfo,
              city: cityInfo,
              state: a.state || '',
              pincode: a.postcode || ''
            });
            
            toast.success("Location filled!", { id: toastId });
          } else {
            toast.error("Could not fetch address details", { id: toastId });
          }
        } catch (err) {
          toast.error("Network error fetching location", { id: toastId });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        toast.error("Please allow location access in your browser", { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Combine everything perfectly for the backend
    const fullAddress = `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`.trim();

    try {
      await bookingService.createBooking({ workerId, ...form, address: fullAddress });
      toast.success('Booking request sent!');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send booking');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Date & Time Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-zinc-500 dark:text-white/40 uppercase tracking-wider block mb-1">Date</label>
          <input name="date" type="date" required min={today} value={form.date} onChange={updateForm}
            className="w-full rounded-md border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-orange-500 outline-none transition-colors" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-zinc-500 dark:text-white/40 uppercase tracking-wider block mb-1">Time Slot</label>
          <select name="timeSlot" required value={form.timeSlot} onChange={updateForm}
            className="w-full rounded-md border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-orange-500 outline-none transition-colors">
            <option value="" disabled>Select time...</option>
            <option value="Morning (8 AM - 12 PM)">Morning (8 AM - 12 PM)</option>
            <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
            <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
          </select>
        </div>
      </div>

      {/* Address Block */}
      <div className="bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/5 rounded-lg p-3 space-y-3 transition-colors">
        <div className="flex justify-between items-center mb-1">
          <label className="text-[11px] font-semibold text-zinc-500 dark:text-white/40 uppercase tracking-wider">Service Address</label>
          <button type="button" onClick={fetchExactLocation} disabled={isLocating}
            className="text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-500/20 transition-colors">
            {isLocating ? 'Detecting...' : '📍 Auto-Detect'}
          </button>
        </div>
        
        <input name="street" type="text" required placeholder="House No., Building, Street..." value={address.street} onChange={updateAddress}
          className="w-full rounded-md border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#141414] px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none focus:border-orange-500 transition-colors" />
        
        <div className="grid grid-cols-3 gap-2">
          <input name="city" type="text" required placeholder="City" value={address.city} onChange={updateAddress}
            className="w-full rounded-md border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#141414] px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none focus:border-orange-500 transition-colors" />
          <input name="state" type="text" required placeholder="State" value={address.state} onChange={updateAddress}
            className="w-full rounded-md border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#141414] px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none focus:border-orange-500 transition-colors" />
          <input name="pincode" type="text" required placeholder="PIN" value={address.pincode} onChange={updateAddress}
            className="w-full rounded-md border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#141414] px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none focus:border-orange-500 transition-colors" />
        </div>
      </div>

      {/* Description */}
      <div>
         <label className="text-[11px] font-semibold text-zinc-500 dark:text-white/40 uppercase tracking-wider block mb-1">Task Details (Optional)</label>
         <textarea name="description" rows={2} placeholder="Describe the issue briefly..." value={form.description} onChange={updateForm}
          className="w-full rounded-md border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 focus:border-orange-500 outline-none resize-none transition-colors" />
      </div>

      <div className="flex items-center justify-between pt-2">
        {rateAmount ? (
          <p className="text-sm text-zinc-600 dark:text-white/60">Base cost: <span className="font-bold text-zinc-900 dark:text-white">₹{rateAmount}</span></p>
        ) : <div />}
        
        <button type="submit" disabled={submitting}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-md transition-colors shadow-sm">
          {submitting ? 'Sending...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}