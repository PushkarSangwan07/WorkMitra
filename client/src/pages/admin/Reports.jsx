import { useState, useEffect } from 'react';
import {toast} from 'sonner';
import adminService from '../../services/admin.service';
import Loader from '../../components/common/Loader';
import api from '../../services/api';

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            // Fetch reports from backend (Needs to be built on backend!)
            const data = await adminService.getAllReports();
            setReports(data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            await adminService.updateReportStatus(reportId, newStatus);
            toast.success(`Report marked as ${newStatus}`);
            // Instantly update the UI without refreshing the page
            setReports(reports.map(r => r._id === reportId ? { ...r, status: newStatus } : r));
        } catch (error) {
            toast.error('Failed to update report');
        }
    };

  const handleBanWorker = async (workerId) => {
    // 1. Ask the admin for a reason using a browser prompt
    const banReason = window.prompt("Please enter the reason for banning this worker:");
    
    // 2. If they hit "Cancel" or leave it totally empty, stop the function
    if (banReason === null || banReason.trim() === "") {
        toast.error("Ban cancelled. A reason is required.");
        return; 
    }

    try {
        // 3. Send the reason in the body of the POST request
        await api.post(`/admin/workers/${workerId}/ban`, { reason: banReason });
        toast.success('Worker banned! Email notification sent.');
        
        // (Optional) Update your UI state to show them as banned
        
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to ban worker.';
        toast.error(`Error: ${errorMessage}`);
    }
};


 const handleUnbanWorker = async (workerId) => {
    try {
        // Let's also log the ID just to be 100% sure it's not undefined!
        console.log("Attempting to unban ID:", workerId); 
        
        await api.post(`/admin/workers/${workerId}/unban`);
        toast.success('Worker unbanned! Email notification sent.');
        
    } catch (error) {
        // THIS WILL PRINT THE EXACT BACKEND ERROR TO YOUR SCREEN
        const errorMessage = error.response?.data?.message || error.message || 'Failed to unban worker.';
        toast.error(`Error: ${errorMessage}`);
        console.error("Full error:", error);
    }
};

    if (loading) return <Loader size="lg" />;

    return (
        <div className="p-6 max-w-7xl mx-auto pt-20 ">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Reports & Complaints</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Review customer complaints and take action against workers violating policies.
                </p>
            </div>

            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/10 uppercase tracking-wider text-xs font-bold text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Reporter (Customer)</th>
                                <th className="p-4">Reported Worker</th>
                                <th className="p-4">Reason & Details</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Admin Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No reports found. Your platform is running smoothly!
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">

                                        {/* Date */}
                                        <td className="p-4 text-gray-600 dark:text-gray-300">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>

                                        {/* Customer */}
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {report.reporter?.name || 'Unknown'}
                                            <div className="text-xs text-gray-500 font-normal">{report.reporter?.email}</div>
                                        </td>

                                        {/* Worker */}
                                        <td className="p-4 font-medium text-orange-600 dark:text-orange-400">
                                            {report.reportedWorker?.name || 'Unknown'}
                                        </td>

                                        {/* Reason */}
                                        <td className="p-4 max-w-xs whitespace-normal">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 mb-1">
                                                {report.reason.replace('_', ' ')}
                                            </span>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed truncate">
                                                {report.details || 'No additional details provided.'}
                                            </p>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' :
                                                report.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right space-x-2">
                                            {report.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(report._id, 'resolved')} className="text-xs font-bold px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">
                                                        Resolve
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(report._id, 'dismissed')} className="text-xs font-bold px-3 py-1.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white rounded-md transition-colors">
                                                        Dismiss
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                // THE FIX: Grab the _id if it's an object, OR fallback to the raw string
                                                onClick={() => handleBanWorker(report.reportedWorker?._id || report.reportedWorker)}
                                                className="text-xs font-bold px-3 py-1.5 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors ml-2"
                                            >
                                                Ban Worker
                                            </button>
                                            <button
                                                onClick={() => handleUnbanWorker(report.reportedWorker?._id || report.reportedWorker)}
                                                className="text-xs font-bold px-3 py-1.5 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-md transition-colors ml-2"
                                            >
                                                Unban Worker
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}