import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Users, Plus, LogIn, Gamepad2, Copy, Check } from "lucide-react"; // Add these imports at the top with the other imports
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
        <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>🎯 Guess your opponent's secret number sequence</li>
          <li>🟢 Green = correct number & position</li>
          <li>🟡 Yellow = correct number, wrong position</li>
          <li>🔴 Red = number not in sequence</li>
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
        <div className="text-xs text-gray-500 mt-2">Click to copy</div>
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

const GameRoom = ({ currentRoom, socket, currentPlayer }) => {
  const [mySequence, setMySequence] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [showSequence, setShowSequence] = useState(false);

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
    });

    setCurrentGuess("");
  };

  // Validate sequence helper
  const validateSequence = (sequence, length) => {
    if (sequence.length !== length) return false;
    if (!/^\d+$/.test(sequence)) return false;
    const digits = sequence.split("");
    return new Set(digits).size === digits.length;
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
        {feedback.green === 0 &&
          feedback.yellow === 0 &&
          feedback.red === 0 && (
            <span className="text-gray-400 text-sm">No feedback</span>
          )}
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
    const isWinner = currentRoom.winner === currentPlayer.name;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">{isWinner ? "🎉" : "😞"}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Game Over!
            </h2>
            <p className="text-xl font-semibold">
              <span className={isWinner ? "text-green-600" : "text-red-600"}>
                {isWinner ? "You Win!" : `${currentRoom.winner} Wins!`}
              </span>
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Final Stats:</h3>
              <p>Your guesses: {currentPlayer.guesses.length}</p>
              <p>
                {opponent?.name}'s guesses: {opponent?.guesses.length}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Secret Sequences:</h3>
              <p>Your sequence: {currentPlayer.sequence}</p>
              <p>
                {opponent?.name}'s sequence: {opponent?.sequence}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 text-lg font-semibold"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // PLAYING PHASE
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Room: {currentRoom.id}
              </h1>
              <p className="text-gray-600">
                {currentRoom.sequenceLength}-digit sequences
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-semibold ${
                isMyTurn
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {isMyTurn ? "🎯 Your Turn" : `⏳ ${opponent?.name}'s Turn`}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Make Guess */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Make Your Guess
            </h2>

            <div className="space-y-4">
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

            {/* Feedback Legend */}
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
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
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
    const socket = io(process.env.NODE_ENV === 'production' 
      ? 'https://number-guessing-game-qpe5.onrender.com'  // Online
      : 'http://localhost:3002'          // Local
    );

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

    // Player disconnected
    newSocket.on("player-disconnected", (playerName) => {
      console.log("👋 Player disconnected:", playerName);
      alert(`${playerName} has left the game`);
      setCurrentView("landing");
      setCurrentRoom(null);
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
