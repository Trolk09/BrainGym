import { useEffect, useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const updatePoints = async (id, newPoints) => {
    const res = await fetch("/api/admin/edit-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, points: Number(newPoints) }),
    });

    const data = await res.json();
    setMsg(data.message);

    loadUsers(); // refresh
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin — Edit Points</h1>

      {msg && <p className="text-green-600 mb-4">{msg}</p>}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Points</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.name || "(No Name)"}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">
                <input
                  type="number"
                  defaultValue={u.points}
                  className="border p-1 rounded w-24"
                  onChange={(e) => (u._newPoints = e.target.value)}
                />
              </td>
              <td className="p-2">
                <button
                  onClick={() =>
                    updatePoints(u.id, u._newPoints ?? u.points)
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
