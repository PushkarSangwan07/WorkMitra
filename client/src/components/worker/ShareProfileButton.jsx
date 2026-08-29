import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ShareProfileButton({ workerName, workerId }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/workers/${workerId}`;
  const shareText = `Check out ${workerName}'s profile on WorkMitra — India's trusted skilled worker platform.`;

  const handleShare = async () => {
    // Use native Web Share API if available (mobile browsers)
    if (navigator.share) {
      try {
        await navigator.share({ title: `${workerName} on WorkMitra`, text: shareText, url: shareUrl });
        return;
      } catch {
        // User cancelled share — fall through to copy
      }
    }

    // Desktop fallback — copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Profile link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2"
      title="Share this profile"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}
