export const getUserRole = (user: any) => {
  if (user.is_superuser) return "Administrateur";
  if (user.is_staff) return "Employé";
  return "Utilisateur";
};
