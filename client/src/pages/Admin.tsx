import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [username, setUsername] = useState("");
  const [points, setPoints] = useState<number | "">("");

  // Fetch leaderboard
  async function loadLeaderboard() {
    const res = await fetch("/admin/leaderboard");
    const data = await res.json();
    setLeaderboard(data);
  }

  // Reset leaderboard
  async function resetLeaderboard() {
    await fetch("/admin/reset-leaderboard", { method: "POST" });
    loadLeaderboard();
  }

  // Update points for user
  async function updatePoints() {
    if (!username || points === "") return;

    await fetch("/admin/update-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        newPoints: Number(points),
      }),
    });

    setUsername("");
    setPoints("");
    loadLeaderboard();
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>

      {/* Reset leaderboard */}
      <div className="mb-6">
        <Button onClick={resetLeaderboard} className="bg-red-600 text-white">
          Reset Leaderboard
        </Button>
      </div>

      {/* Edit user points */}
      <div className="mb-8 bg-gray-100 p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">Edit User Points</h2>

        <div className="flex gap-3 items-center">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border px-3 py-2 rounded w-40"
            placeholder="Username"
          />

          <input
            value={points}
            onChange={(e) => setPoints(e.target.value ? Number(e.target.value) : "")}
            className="border px-3 py-2 rounded w-32"
            placeholder="Points"
            type="number"
          />

          <Button onClick={updatePoints} className="bg-blue-600 text-white">
            Update
          </Button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">User</th>
            <th className="p-2 border">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row: any, i) => (
            <tr key={i} className="even:bg-gray-50">
              <td className="p-2 border">{row.username}</td>
              <td className="p-2 border">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
