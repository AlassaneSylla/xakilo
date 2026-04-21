export const getUserRole = (user: any) => {
  if (user.is_superuser)
    return (
      <div className="badge badge-outline badge-accent text-xs py-2 px-1 font-semibold">
        Administrateur
      </div>
    );

  if (user.is_staff) 
    return (
      <div className="badge badge-ghost text-xs py-2 px-1 font-semibold">
        Employé
      </div>
    );

  return "Utilisateur";
};
