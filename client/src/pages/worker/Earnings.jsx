import { useEffect, useState } from 'react';
import workerService from '../../services/worker.service';
import Loader from '../../components/common/Loader';

export default function WorkerEarnings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workerService.getMyProfile().then(setProfile).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="pt-20">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Earnings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total earnings</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{profile?.earnings?.toLocaleString() || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Jobs completed</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{profile?.jobsCompleted || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average rating</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">⭐ {profile?.ratingAvg?.toFixed?.(1) || '0.0'}</p>
        </div>
      </div>
    </div>
  );
}
