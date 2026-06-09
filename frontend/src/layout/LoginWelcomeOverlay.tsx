import { motion } from 'framer-motion';
import logo from '../assets/xakilo_sm.png';

type Props = { name: string };

export default function LoginWelcomeOverlay({ name }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--black)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.img
        src={logo}
        alt="Xakilo"
        className="w-16 mb-8"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Checkmark SVG animé */}
      <motion.svg
        viewBox="0 0 52 52"
        className="w-14 h-14 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.circle
          cx="26" cy="26" r="24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M14 27 L22 35 L38 19"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 0.4, ease: 'easeOut' }}
        />
      </motion.svg>

      <motion.p
        className="text-[var(--brokenWhite)] text-2xl font-semibold"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.35 }}
      >
        Bienvenue, <span className="text-[var(--primary)]">{name}</span> !
      </motion.p>

      <motion.p
        className="text-gray-500 text-xs mt-2 tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.3 }}
      >
        Chargement de votre espace…
      </motion.p>
    </motion.div>
  );
}