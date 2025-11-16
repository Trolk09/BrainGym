import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function Admin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    setUsers(data);
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Users</h2>

        <div className="grid grid-cols-3 font-bold border-b pb-2">
          <span>Username</span>
          <span>Points</span>
          <span>IP Address</span>
        </div>

        {users.map((u, i) => (
          <div key={i} className="grid grid-cols-3 py-2 border-b">
            <span>{u.username}</span>
            <span>{u.points}</span>
            <span>{u.ip || "Unknown"}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
