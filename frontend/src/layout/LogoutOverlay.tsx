import { motion } from 'framer-motion';
import logo from '../assets/xakilo_sm.png';

export default function LogoutOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--black)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <motion.img
        src={logo}
        alt="Xakilo"
        className="w-20 mb-6"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
      />
      <motion.p
        className="text-[var(--brokenWhite)] text-sm font-semibold tracking-[0.3em] uppercase"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.35 }}
      >
        À bientôt…
      </motion.p>
      <motion.div
        className="mt-6 w-8 h-0.5 bg-[var(--primary)] rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.9, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
