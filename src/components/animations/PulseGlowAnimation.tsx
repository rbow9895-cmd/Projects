import React from 'react';
import { motion } from 'framer-motion';

interface PulseGlowAnimationProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  duration?: number;
  className?: string;
}

const PulseGlowAnimation: React.FC<PulseGlowAnimationProps> = ({
  children,
  color = '#4F46E5',
  intensity = 0.3,
  duration = 2,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`,
          `0 0 20px 10px ${color}${Math.floor(intensity * 0.5 * 255).toString(16).padStart(2, '0')}`,
          `0 0 0 0 ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`
        ]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export default PulseGlowAnimation;
