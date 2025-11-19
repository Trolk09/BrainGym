import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [pointsToChange, setPointsToChange] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const loadLeaderboard = () => {
    const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    setUsers(data);
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const handleClear = () => {
    localStorage.setItem("leaderboard", "[]");
    loadLeaderboard();
  };

  const updatePoints = (isAdding: boolean) => {
    const amount = Number(pointsToChange);
    if (!selectedUser || isNaN(amount) || amount <= 0) return;

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    const user = leaderboard.find((u: any) => u.username === selectedUser);

    if (user) {
      if (isAdding) {
        user.points += amount;
      } else {
        user.points -= amount;
        if (user.points < 0) user.points = 0;
      }
    }

    leaderboard.sort((a: any, b: any) => b.points - a.points);

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    setPointsToChange("");
    loadLeaderboard();
  };

  // ➕ ADD NEW USER
  const addUser = () => {
    if (!newUsername.trim()) return;

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

    // avoid duplicates
    if (leaderboard.find((u: any) => u.username === newUsername)) {
      alert("User already exists!");
      return;
    }

    leaderboard.push({
      username: newUsername,
      points: 0,
      ip: "Unknown",
    });

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    setNewUsername("");
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

      {/* ➕ ADD USER */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Add New User</h2>

        <Input
          type="text"
          placeholder="Enter username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />

        <Button onClick={addUser} className="w-full">
          Create User
        </Button>
      </Card>

      {/* ADD / SUBTRACT POINTS */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Modify User Points</h2>

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
          value={pointsToChange}
          onChange={(e) => setPointsToChange(e.target.value)}
        />

        <div className="flex gap-4">
          <Button onClick={() => updatePoints(true)} className="w-1/2">
            Add Points
          </Button>

          <Button
            onClick={() => updatePoints(false)}
            variant="destructive"
            className="w-1/2"
          >
            Subtract Points
          </Button>
        </div>
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
