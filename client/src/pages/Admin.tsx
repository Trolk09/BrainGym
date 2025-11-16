import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState("");

  // Load leaderboard from storage
  const loadLeaderboard = () => {
    const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    setUsers(data);
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Clear leaderboard
  const handleClear = () => {
    localStorage.setItem("leaderboard", "[]");
    loadLeaderboard();
  };

  // Add points to a selected user
  const handleAddPoints = () => {
    const amount = Number(pointsToAdd);
    if (!selectedUser || isNaN(amount) || amount <= 0) return;

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    const user = leaderboard.find((u: any) => u.username === selectedUser);

    if (user) {
      user.points += amount;
    }

    leaderboard.sort((a: any, b: any) => b.points - a.points);

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    setPointsToAdd("");
    loadLeaderboard();
  };

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* USERS TABLE */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Leaderboard Users</h2>

        <div className="grid grid-cols-3 font-bold border-b pb-2">
          <span>Username</span>
          <span>Points</span>
          <span>IP Address</span>
        </div>

        {users.map((u: any, i: number) => (
          <div key={i} className="grid grid-cols-3 py-2 border-b">
            <span>{u.username}</span>
            <span>{u.points}</span>
            <span>{u.ip || "Unknown"}</span>
          </div>
        ))}
      </Card>

      {/* ADD POINTS */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Add Points to User</h2>

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border p-2 rounded-md w-full"
        >
          <option value="">Select a user</option>
          {users.map((u: any, i: number) => (
            <option key={i} value={u.username}>
              {u.username}
            </option>
          ))}
        </select>

        <Input
          type="number"
          placeholder="Enter points"
          value={pointsToAdd}
          onChange={(e) => setPointsToAdd(e.target.value)}
        />

        <Button onClick={handleAddPoints} className="w-full">
          Add Points
        </Button>
      </Card>

      {/* CLEAR LEADERBOARD */}
      <Card className="p-6 space-y-4 border-red-500 border-2">
        <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>

        <Button variant="destructive" onClick={handleClear} className="w-full">
          Clear Leaderboard
        </Button>
      </Card>
    </div>
  );
}
