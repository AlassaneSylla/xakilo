import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorBoundary() {
  const error    = useRouteError();
  const navigate = useNavigate();

  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const title = is404 ? '404 — Page introuvable' : 'Une erreur est survenue';
  const msg   = is404
    ? "Cette page n'existe pas ou vous n'avez pas les droits d'accès."
    : "Une erreur inattendue s'est produite. Veuillez réessayer.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 gap-6 px-4">
      <div className="text-6xl font-black text-[var(--primary)] opacity-30">{is404 ? '404' : '!'}</div>
      <h1 className="text-2xl font-bold text-center">{title}</h1>
      <p className="text-gray-500 text-center max-w-md">{msg}</p>
      <div className="flex gap-3">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>Retour</button>
        <button className="btn bg-[var(--black)] text-[var(--brokenWhite)]" onClick={() => navigate('/')}>
          Accueil
        </button>
      </div>
    </div>
  );
}
