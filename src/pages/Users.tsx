import { useEffect, useState } from "react";
import { getUsers } from "../api/usersApi";
import { getUserRole } from '../utils/GetRole'
import { ListFilter, Plus, Search, SquarePen, Trash } from "lucide-react";
import Button from "../components/Button";


const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      setLoading(true);
      getUsers()
        .then((data) => setUsers(data))
        .catch((error) => console.error("Error GET users", error))
        .finally(() => setLoading(false))
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = users.slice(indexOfFirst, indexOfLast);
  const numberOfPages = Math.ceil(users.length / itemsPerPage);

   if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-[var(--primary)]"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Liste Produits</h1>
      <div className="grid grid-cols-3 gap-10 mb-8">
          <label className="input">
              <Search />
              <input type="search" required placeholder="Rechercher" />
          </label>
          <Button variant="primary" size="md">
              <Plus /> Ajouter utilisateur
          </Button>
          <Button variant="greyghost" size="md">
              <ListFilter /> Filtrer liste
          </Button>
      </div>
      <div className='overfow-x-auto'>
          <table className="table">
              <thead>
                <tr className="bg-base-200 text-[var(--black)]">
                  <th>🏷️ Prénom</th>
                  <th>👤 Nom</th>
                  <th>✉️ Email</th>
                  <th>⏰ Derniére connexion</th>
                  <th>🛡️ Rôle</th>
                  <th>⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className='transition-all duration-300 ease-in-out'>
                {currentItems.map((row, index) => (
                  <tr key={index} className="hover:bg-base-200">
                    <td className='capitalize'>{row.first_name}</td>
                    <td className='capitalize'>{row.last_name}</td>
                    <td>{row.email}</td>
                    <td>{row.last_login ? new Date(row.last_login).toLocaleString() : "Jamais"}</td>
                    <td>{getUserRole(row)}</td>
                    <td className='flex flex-direction-row gap-6'>
                      <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:var(--primary)]"
                      >
                        <SquarePen/>
                      </button>
                      <button className="btn btn-xs bg-transparent border border-0 hover:text-[color:red]"
                      >
                        <Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
      </div>
      {/* pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        <button 
          className="btn btn-sm bg-[var(--black)] text-[var(--brokenWhite)]" 
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </button>

        <span className="px-3 py-1 text-xs">
          Page {currentPage} sur ( {numberOfPages} )  
        </span>

        <button 
          className="btn btn-sm bg-[var(--black)] text-[var(--brokenWhite)]" 
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={indexOfLast >= users.length}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default UsersPage;
