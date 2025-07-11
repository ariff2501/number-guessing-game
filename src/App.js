import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Users, Plus, LogIn, Gamepad2, Copy, Check, X } from "lucide-react"; // Add these imports at the top with the other imports
import {
  Target,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Trophy,
} from "lucide-react";

// Replace the GameRoom component

// Components (keeping them outside for performance)
const LandingPage = ({ connected, setCurrentView }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <Gamepad2 className="mx-auto mb-4 text-blue-600" size={64} />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Number Guessing
        </h1>
        <p className="text-gray-600">Challenge your friends in real-time!</p>
      </div>

      <div
        className={`mb-6 p-3 rounded-lg text-center ${
          connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {connected ? "✅ Connected to server" : "🔄 Connecting to server..."}
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setCurrentView("create")}
          disabled={!connected}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg font-semibold"
        >
          <Plus size={24} />
          <span>Create New Game</span>
        </button>

        <button
          onClick={() => setCurrentView("join")}
          disabled={!connected}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg font-semibold"
        >
          <LogIn size={24} />
          <span>Join Game</span>
        </button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Quick Guide:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>🎯 Guess your opponent's secret number sequence</li>
          <li>🟢 Green = correct number & position</li>
          <li>🟡 Yellow = correct number, wrong position</li>
          <li>🔴 Red = number not in sequence</li>
          <li>🔄 Lost connection? Rejoin with the same room ID & username</li>
        </ul>
      </div>
    </div>
  </div>
);

const CreateGame = ({
  playerName,
  setPlayerName,
  sequenceLength,
  setSequenceLength,
  setCurrentView,
  onCreateRoom,
  loading,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <Plus className="mx-auto mb-4 text-blue-600" size={48} />
        <h2 className="text-3xl font-bold text-gray-800">Create New Game</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your name"
            maxLength={20}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sequence Length
          </label>
          <select
            value={sequenceLength}
            onChange={(e) => setSequenceLength(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value={3}>3 digits</option>
            <option value={4}>4 digits</option>
            <option value={5}>5 digits</option>
            <option value={6}>6 digits</option>
          </select>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={onCreateRoom}
            disabled={!playerName.trim() || loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold flex items-center justify-center"
          >
            {loading ? "🔄 Creating..." : "Create Game Room"}
          </button>

          <button
            onClick={() => setCurrentView("landing")}
            disabled={loading}
            className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 text-lg font-semibold"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  </div>
);

const JoinGame = ({
  playerName,
  setPlayerName,
  roomCode,
  setRoomCode,
  setCurrentView,
  onJoinRoom,
  loading,
  error,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <LogIn className="mx-auto mb-4 text-green-600" size={48} />
        <h2 className="text-3xl font-bold text-gray-800">Join Game</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">
          ❌ {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your name"
            maxLength={20}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-2xl font-mono"
            placeholder="ABC123"
            maxLength={6}
            disabled={loading}
          />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">
            💡 Trying to reconnect? Use your original name and room code
          </p>
        </div>
        <div className="space-y-3 pt-4">
          <button
            onClick={onJoinRoom}
            disabled={!playerName.trim() || !roomCode.trim() || loading}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold flex items-center justify-center"
          >
            {loading ? "🔄 Joining..." : "Join Game Room"}
          </button>

          <button
            onClick={() => setCurrentView("landing")}
            disabled={loading}
            className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 text-lg font-semibold"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  </div>
);

const WaitingRoom = ({
  currentRoom,
  setCurrentView,
  onCopyRoomCode,
  copied,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
      <div className="text-6xl mb-4">⏳</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Room Created!</h2>

      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Share this room code:</div>
        <div
          className="text-4xl font-mono font-bold text-blue-600 bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
          onClick={onCopyRoomCode}
        >
          <span>{currentRoom?.id}</span>
          {copied ? (
            <Check size={24} className="text-green-600" />
          ) : (
            <Copy size={24} />
          )}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          💡 Click to copy • Save this code to reconnect if needed
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-2">Players in room:</p>
        <div className="space-y-1">
          {currentRoom?.players.map((player, index) => (
            <div key={player.id} className="text-sm bg-gray-100 p-2 rounded">
              👤 {player.name} {player.playerNumber === 1 && "(Host)"}
            </div>
          ))}
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        {currentRoom?.players.length === 1
          ? "Waiting for opponent to join..."
          : "Opponent joined! Starting game..."}
      </p>

      <button
        onClick={() => setCurrentView("landing")}
        className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  </div>
);

const getFeedback = (guess, target, sequenceLength) => {
  const guessArray = guess.split("");
  const targetArray = target.split("");
  let green = 0,
    yellow = 0,
    red = 0;

  const targetUsed = new Array(targetArray.length).fill(false);
  const guessUsed = new Array(guessArray.length).fill(false);

  // Count greens (correct position)
  for (let i = 0; i < guessArray.length; i++) {
    if (guessArray[i] === targetArray[i]) {
      green++;
      targetUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  // Count yellows (correct number, wrong position)
  for (let i = 0; i < guessArray.length; i++) {
    if (!guessUsed[i]) {
      for (let j = 0; j < targetArray.length; j++) {
        if (!targetUsed[j] && guessArray[i] === targetArray[j]) {
          yellow++;
          targetUsed[j] = true;
          break;
        }
      }
    }
  }

  red = sequenceLength - green - yellow;
  return { green, yellow, red };
};

// Render feedback icons
const renderFeedback = (feedback) => {
  return (
    <div className="flex items-center space-x-3 mt-1">
      {feedback.green > 0 && (
        <div className="flex items-center space-x-1">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-sm font-semibold text-green-600">
            {feedback.green}
          </span>
        </div>
      )}
      {feedback.yellow > 0 && (
        <div className="flex items-center space-x-1">
          <AlertTriangle size={16} className="text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-600">
            {feedback.yellow}
          </span>
        </div>
      )}
      {feedback.red > 0 && (
        <div className="flex items-center space-x-1">
          <XCircle size={16} className="text-red-600" />
          <span className="text-sm font-semibold text-red-600">
            {feedback.red}
          </span>
        </div>
      )}
      {feedback.green === 0 && feedback.yellow === 0 && feedback.red === 0 && (
        <span className="text-gray-400 text-sm">No feedback</span>
      )}
    </div>
  );
};
// Add this component before your main App function
const MySequenceDisplay = ({ sequence, sequenceLength }) => {
  const [showSequence, setShowSequence] = useState(false);

  if (!sequence || sequence.length !== sequenceLength) {
    return null; // Don't show if sequence not set
  }

  return (
    <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
      <div className="text-sm font-medium text-blue-700">My Sequence:</div>
      <div className="relative">
        <div
          className={`font-mono text-lg font-bold ${
            showSequence
              ? "text-blue-800"
              : "text-transparent bg-blue-300 rounded"
          }`}
        >
          {showSequence ? sequence : "●".repeat(sequenceLength)}
        </div>
        {!showSequence && (
          <div className="absolute inset-0 flex items-center justify-center text-blue-600 text-lg font-mono">
            {"●".repeat(sequenceLength)}
          </div>
        )}
      </div>
      <button
        onClick={() => setShowSequence(!showSequence)}
        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
        title={showSequence ? "Hide sequence" : "Show sequence"}
      >
        {showSequence ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};
const DetailedRecap = ({
  currentRoom,
  currentPlayer,
  opponent,
  myStats,
  opponentStats,
}) => {
  const isDraw = currentRoom.winner === "DRAW";

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">📊 Game Recap</h3>
        <p className="text-gray-600">
          Room: {currentRoom.id} • {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Your Guesses */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
            🎯 {myStats.name}'s Journey
          </h4>
          <div className="space-y-3">
            {currentPlayer.guesses.map((guess, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded font-bold">
                    #{index + 1}
                  </span>
                  <span className="font-mono text-lg font-bold">
                    {guess.guess}
                  </span>
                </div>
                {renderFeedback(guess.feedback)}
              </div>
            ))}
            {currentPlayer.guesses.length === 0 && (
              <p className="text-gray-500 italic text-center py-4">
                No guesses made
              </p>
            )}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Target:</strong>{" "}
              <span className="font-mono">{opponent.sequence}</span>
            </p>
          </div>
        </div>

        {/* Opponent's Guesses */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
            🎯 {opponentStats.name}'s Journey
          </h4>
          <div className="space-y-3">
            {opponent.guesses.map((guess, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded font-bold">
                    #{index + 1}
                  </span>
                  <span className="font-mono text-lg font-bold">
                    {guess.guess}
                  </span>
                </div>
                {renderFeedback(guess.feedback)}
              </div>
            ))}
            {opponent.guesses.length === 0 && (
              <p className="text-gray-500 italic text-center py-4">
                No guesses made
              </p>
            )}
          </div>
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              <strong>Target:</strong>{" "}
              <span className="font-mono">{currentPlayer.sequence}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Game Summary */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {myStats.guesses} vs {opponentStats.guesses}
            </div>
            <div className="text-sm text-gray-600">Total Guesses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {currentRoom.sequenceLength}
            </div>
            <div className="text-sm text-gray-600">Sequence Length</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {isDraw ? "DRAW" : currentRoom.winner}
            </div>
            <div className="text-sm text-gray-600">Winner</div>
          </div>
        </div>
      </div>

      {/* Feedback Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-center">Feedback Legend:</h4>
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <CheckCircle size={14} className="text-green-600" />
            <span>Correct position</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle size={14} className="text-yellow-600" />
            <span>Wrong position</span>
          </div>
          <div className="flex items-center space-x-1">
            <XCircle size={14} className="text-red-600" />
            <span>Not in sequence</span>
          </div>
        </div>
      </div>

      {/* Social Media Ready */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 mb-2">
          📸 Perfect for screenshots and social sharing!
        </p>
        <div className="inline-flex items-center space-x-2 text-xs text-gray-400">
          <span>🎮 Number Guessing Game</span>
          <span>•</span>
          <span>Room {currentRoom.id}</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

const GameOver = ({ currentRoom, currentPlayer, onPlayAgain }) => {
  const [showDetailedRecap, setShowDetailedRecap] = useState(false);

  const isWinner = currentRoom.winner === currentPlayer.name;
  const isDraw = currentRoom.winner === "DRAW";
  const opponent = currentRoom.players.find((p) => p.id !== currentPlayer.id);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (minutes === 0) {
      return `0 min ${seconds} seconds`;
    } else if (minutes === 1) {
      return `1 min ${seconds} seconds`;
    } else {
      return `${minutes} min ${seconds.toString().padStart(2, "0")} seconds`;
    }
  };

  // Calculate quick stats
  const myStats = {
    name: currentPlayer.name,
    guesses: currentPlayer.guesses.length,
    sequence: currentPlayer.sequence,
    timeTaken: formatTime(
      currentPlayer.guesses.reduce((sum, item) => sum + item.timeTaken, 0)
    ),
  };

  const opponentStats = {
    name: opponent.name,
    guesses: opponent.guesses.length,
    sequence: opponent.sequence,
    timeTaken: formatTime(
      opponent.guesses.reduce((sum, item) => sum + item.timeTaken, 0)
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Result Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">
              {isDraw ? "🤝" : isWinner ? "🎉" : "😞"}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Game Over!
            </h2>
            <p className="text-xl font-semibold">
              {isDraw ? (
                <span className="text-blue-600">It's a Draw!</span>
              ) : (
                <span className={isWinner ? "text-green-600" : "text-red-600"}>
                  {isWinner ? "You Win!" : `${currentRoom.winner} Wins!`}
                </span>
              )}
            </p>
            {isDraw && (
              <p className="text-sm text-gray-600 mt-2">
                Both players solved it with the same number of guesses!
              </p>
            )}
          </div>

          {/* Quick Stats Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div
              className={`p-4 rounded-lg ${
                isWinner
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              } border-2`}
            >
              <h3 className="font-bold text-lg mb-2">{myStats.name} (You)</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Guesses:</strong> {myStats.guesses}
                </p>
                <p>
                  <strong>Sequence:</strong>{" "}
                  <span className="font-mono">{myStats.sequence}</span>
                </p>
                <p>
                  <strong>Time Taken:</strong> {myStats.timeTaken}
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                !isWinner && !isDraw
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              } border-2`}
            >
              <h3 className="font-bold text-lg mb-2">{opponentStats.name}</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Guesses:</strong> {opponentStats.guesses}
                </p>
                <p>
                  <strong>Sequence:</strong>{" "}
                  <span className="font-mono">{opponentStats.sequence}</span>
                </p>
                <p>
                  <strong>Time Taken:</strong> {opponentStats.timeTaken}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => setShowDetailedRecap(!showDetailedRecap)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {showDetailedRecap
                ? "📊 Hide Detailed Recap"
                : "📊 Show Detailed Recap"}
            </button>

            <button
              onClick={onPlayAgain}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 text-lg font-semibold transition-colors"
            >
              🎮 Play Again
            </button>
          </div>
        </div>

        {/* Detailed Recap (Toggleable) */}
        {showDetailedRecap && (
          <DetailedRecap
            currentRoom={currentRoom}
            currentPlayer={currentPlayer}
            opponent={opponent}
            currentPlayerStat={myStats}
            opponentStat={opponentStats}
          />
        )}
      </div>
    </div>
  );
};

