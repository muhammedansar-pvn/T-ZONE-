import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../../../config/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      const fetchedUsers = (res.data.users || res.data || []).map(u => ({
        ...u,
        id: u.id || u._id,
      }));
      setUsers(fetchedUsers);
    } catch (err) {
      console.error(err);
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
    const userId = user.id || user._id;

    await API.patch(
      `/users/${userId}`,
      {
        isBlocked: !user.isBlocked,
      }
    );

    setUsers(prev =>
      prev.map(u =>
        (u.id || u._id) === userId
          ? { ...u, isBlocked: !u.isBlocked }
          : u
      )
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