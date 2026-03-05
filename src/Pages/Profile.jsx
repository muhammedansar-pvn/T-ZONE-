import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const Profile = () => {
  const { user, logout, updateProfile } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [address, setAddress] = useState(user?.address || "");

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSave = () => {
    if (name.trim().length < 3) {
      alert("Enter valid name");
      return;
    }

    updateProfile({ name, mobile, address });
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center px-4">
      <div className="bg-gray-900 p-10 rounded-2xl w-full max-w-md shadow-xl">

        <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center">
          My Profile
        </h2>

        {editMode ? (
          <>
            <input
              type="text"
              className="w-full mb-3 p-3 rounded bg-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />

            <input
              type="text"
              className="w-full mb-3 p-3 rounded bg-gray-800"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile"
            />

            <textarea
              className="w-full mb-3 p-3 rounded bg-gray-800"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
            />

            <button
              onClick={handleSave}
              className="w-full bg-green-600 py-3 rounded-xl mb-3"
            >
              Save Changes
            </button>
          </>
        ) : (
          <>
            <p className="mb-2">
              <strong>Name:</strong> {user.name}
            </p>

            <p className="mb-2">
              <strong>Email:</strong> {user.email}
            </p>

            <p className="mb-2">
              <strong>Mobile:</strong>{" "}
              {user.mobile || "Not added"}
            </p>

            <p className="mb-6">
              <strong>Address:</strong>{" "}
              {user.address || "Not added"}
            </p>

            <button
              onClick={() => setEditMode(true)}
              className="w-full bg-yellow-500 text-black py-3 rounded-xl mb-3"
            >
              Edit Profile
            </button>
          </>
        )}

        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="w-full bg-red-600 py-3 rounded-xl"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
