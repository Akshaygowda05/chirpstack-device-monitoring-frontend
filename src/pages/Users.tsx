import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";



interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  application?: {
    name: string;
  };
}

function Users() {
  
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/v1/users"); 
        console.log("Fetched users:", res.data);
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <div>
        <h2>Users List</h2>
        <button onClick={() => navigate("/users/create")}>Create User</button>
      </div>
      


  <button onClick={()=>{
    navigate('/users/create')
  }}>

  </button>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Application</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? "Yes" : "No"}</td>
              <td>{user.application?.name || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;