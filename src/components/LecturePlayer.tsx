import { useState, useEffect, useRef } from 'react';
import { TeacherAvatar } from './TeacherAvatar';

// Simple Whiteboard with typing effect
function Whiteboard({ text, typingDuration = 2000, onTyped }: { text: string, typingDuration?: number, onTyped?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const totalSteps = text.length;
    const intervalMs = totalSteps > 0 ? typingDuration / totalSteps : typingDuration;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        if (onTyped) onTyped();
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [text, typingDuration, onTyped]);
  return (
    <div style={{ background: '#fff', border: '1px solid #ccc', padding: 16, minHeight: 80, fontSize: 24 }}>
      {displayed}
    </div>
  );
}

export function LecturePlayer({ lecture, forceTalking, forceAnimate, typingDuration, onTyped }: {
  lecture: Array<{ stepType: string, content: string }>;
  forceTalking?: boolean;
  forceAnimate?: string;
  typingDuration?: number;
  onTyped?: () => void;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const step = lecture[stepIdx];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle "speak" step: fetch TTS and play audio
  useEffect(() => {
    if (step.stepType === 'speak') {
      setIsSpeaking(true);
      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: step.content, languageCode: 'en-IN' }),
      })
        .then(res => res.json())
        .then(data => {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
          audioRef.current = audio;
          audio.play();
          audio.onended = () => setIsSpeaking(false);
        });
    } else {
      setIsSpeaking(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  // Handle "animate" step: simple CSS animation
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (step.stepType === 'animate') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [stepIdx, step.stepType]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div style={{ width: 400, margin: '16px 0' }}>
        {step.stepType === 'write' && <Whiteboard text={step.content} typingDuration={typingDuration} onTyped={onTyped} />}
      </div>
      {/* Hide Next/Prev buttons if forceTalking/forceAnimate is used (auto mode) */}
      {typeof forceTalking === 'undefined' && typeof forceAnimate === 'undefined' && (
        <div className="flex gap-2">
          <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}>Prev</button>
          <button onClick={() => setStepIdx(Math.min(lecture.length - 1, stepIdx + 1))} disabled={stepIdx === lecture.length - 1}>Next</button>
        </div>
      )}
    </div>
  );
}
