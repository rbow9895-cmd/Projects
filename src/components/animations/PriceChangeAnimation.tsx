import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceChangeAnimationProps {
  price: number;
  previousPrice: number;
  className?: string;
}

const PriceChangeAnimation: React.FC<PriceChangeAnimationProps> = ({
  price,
  previousPrice,
  className = ''
}) => {
  const isPositive = price > previousPrice;
  const change = price - previousPrice;
  const changePercent = ((change / previousPrice) * 100).toFixed(2);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={price}
        className={className}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.2, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.span
          animate={{
            color: isPositive ? '#10b981' : '#ef4444',
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 0.5,
            times: [0, 0.5, 1]
          }}
        >
          ${price.toLocaleString()}
        </motion.span>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`inline-flex items-center ml-2 ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          <motion.span
            animate={{
              rotate: isPositive ? [0, 10, -10, 0] : [0, -10, 10, 0]
            }}
            transition={{ duration: 0.6 }}
          >
            {isPositive ? '↗' : '↘'}
          </motion.span>
          <span className="ml-1">{changePercent}%</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PriceChangeAnimation;
