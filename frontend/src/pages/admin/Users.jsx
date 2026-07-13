import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/ProtectedRoute';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users').then(({ data }) => setUsers(data.data.users)).finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const toggleActive = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-active`);
      fetchUsers();
      toast.success('Customer status updated.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Customers</h1>
      <div className="bg-surface-container-lowest rounded-md  overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-surface-container-high">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3 text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="p-3">
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleActive(u._id)} className="text-xs text-primary font-semibold">
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
