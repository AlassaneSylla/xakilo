import React, {
  createContext, useCallback, useContext,
  useEffect, useRef, useState,
} from 'react';
import toast from 'react-hot-toast';
import { getCurrentSession, openSession, closeSession } from '../features/cash/api/sessionApi';
import { useAuth } from './AuthProvider';
import type { CashSession } from '../features/cash/types';

type CashSessionContextType = {
  session:       CashSession | null;
  loading:       boolean;
  needsSession:  boolean;
  open:          (opening_balance: number) => Promise<void>;
  close:         (closing_balance: number) => Promise<CashSession>;
  refresh:       () => Promise<void>;
  ensureSession: () => Promise<boolean>;
};

const CashSessionContext = createContext<CashSessionContextType>({
  session: null, loading: true, needsSession: false,
  open: async () => {}, close: async () => ({} as CashSession),
  refresh: async () => {}, ensureSession: async () => true,
});

export function CashSessionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [session,      setSession]      = useState<CashSession | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [balance,      setBalance]      = useState('');
  const [opening,      setOpening]      = useState(false);

  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const needsSession = !!user && user.role !== 'OWNER' && !user.is_superuser;

  const refresh = useCallback(async () => {
    if (!needsSession) { setLoading(false); return; }
    try {
      const s = await getCurrentSession();
      setSession(s);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [needsSession]);

  useEffect(() => { refresh(); }, [refresh]);

  const open = async (opening_balance: number) => {
    const s = await openSession(opening_balance);
    setSession(s);
  };

  const close = async (closing_balance: number): Promise<CashSession> => {
    const s = await closeSession(closing_balance);
    setSession(null);
    return s;
  };

  // Retourne true si la session est déjà ouverte (ou pas requise).
  // Sinon affiche la modale et retourne une Promise qui se résout
  // à true (session ouverte) ou false (annulé).
  const ensureSession = useCallback((): Promise<boolean> => {
    if (!needsSession || session) return Promise.resolve(true);
    setModalVisible(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, [needsSession, session]);

  const handleConfirm = async () => {
    setOpening(true);
    try {
      await open(Number(balance) || 0);
      toast.success('Session ouverte !');
      setModalVisible(false);
      setBalance('');
      resolverRef.current?.(true);
    } catch {
      toast.error("Erreur lors de l'ouverture de la session.");
    } finally {
      setOpening(false);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setBalance('');
    resolverRef.current?.(false);
    resolverRef.current = null;
  };

  return (
    <CashSessionContext.Provider value={{ session, loading, needsSession, open, close, refresh, ensureSession }}>
      {children}

      {/* ── Modale d'ouverture de session à la volée ─────────────── */}
      {modalVisible && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold mb-1">Session de caisse requise</h3>
            <p className="text-xs text-gray-400 mb-5">
              Ouvrez votre session pour continuer cette opération.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  Fond de caisse d'ouverture (F)
                </label>
                <input
                  type="number" min={0}
                  placeholder="Ex : 5 000"
                  className="input input-bordered w-full"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  className="btn btn-ghost flex-1"
                  onClick={handleCancel}
                  disabled={opening}
                >
                  Annuler
                </button>
                <button
                  className="btn bg-gray-900 text-white hover:bg-gray-700 border-0 flex-1"
                  onClick={handleConfirm}
                  disabled={opening}
                >
                  {opening
                    ? <span className="loading loading-spinner loading-sm" />
                    : 'Ouvrir la session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CashSessionContext.Provider>
  );
}

export function useCashSession() {
  return useContext(CashSessionContext);
}