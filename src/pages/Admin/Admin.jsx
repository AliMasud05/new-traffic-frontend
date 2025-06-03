import axios from "axios";
import { Loader2, Edit2, Trash2, Plus, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [updatingAdmin, setUpdatingAdmin] = useState(false);
  const token = localStorage.getItem("token");

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchUsers();
    }
  }, [token, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://traffic-solve-cors-backend.vercel.app/api/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response?.data?.data);
    } catch (error) {
      console.error("Failed to fetch Users", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    setDeletingAdmin(id);
    try {
      await axios.delete(
        `https://traffic-solve-cors-backend.vercel.app/api/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Admin deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete admin", error);
      toast.error("Failed to delete admin");
    } finally {
      setDeletingAdmin(null);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      await axios.post(
        "https://traffic-solve-cors-backend.vercel.app/api/users/register",
        { username, email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Admin created successfully");
      fetchUsers();
      setUsername("");
      setPassword("");
      setEmail("");
      setIsCreateFormOpen(false);
    } catch (error) {
      console.error("Failed to create admin", error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleEditAdmin = (user) => {
    setEditingUserId(user._id);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditPassword("");
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setUpdatingAdmin(true);
    try {
      const updateData = { username: editUsername, email: editEmail };
      if (editPassword) updateData.password = editPassword;

      await axios.put(
        `https://traffic-solve-cors-backend.vercel.app/api/users/${editingUserId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Admin updated successfully");
      fetchUsers();
      cancelEdit();
    } catch (error) {
      console.error("Failed to update admin", error);
      toast.error(error.response?.data?.message || "Failed to update admin");
    } finally {
      setUpdatingAdmin(false);
    }
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditUsername("");
    setEditEmail("");
    setEditPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Management</h1>
          <button
            onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            {isCreateFormOpen ? "Close Form" : "Create Admin"}
          </button>
        </div>

        {/* Create Admin Form */}
        {isCreateFormOpen && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Create New Admin
            </h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
                >
                  {creatingAdmin ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Check size={18} />
                  )}
                  {creatingAdmin ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Admin Users</h2>
          </div>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map((user) => (
                <li
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {editingUserId === user._id ? (
                    <form
                      onSubmit={handleUpdateAdmin}
                      className="p-4 md:p-6 bg-gray-50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            type="submit"
                            disabled={updatingAdmin}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-70"
                          >
                            {updatingAdmin ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md transition-colors"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6">
                      <div className="mb-3 md:mb-0">
                        <h3 className="font-medium text-gray-900">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAdmin(user)}
                          disabled={deletingAdmin !== null}
                          className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded-md transition-colors disabled:opacity-70"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(user._id)}
                          disabled={deletingAdmin !== null}
                          className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md transition-colors disabled:opacity-70"
                        >
                          {deletingAdmin === user._id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;