import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= SEARCH FILTER ================= */
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  /* ================= BLOCK / UNBLOCK ================= */
  const toggleBlock = async user => {
    if (user.role === "admin") return;

    await axios.patch(
      `${API_BASE}/users/${user.id}`,
      {
        isBlocked: !user.isBlocked,
      }
    );

    setUsers(prev =>
      prev.map(u =>
        u.id === user.id
          ? { ...u, isBlocked: !u.isBlocked }
          : u
      )
    );
  };

  /* ================= DELETE USER ================= */
  const deleteUser = async user => {
    if (user.role === "admin") {
      alert("Cannot delete admin user");
      return;
    }

    if (!window.confirm("Delete this user?"))
      return;

    await axios.delete(
      `${API_BASE}/users/${user.id}`
    );

    setUsers(prev =>
      prev.filter(u => u.id !== user.id)
    );
  };

  /* ================= ROLE BADGE STYLE ================= */
  const getRoleStyle = role => {
    if (role === "admin")
      return "bg-red-600 text-white";
    return "bg-blue-600 text-white";
  };

  if (loading)
    return <p className="p-6">Loading users...</p>;

  if (error)
    return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">
        Users Management
      </h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={e =>
          setSearch(e.target.value)
        }
        className="mb-4 p-2 border rounded w-full max-w-md"
      />

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">
                Name
              </th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map(user => (
              <tr
                key={user.id}
                className="border-t"
              >
                <td className="p-3">
                  {user.name}
                </td>
                <td>{user.email}</td>

                {/* ROLE */}
                <td>
                  <span
                    className={`px-3 py-1 rounded text-sm ${getRoleStyle(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* BLOCK STATUS */}
                <td>
                  {user.isBlocked ? (
                    <span className="text-red-500">
                      Blocked
                      
                    </span>
                    // console.log("Latest user:", latestUser);
                  ) : (
                    <span className="text-green-500">
                      Active
                    </span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="space-x-2">
                  <Link
                    to={`/admin/users/${user.id}`}
                    className="bg-black text-white px-3 py-1 rounded text-sm"
                  >
                    View
                  </Link>

                  {user.role !== "admin" && (
                    <>
                      <button
                        onClick={() =>
                          toggleBlock(user)
                        }
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                      >
                        {user.isBlocked
                          ? "Unblock"
                          : "Block"}
                      </button>

                      <button
                        onClick={() =>
                          deleteUser(user)
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <p className="mt-4 text-gray-500">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Users;