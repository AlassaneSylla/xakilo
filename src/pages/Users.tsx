import { useEffect, useState } from "react";
import { getUsers } from "../api/usersApi";


const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
      getUsers()
        .then((data) => setUsers(data))
        .catch((error) => console.error("Error GET users", error));
    }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold uppercase">Liste des utilisateurs</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email} {user.is_staff ? "(Admin)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
