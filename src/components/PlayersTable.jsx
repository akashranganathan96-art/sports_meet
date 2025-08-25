"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Edit,
  Download,
  Search,
  Filter,
  Trophy,
  Target,
  Minus,
} from "lucide-react";
import PlayerDetailsModal from "./PlayerDetailsModal";
import PlayerEditModal from "./PlayerEditModal";

export default function PlayersTable() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "serialNo",
    direction: "asc",
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch("/api/players");
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error("Failed to fetch players:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export?type=players");
      const data = await response.json();

      // Convert to CSV
      const csvContent = convertToCSV(data.data);
      downloadCSV(csvContent, data.filename);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((value) =>
            typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value
          )
          .join(",")
      )
      .join("\n");

    return `${headers}\n${rows}`;
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const getStatusBadge = (wins, losses, draws) => {
    if (wins > losses && wins > draws)
      return {
        label: "Winner",
        color: "bg-green-500/20 text-green-400",
        icon: Trophy,
      };
    if (losses > wins && losses > draws)
      return {
        label: "Challenger",
        color: "bg-red-500/20 text-red-400",
        icon: Target,
      };
    if (draws > wins && draws > losses)
      return {
        label: "Balanced",
        color: "bg-yellow-500/20 text-yellow-400",
        icon: Minus,
      };
    if (wins === 0 && losses === 0 && draws === 0)
      return {
        label: "New Player",
        color: "bg-blue-500/20 text-blue-400",
        icon: Trophy,
      };
    return {
      label: "Active",
      color: "bg-purple-500/20 text-purple-400",
      icon: Trophy,
    };
  };

  // Filter and sort players
  const filteredAndSortedPlayers = players
    .filter((player) => {
      const matchesSearch =
        player.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.secretCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender =
        filterGender === "ALL" || player.gender === filterGender;
      const matchesStatus =
        filterStatus === "ALL" ||
        (filterStatus === "ACTIVE" && player.isActive) ||
        (filterStatus === "INACTIVE" && !player.isActive);

      return matchesSearch && matchesGender && matchesStatus;
    })
    .sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      return a[sortConfig.key] > b[sortConfig.key] ? direction : -direction;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Players Management</h2>
          <p className="text-gray-400">
            Manage player profiles and track performance
          </p>
        </div>

        <motion.button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="h-4 w-4" />
          Export Excel
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {players.length}
            </div>
            <div className="text-gray-400 text-sm">Total Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {players.filter((p) => p.isActive).length}
            </div>
            <div className="text-gray-400 text-sm">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {players.filter((p) => p.totalMatches > 0).length}
            </div>
            <div className="text-gray-400 text-sm">Played Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {players.filter((p) => p.wins > 0).length}
            </div>
            <div className="text-gray-400 text-sm">Winners</div>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th
                  className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("serialNo")}
                >
                  S.No
                </th>
                <th
                  className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("fullName")}
                >
                  Player Name
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Gender
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Match Status
                </th>
                <th
                  className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("wins")}
                >
                  W/L/D
                </th>
                <th
                  className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("participationCount")}
                >
                  Participation
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Status
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredAndSortedPlayers.map((player, index) => {
                  const statusBadge = getStatusBadge(
                    player.wins,
                    player.losses,
                    player.draws
                  );
                  const StatusIcon = statusBadge.icon;

                  return (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 text-gray-300">{player.serialNo}</td>
                      <td className="p-4">
                        <div>
                          <button
                            onClick={() => {
                              setSelectedPlayer(player);
                              setShowDetailsModal(true);
                            }}
                            className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                          >
                            {player.fullName || player.secretCode}
                          </button>
                          <div className="text-gray-400 text-sm">
                            {player.secretCode}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            player.gender === "MALE"
                              ? "bg-blue-500/20 text-blue-400"
                              : player.gender === "FEMALE"
                              ? "bg-pink-500/20 text-pink-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {player.gender || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div
                          className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusBadge.label}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 text-sm">
                          <span className="text-green-400">{player.wins}W</span>
                          <span className="text-red-400">{player.losses}L</span>
                          <span className="text-yellow-400">
                            {player.draws}D
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.winPercentage}% win rate
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">
                          {player.participationCount}
                        </div>
                        <div className="text-gray-400 text-xs">games voted</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            player.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {player.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedPlayer(player);
                              setShowDetailsModal(true);
                            }}
                            className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPlayer(player);
                              setShowEditModal(true);
                            }}
                            className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                            title="Edit Player"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredAndSortedPlayers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No players found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && selectedPlayer && (
        <PlayerDetailsModal
          player={selectedPlayer}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPlayer(null);
          }}
        />
      )}

      {showEditModal && selectedPlayer && (
        <PlayerEditModal
          player={selectedPlayer}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPlayer(null);
          }}
          onUpdate={(updatedPlayer) => {
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === updatedPlayer.id ? { ...p, ...updatedPlayer } : p
              )
            );
            setShowEditModal(false);
            setSelectedPlayer(null);
          }}
        />
      )}
    </div>
  );
}
