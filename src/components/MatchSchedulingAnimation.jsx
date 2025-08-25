"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap, Trophy, CheckCircle, Shuffle } from "lucide-react";

export default function MatchSchedulingAnimation({ game, onComplete }) {
  const [stage, setStage] = useState("analyzing"); // analyzing -> pairing -> finalizing -> complete
  const [participants, setParticipants] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  useEffect(() => {
    // Simulate the scheduling process
    const process = async () => {
      // Stage 1: Analyzing participants
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch participants data
      const response = await fetch(`/api/games/${game.id}/participants`);
      const data = await response.json();
      setParticipants(data.activeParticipants || []);

      // Stage 2: Pairing
      setStage("pairing");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate pairs
      const shuffled = [...data.activeParticipants].sort(
        () => Math.random() - 0.5
      );
      const generatedPairs = [];
      for (let i = 0; i < shuffled.length - 1; i += 2) {
        generatedPairs.push([shuffled[i], shuffled[i + 1]]);
      }
      setPairs(generatedPairs);

      // Stage 3: Show pairs one by one
      for (let i = 0; i < generatedPairs.length; i++) {
        setCurrentPairIndex(i);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Stage 4: Finalizing
      setStage("finalizing");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Stage 5: Complete
      setStage("complete");
      setTimeout(onComplete, 2000);
    };

    process();
  }, [game.id, onComplete]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/20 p-8 max-w-2xl w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">{game.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Scheduling {game.name} Matches
          </h2>
          <p className="text-gray-400">Creating random match pairs...</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {["analyzing", "pairing", "finalizing", "complete"].map(
              (stageItem, index) => {
                const isActive = stage === stageItem;
                const isComplete =
                  ["analyzing", "pairing", "finalizing", "complete"].indexOf(
                    stage
                  ) > index;

                return (
                  <div key={stageItem} className="flex items-center gap-2">
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        isComplete
                          ? "bg-green-500"
                          : isActive
                          ? "bg-yellow-500"
                          : "bg-gray-600"
                      }`}
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    {index < 3 && <div className="w-8 h-0.5 bg-gray-600" />}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Stage Content */}
        <AnimatePresence mode="wait">
          {stage === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <Users className="h-12 w-12 text-blue-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Analyzing Participants
              </h3>
              <p className="text-gray-400">
                Gathering active players who voted for this game...
              </p>
            </motion.div>
          )}

          {stage === "pairing" && (
            <motion.div
              key="pairing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Shuffle className="h-12 w-12 text-yellow-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Creating Random Pairs
              </h3>
              <p className="text-gray-400 mb-4">
                Shuffling participants and creating match pairs...
              </p>

              {participants.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 rounded-lg p-2 text-sm text-white"
                    >
                      {participant.fullName || participant.secretCode}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {stage === "finalizing" && (
            <motion.div
              key="finalizing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Zap className="h-12 w-12 text-orange-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Finalizing Matches
              </h3>
              <p className="text-gray-400 mb-4">
                Setting up match schedules and notifications...
              </p>

              {pairs.length > 0 && (
                <div className="space-y-3">
                  <p className="text-green-400 font-medium">
                    {pairs.length} matches created!
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {pairs.map((pair, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-3 flex items-center justify-between"
                      >
                        <span className="text-white text-sm">
                          {pair[0]?.fullName || pair[0]?.secretCode}
                        </span>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-white text-sm">
                          {pair[1]?.fullName || pair[1]?.secretCode}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {stage === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-block mb-4"
              >
                <CheckCircle className="h-12 w-12 text-green-500" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Matches Successfully Scheduled!
              </h3>
              <p className="text-gray-400 mb-4">
                All match pairs have been created and scheduled.
              </p>
              <div className="bg-green-500/20 rounded-lg p-4">
                <p className="text-green-400 font-medium">
                  {pairs.length} matches created for {game.name}
                </p>
                <p className="text-green-300 text-sm mt-1">
                  Players will be notified about their match schedules
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
