import { useState, useEffect } from 'react';

export default function useTypewriter(texts, typingSpeed = 60, pauseDuration = 2000, deletingSpeed = 30) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(timer);
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
        return;
      }
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(timer);
    }

    if (displayText.length === currentText.length) {
      setIsPaused(true);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayText(currentText.slice(0, displayText.length + 1));
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, textIndex, isDeleting, isPaused, texts, typingSpeed, pauseDuration, deletingSpeed]);

  return displayText;
}
