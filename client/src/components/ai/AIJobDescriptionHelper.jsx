import { useState } from 'react';

export default function AIJobDescriptionHelper({ value, onChange, profession }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enhance = async () => {
    if (!value?.trim()) {
      setError('Write a few words about the job first, then click Enhance.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are helping a customer in India write a clear job description for hiring a ${profession || 'skilled worker'} on WorkMitra, a labor marketplace app.

The customer wrote this rough description:
"${value}"

Rewrite it as a clear, professional job description in 3-5 sentences. Include:
- What needs to be done specifically
- Any relevant details about the location or scale of work
- What a good worker should bring or be capable of

Keep it practical and in plain English. Do NOT add fake details the user didn't mention. Return ONLY the improved description text, no headings or extra commentary.`,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || 'AI request failed');
      }

      const improved = data.content?.[0]?.text?.trim();
      if (improved) {
        onChange(improved);
      }
    } catch (err) {
      setError('Could not enhance description. Please try again.');
      console.error('[AI helper]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
          Describe the job <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <button
          type="button"
          onClick={enhance}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:opacity-50 transition-colors"
          title="Let AI improve your description"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enhancing...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              ✨ Enhance with AI
            </>
          )}
        </button>
      </div>

      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Need to fix a leaking pipe in bathroom and kitchen..."
        className="input resize-none"
      />

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      <p className="mt-1 text-[10px] text-gray-400">
        💡 Tip: Write a rough description, then click "Enhance with AI" to make it clearer and more professional.
      </p>
    </div>
  );
}