const GameRoom = ({
  currentRoom,
  socket,
  currentPlayer,
  onCopyRoomCode,
  copied,
}) => {
  const [mySequence, setMySequence] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [showSequence, setShowSequence] = useState(false);
  // 🆕 ADD: Turn reminder notification state
  const [showTurnReminder, setShowTurnReminder] = useState(false);
  const [turnReminderTimer, setTurnReminderTimer] = useState(null);
  // ADD : timing state
  const [turnStartTime, setTurnStartTime] = useState(null);
  const [currentTurnTime, setCurrentTurnTime] = useState(0);
  // ADD : number checking assistant state
  const [numberToCheck, setNumberToCheck] = useState("");
  const [conflictingGuesses, setConflictingGuesses] = useState([]);

  // ADD : Track turn timing
  useEffect(() => {
    const isMyTurn = currentRoom.currentTurn === currentPlayer.playerNumber;

    if (
      isMyTurn &&
      (currentRoom.gameState === "playing" ||
        currentRoom.gameState === "finalChance")
    ) {
      const startTime = Date.now();
      setTurnStartTime(startTime);

      // Update current turn time every second
      const interval = setInterval(() => {
        setCurrentTurnTime((Date.now() - startTime) / 1000);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTurnStartTime(null);
      setCurrentTurnTime(0);
    }
  }, [currentRoom.currentTurn, currentRoom.gameState]);

  // 🆕 ADD: Turn reminder effect
  useEffect(() => {
    // Clear any existing timer
    if (turnReminderTimer) {
      clearTimeout(turnReminderTimer);
      setTurnReminderTimer(null);
    }

    // Hide any existing notification
    setShowTurnReminder(false);

    // Only set timer if it's playing state and my turn
    if (
      currentRoom.gameState === "playing" ||
      currentRoom.gameState === "finalChance"
    ) {
      const isMyTurn = currentRoom.currentTurn === currentPlayer.playerNumber;

      if (isMyTurn) {
        console.log("🔔 Starting turn reminder timer (20 seconds)");

        const timer = setTimeout(() => {
          console.log("⏰ Turn reminder triggered!");
          setShowTurnReminder(true);
        }, 10000); // 20 seconds

        setTurnReminderTimer(timer);
      }
    }

    // Cleanup function
    return () => {
      if (turnReminderTimer) {
        clearTimeout(turnReminderTimer);
      }
    };
  }, [currentRoom.currentTurn, currentRoom.gameState]); // Trigger when turn or game state changes

  if (!currentRoom || !currentPlayer) {
    return <div>Loading...</div>;
  }

  const opponent = currentRoom.players.find((p) => p.id !== currentPlayer.id);
  const isMyTurn = currentRoom.currentTurn === currentPlayer.playerNumber;
  const hasSetSequence = !!currentPlayer.sequence;

  // Handle setting sequence
  const handleSetSequence = () => {
    if (!validateSequence(mySequence, currentRoom.sequenceLength)) {
      alert(
        `Please enter a valid ${currentRoom.sequenceLength}-digit sequence with no repeated digits`
      );
      return;
    }

    socket.emit("set-sequence", {
      roomCode: currentRoom.id,
      sequence: mySequence,
    });

    setMySequence("");
    setShowSequence(false);
  };

  // Handle making a guess
  const handleMakeGuess = () => {
    if (!isMyTurn) {
      alert("It's not your turn!");
      return;
    }

    if (!validateSequence(currentGuess, currentRoom.sequenceLength)) {
      alert(
        `Please enter a valid ${currentRoom.sequenceLength}-digit sequence with no repeated digits`
      );
      return;
    }

    socket.emit("make-guess", {
      roomCode: currentRoom.id,
      guess: currentGuess,
      timeToGuess: currentTurnTime,
    });

    setCurrentGuess("");
  };

  const handleCheckNumber = (value) => {
    const myGuesses = currentPlayer.guesses;
    const conflicts = [];

    // Use the passed value instead of numberToCheck state
    const checkValue = value || numberToCheck;

    for (let i = 0; i < myGuesses.length; i++) {
      const guess = myGuesses[i];
      const calculatedFeedback = getFeedback(
        guess.guess,
        checkValue,
        currentRoom.sequenceLength
      );
      const expectedFeedback = guess.feedback;

      // console.log("to check :", checkValue);
      // console.log("calculated : ", calculatedFeedback);
      // console.log("original test : ", guess.guess);
      // console.log("expected : ", expectedFeedback);
      // Check if feedback doesn't match
      if (
        calculatedFeedback.green !== expectedFeedback.green ||
        calculatedFeedback.yellow !== expectedFeedback.yellow ||
        calculatedFeedback.red !== expectedFeedback.red
      ) {
        conflicts.push(i); // Store the index of conflicting guess
      }
    }
    setConflictingGuesses(conflicts);
  };

  // Validate sequence helper
  const validateSequence = (sequence, length) => {
    if (sequence.length !== length) return false;
    if (!/^\d+$/.test(sequence)) return false;
    const digits = sequence.split("");
    return new Set(digits).size === digits.length;
  };

  // 🆕 ADD: Turn reminder notification component
  const TurnReminderNotification = () => {
    if (!showTurnReminder) return null;

    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-2xl border border-blue-300 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🔔</div>
              <div>
                <div className="font-bold text-sm">Hey, it's your turn!</div>
                <div className="text-xs opacity-90 mt-1">
                  {currentRoom.gameState === "finalChance"
                    ? "This is your final chance to tie!"
                    : "Make your guess when you're ready"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowTurnReminder(false)}
              className="text-white hover:text-gray-200 transition-colors ml-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // SEQUENCE SETTING PHASE
  if (currentRoom.gameState === "setSequences" && !hasSetSequence) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Target className="mx-auto mb-4 text-green-600" size={48} />
            <h2 className="text-3xl font-bold text-gray-800">
              Set Your Secret Sequence
            </h2>
            <p className="text-gray-600 mt-2">
              Room:{" "}
              <span className="font-mono font-bold">{currentRoom.id}</span>
            </p>
            <p className="text-gray-600">
              Enter a {currentRoom.sequenceLength}-digit sequence with no
              repeated digits
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showSequence ? "text" : "password"}
                value={mySequence}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, currentRoom.sequenceLength);
                  setMySequence(value);
                }}
                className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-2xl text-center font-mono"
                placeholder={`Enter ${currentRoom.sequenceLength} digits`}
                maxLength={currentRoom.sequenceLength}
              />
              <button
                type="button"
                onClick={() => setShowSequence(!showSequence)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSequence ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              onClick={handleSetSequence}
              disabled={mySequence.length !== currentRoom.sequenceLength}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
            >
              Set My Secret Sequence
            </button>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Rules:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Use digits 0-9 only</li>
              <li>• No repeated digits</li>
              <li>• Exactly {currentRoom.sequenceLength} digits</li>
              <li>• Keep it secret!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // WAITING FOR OPPONENT TO SET SEQUENCE
  if (currentRoom.gameState === "setSequences" && hasSetSequence) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Clock className="mx-auto mb-4 text-yellow-600" size={64} />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Waiting for {opponent?.name}
          </h2>
          <p className="text-gray-600 mb-6">
            Your sequence has been set. Waiting for your opponent to set their
            sequence...
          </p>

          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✅ Your sequence is ready!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // GAME OVER
  if (currentRoom.gameState === "gameOver") {
    return (
      <GameOver
        currentRoom={currentRoom}
        currentPlayer={currentPlayer}
        onPlayAgain={() => window.location.reload()}
      />
    );
  }

  // PLAYING PHASE
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      {/* 🆕 ADD: Turn reminder notification */}
      <TurnReminderNotification />
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {/* Left side: Room info + Sequence */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
              {/* Room Info */}
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Room: {currentRoom.id}
                  <button onClick={onCopyRoomCode} className="hover:opacity-70">
                    {copied ? (
                      <Check size={24} className="text-green-600" />
                    ) : (
                      <Copy size={24} />
                    )}
                  </button>
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {currentRoom.sequenceLength}-digit sequences
                </p>
              </div>

              {/* My sequence */}
              <div className="flex-shrink-0">
                <MySequenceDisplay
                  sequence={currentPlayer?.sequence}
                  sequenceLength={currentRoom.sequenceLength}
                />
              </div>
            </div>

            {/* Right side: Turn Display */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              {currentRoom.gameState === "finalChance" ? (
                <div className="px-3 sm:px-4 py-2 rounded-lg font-semibold bg-orange-100 text-orange-800 border-2 border-orange-300 text-center">
                  <div className="text-sm sm:text-base">⚡ FINAL CHANCE!</div>
                  <div className="text-xs sm:text-sm mt-1">
                    {currentRoom.firstToSolve} solved first!
                    <br />
                    <span className="hidden sm:inline">
                      {isMyTurn
                        ? "🎯 Your last chance to tie!"
                        : `⏳ ${opponent?.name}'s last chance!`}
                    </span>
                    <span className="sm:hidden">
                      {isMyTurn
                        ? "🎯 Your turn!"
                        : `⏳ ${opponent?.name}'s turn!`}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-center ${
                    isMyTurn
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <span className="text-sm sm:text-base">
                    {isMyTurn ? "🎯 Your Turn" : `⏳ ${opponent?.name}'s Turn`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Make Guess */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Make Your Guess
            </h2>

            {/* Sticky Input Section - Only on small screens */}
            <div className="lg:hidden sticky top-4 z-20 bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
              <div className="space-y-3">
                <input
                  type="text"
                  value={currentGuess}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, currentRoom.sequenceLength);
                    setCurrentGuess(value);
                  }}
                  disabled={!isMyTurn}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl text-center font-mono ${
                    !isMyTurn ? "bg-gray-100" : ""
                  }`}
                  placeholder={
                    isMyTurn
                      ? `Enter ${currentRoom.sequenceLength} digits`
                      : "Wait for your turn..."
                  }
                  maxLength={currentRoom.sequenceLength}
                />

                <button
                  onClick={handleMakeGuess}
                  disabled={
                    currentGuess.length !== currentRoom.sequenceLength ||
                    !isMyTurn
                  }
                  className="w-full bg-blue-600 text-white py-2.5 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-base font-semibold"
                >
                  {isMyTurn ? "Submit Guess" : "Wait for your turn"}
                </button>
              </div>
            </div>

            {/* Regular Input Section - Hidden on small screens, shown on large */}
            <div className="hidden lg:block space-y-4">
              <input
                type="text"
                value={currentGuess}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, currentRoom.sequenceLength);
                  setCurrentGuess(value);
                }}
                disabled={!isMyTurn}
                className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl text-center font-mono ${
                  !isMyTurn ? "bg-gray-100" : ""
                }`}
                placeholder={
                  isMyTurn
                    ? `Enter ${currentRoom.sequenceLength} digits`
                    : "Wait for your turn..."
                }
                maxLength={currentRoom.sequenceLength}
              />

              <button
                onClick={handleMakeGuess}
                disabled={
                  currentGuess.length !== currentRoom.sequenceLength ||
                  !isMyTurn
                }
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {isMyTurn ? "Submit Guess" : "Wait for your turn"}
              </button>
            </div>

            {/* Feedback Legend - Always in original position */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Feedback Legend:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Correct number, correct position</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span>Correct number, wrong position</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle size={16} className="text-red-600" />
                  <span>Number not in sequence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Guess History */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Your Guess History
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentPlayer.guesses.map((guess, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    numberToCheck.length !== currentRoom.sequenceLength ||
                    !validateSequence(numberToCheck, currentRoom.sequenceLength)
                      ? "bg-gray-50" // grey when no number to check
                      : conflictingGuesses.includes(index)
                      ? "bg-red-100 border-2 border-red-300" // red for conflicts
                      : "bg-green-50" // green for matches
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-lg font-bold">
                      {guess.guess}
                    </span>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                  <div className="mt-1">{renderFeedback(guess.feedback)}</div>
                </div>
              ))}
              {currentPlayer.guesses.length === 0 && (
                <p className="text-gray-500 italic text-center py-8">
                  No guesses yet. Make your first guess!
                </p>
              )}
            </div>
            {/* Input Section */}
            <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="text"
                placeholder="Check possible answer"
                value={numberToCheck}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, currentRoom.sequenceLength);
                  setNumberToCheck(value);
                  // Clear conflicts when input is cleared
                  if (
                    value.length !== currentRoom.sequenceLength ||
                    !validateSequence(value, currentRoom.sequenceLength)
                  ) {
                    setConflictingGuesses([]);
                    //setFireCheckNumber(false)
                  } else {
                    handleCheckNumber(value);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                className={`text-sm ${
                  numberToCheck.length === currentRoom.sequenceLength &&
                  !validateSequence(numberToCheck, currentRoom.sequenceLength)
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {numberToCheck.length === currentRoom.sequenceLength &&
                !validateSequence(numberToCheck, currentRoom.sequenceLength)
                  ? "Sequence not valid"
                  : "Enter a sequence to check possible answer"}
              </span>
              {/* <button
                disabled={numberToCheck.length !== currentRoom.sequenceLength}
                onClick={handleCheckNumber}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Guess
              </button> */}
            </div>
          </div>
        </div>

        {/* Bottom Panel - Players Info */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {currentRoom.players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg ${
                  player.id === currentPlayer.id
                    ? "bg-blue-50 border-2 border-blue-200"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">
                    👤 {player.name} {player.id === currentPlayer.id && "(You)"}
                  </h3>
                  {currentRoom.currentTurn === player.playerNumber && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                      Current Turn
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Total guesses: {player.guesses.length}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentView, setCurrentView] = useState("landing");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [sequenceLength, setSequenceLength] = useState(4);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Connect to server
  useEffect(() => {
    const socketURL =
      process.env.NODE_ENV === "production"
        ? "https://number-guessing-game-qpe5.onrender.com" // Your Render URL
        : "http://localhost:3002";

    console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
    console.log("🔍 Socket trying to connect to:", socketURL);
    console.log("🔍 Current window location:", window.location.href);

    const newSocket = io(socketURL);
    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setConnected(false);
    });

    // Room created successfully
    newSocket.on("room-created", (data) => {
      console.log("🎮 Room created:", data);
      setCurrentRoom(data.room);
      setCurrentView("waiting");
      setLoading(false);
    });

    // Player joined the room
    newSocket.on("player-joined", (room) => {
      console.log("👥 Player joined:", room);
      setCurrentRoom(room);
      if (room.gameState === "setSequences") {
        setCurrentView("game");
      }
    });

    // Join room error
    newSocket.on("join-error", (errorMessage) => {
      console.log("❌ Join error:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    });

    // Game state updated
    newSocket.on("game-updated", (room) => {
      console.log("🔄 Game updated:", room);
      setCurrentRoom(room);
    });
    // Handle successful reconnection
    newSocket.on("join-success", (room) => {
      console.log("✅ Successfully joined/reconnected!");
      setCurrentRoom(room);
      setLoading(false);

      if (
        room.gameState === "setSequences" ||
        room.gameState === "playing" ||
        room.gameState === "finalChance"
      ) {
        setCurrentView("game");
      } else {
        setCurrentView("waiting");
      }
    });
    // Handle when someone else reconnects
    newSocket.on("player-reconnected", (data) => {
      console.log("👥 Player reconnected:", data.playerName);
      setCurrentRoom(data.room);
      // Maybe show a brief message: "PlayerName is back!"
    });
    // Player disconnected
    newSocket.on("player-disconnected", (data) => {
      if (data.gameState === "playing" || data.gameState === "finalChance") {
        alert(
          `${data.playerName} disconnected. Game is paused. They can rejoin using the same room code and name.`
        );
      } else {
        alert(`${data.playerName} has left the game`);
        setCurrentView("landing");
      }
    });

    // General error
    newSocket.on("error", (errorMessage) => {
      console.log("❌ Error:", errorMessage);
      alert("Error: " + errorMessage);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Add this after the useEffect hook
  const currentPlayer = currentRoom?.players.find((p) => p.id === socket?.id);

  // Create room handler
  const handleCreateRoom = () => {
    if (!socket || !playerName.trim()) return;

    setLoading(true);
    setError("");

    socket.emit("create-room", {
      playerName: playerName.trim(),
      sequenceLength: sequenceLength,
    });
  };

  // Join room handler
  const handleJoinRoom = () => {
    if (!socket || !playerName.trim() || !roomCode.trim()) return;

    setLoading(true);
    setError("");

    socket.emit("join-room", {
      playerName: playerName.trim(),
      roomCode: roomCode.trim(),
    });
  };

  // Copy room code handler
  const handleCopyRoomCode = () => {
    if (currentRoom?.id) {
      navigator.clipboard.writeText(currentRoom.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case "create":
        return (
          <CreateGame
            playerName={playerName}
            setPlayerName={setPlayerName}
            sequenceLength={sequenceLength}
            setSequenceLength={setSequenceLength}
            setCurrentView={setCurrentView}
            onCreateRoom={handleCreateRoom}
            loading={loading}
          />
        );
      case "join":
        return (
          <JoinGame
            playerName={playerName}
            setPlayerName={setPlayerName}
            roomCode={roomCode}
            setRoomCode={setRoomCode}
            setCurrentView={setCurrentView}
            onJoinRoom={handleJoinRoom}
            loading={loading}
            error={error}
          />
        );
      case "waiting":
        return (
          <WaitingRoom
            currentRoom={currentRoom}
            setCurrentView={setCurrentView}
            onCopyRoomCode={handleCopyRoomCode}
            copied={copied}
          />
        );
      case "game":
        return (
          <GameRoom
            currentRoom={currentRoom}
            socket={socket}
            currentPlayer={currentPlayer}
            onCopyRoomCode={handleCopyRoomCode}
            copied={copied}
          />
        );
      default:
        return (
          <LandingPage connected={connected} setCurrentView={setCurrentView} />
        );
    }
  };

  return renderCurrentView();
}

export default App;
