
// MVP: Simple avatar image with mouth flap and gesture animation
import React from 'react';

type TeacherAvatarProps = {
  talking?: boolean;
  animate?: string;
};

export function TeacherAvatar({ talking = false, animate = '' }: TeacherAvatarProps) {
  // Use a PNG/SVG avatar in public/avatar.png
  // Mouth flap: animate mouth div when talking
  // Gesture: simple shake or wave animation
  return (
    <div
      style={{
        width: 200,
        height: 200,
        position: 'relative',
        margin: '0 auto',
        transition: 'transform 0.3s',
        transform:
          animate === 'wave'
            ? 'rotate(-10deg) scale(1.05)'
            : animate === 'shake'
            ? 'translateX(10px)'
            : 'none',
      }}
    >
      <img
        src="/avatar.png"
        alt="Teacher Avatar"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
      {/* Mouth flap animation */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '70%',
          width: 40,
          height: talking ? 24 : 10,
          background: '#222',
          borderRadius: '0 0 20px 20px',
          transform: 'translate(-50%, 0)',
          transition: 'height 0.2s',
        }}
      />
    </div>
  );
}

