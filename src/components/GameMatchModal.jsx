"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Edit,
  Save,
  Calendar,
  Trophy,
  Target,
  Award,
  Clock,
} from "lucide-react";

export default function GameMatchModal({
  game,
  onClose,
  onSchedule,
  onRefresh,
}) {
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editedDateTime, setEditedDateTime] = useState("");
  const [editedResult, setEditedResult] = useState({}); // { playerId : 'WIN' | 'LOSS' | 'DRAW' | '' }

  useEffect(() => {
    fetchGameData();
  }, [game.id]);

  async function fetchGameData() {
    setLoading(true);
    try {
      const participantsRes = await fetch(`/api/games/${game.id}/participants`);
      const matchesRes = await fetch(`/api/matches?gameId=${game.id}`);

      const participantsData = await participantsRes.json();
      const matchesData = await matchesRes.json();

      // Format scheduledAt for inputs
      const formattedMatches = matchesData.map((m) => ({
        ...m,
        scheduledAtIso: m.scheduledAt
          ? new Date(m.scheduledAt).toISOString().slice(0, 16)
          : "",
      }));

      setParticipants(participantsData.participants || []);
      setMatches(formattedMatches);
    } catch (error) {
      console.error("Failed to fetch game data:", error);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(match) {
    setEditingMatchId(match.id);
    setEditedDateTime(
      match.scheduledAtIso || new Date().toISOString().slice(0, 16)
    );

    // Initialize result state for each player in the match
    const results = {};
    match.players.forEach((p) => {
      results[p.userId] = p.result || "";
    });
    setEditedResult(results);
  }

  function cancelEdit() {
    setEditingMatchId(null);
    setEditedDateTime("");
    setEditedResult({});
  }

  async function saveEdit(matchId) {
    try {
      // Update schedule datetime
      if (!editedDateTime) {
        alert("Please select a valid date and time");
        return;
      }

      const updateScheduleRes = await fetch("/api/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, scheduledAt: editedDateTime }),
      });
      if (!updateScheduleRes.ok) {
        alert("Failed to update match schedule");
        return;
      }

      // Update match result for each player
      for (const [playerId, result] of Object.entries(editedResult)) {
        if (result) {
          const updateResultRes = await fetch("/api/matches", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              matchId,
              playerId,
              result,
              status: "COMPLETED",
            }),
          });
          if (!updateResultRes.ok) {
            alert(`Failed to update result for player ${playerId}`);
            return;
          }
        }
      }

      alert("Match schedule and results updated!");
      cancelEdit();
      fetchGameData();
      onRefresh();
    } catch (error) {
      alert("Error updating match");
      console.error(error);
    }
  }

  const getResultIcon = (result) => {
    switch (result) {
      case "WIN":
        return { icon: Trophy, color: "text-green-400" };
      case "LOSS":
        return { icon: Target, color: "text-red-400" };
      case "DRAW":
        return { icon: Award, color: "text-yellow-400" };
      default:
        return { icon: Clock, color: "text-gray-400" };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 border-4 border-white/20 border-t-white rounded-full mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{game.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-white">{game.name}</h2>
              <p className="text-gray-400">
                {game.type} • {game.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Matches List */}
        <div className="p-6 space-y-6">
          {matches.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No matches scheduled yet.
            </div>
          )}

          {matches.map((match) => {
            const { icon: StatusIcon, color } = getResultIcon(
              match.status || ""
            );
            const isEditing = editingMatchId === match.id;

            return (
              <div
                key={match.id}
                className="bg-white/10 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">
                    Match ID: {match.id}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={color} />
                    <span className={`text-sm font-medium ${color}`}>
                      {match.status || "Pending"}
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(match)}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Edit match schedule & results"
                      >
                        <Edit />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 font-semibold">
                    Scheduled Date & Time:
                  </label>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={editedDateTime}
                      onChange={(e) => setEditedDateTime(e.target.value)}
                      className="w-full rounded bg-white/10 text-white px-3 py-2"
                    />
                  ) : (
                    <p className="text-white">
                      {match.scheduledAt
                        ? new Date(match.scheduledAt).toLocaleString()
                        : "Not scheduled"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 font-semibold">
                    Participants & Results:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {match.players.map((playerMatch) => {
                      const isPlayerEditing = isEditing;
                      return (
                        <div
                          key={playerMatch.id}
                          className="flex items-center justify-between gap-3 bg-white/20 rounded p-2 text-white"
                        >
                          <div>
                            {playerMatch.user.fullName ||
                              playerMatch.user.secretCode}
                          </div>
                          {isPlayerEditing ? (
                            <select
                              value={
                                editedResult[playerMatch.userId] ??
                                playerMatch.result ??
                                ""
                              }
                              onChange={(e) =>
                                setEditedResult((prev) => ({
                                  ...prev,
                                  [playerMatch.userId]: e.target.value,
                                }))
                              }
                              className="bg-black text-white rounded px-2 py-1"
                            >
                              <option value="">Select Result</option>
                              <option value="WIN">Win</option>
                              <option value="LOSS">Loss</option>
                              <option value="DRAW">Draw</option>
                            </select>
                          ) : (
                            <span className="font-semibold">
                              {playerMatch.result || "Pending"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={cancelEdit}
                      className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(match.id)}
                      className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
