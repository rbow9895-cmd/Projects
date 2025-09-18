import React from 'react';
import { motion } from 'framer-motion';

interface TokenFloatAnimationProps {
  children: React.ReactNode;
  intensity?: number;
  duration?: number;
  className?: string;
}

const TokenFloatAnimation: React.FC<TokenFloatAnimationProps> = ({
  children,
  intensity = 10,
  duration = 3,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -intensity, 0],
        rotate: [0, 2, -2, 0]
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

export default TokenFloatAnimation;
