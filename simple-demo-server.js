const http = require('http');
const express = require('express'); // Add this
const path = require('path'); 
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express(); // Add this line
const server = http.createServer(app); // Update this line

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Game rooms storage (server-side)
const gameRooms = new Map();

// Helper function to generate room codes
const generateRoomCode = () => {
  return uuidv4().substring(0, 6).toUpperCase();
};

// Helper function to calculate feedback
const getFeedback = (guess, target, sequenceLength) => {
  const guessArray = guess.split('');
  const targetArray = target.split('');
  let green = 0, yellow = 0, red = 0;

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

io.on('connection', (socket) => {
  console.log('👤 Player connected:', socket.id);

  // CREATE ROOM EVENT
  socket.on('create-room', (data) => {
    const roomCode = generateRoomCode();
    const room = {
      id: roomCode,
      host: socket.id,
      players: [{
        id: socket.id,
        name: data.playerName,
        playerNumber: 1,
        sequence: '',
        guesses: []
      }],
      gameState: 'waiting', // waiting, setSequences, playing, gameOver
      sequenceLength: data.sequenceLength,
      currentTurn: 1,
      winner: null,
      createdAt: new Date()
    };
    
    gameRooms.set(roomCode, room);
    socket.join(roomCode);
    socket.emit('room-created', { roomCode, room });
    
    console.log(`🎮 Room ${roomCode} created by ${data.playerName}`);
  });

  // JOIN ROOM EVENT
  socket.on('join-room', (data) => {
    const room = gameRooms.get(data.roomCode);
    
    if (!room) {
      socket.emit('join-error', 'Room not found');
      return;
    }
    
    if (room.players.length >= 2) {
      socket.emit('join-error', 'Room is full');
      return;
    }
    
    if (room.gameState !== 'waiting') {
      socket.emit('join-error', 'Game already started');
      return;
    }

    // Add player 2
    room.players.push({
      id: socket.id,
      name: data.playerName,
      playerNumber: 2,
      sequence: '',
      guesses: []
    });
    
    room.gameState = 'setSequences';
    
    socket.join(data.roomCode);
    
    // Notify both players
    io.to(data.roomCode).emit('player-joined', room);
    
    console.log(`🎮 ${data.playerName} joined room ${data.roomCode}`);
  });

  // SET SEQUENCE EVENT
  socket.on('set-sequence', (data) => {
    const room = gameRooms.get(data.roomCode);
    
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    
    if (!player) {
      socket.emit('error', 'Player not found in room');
      return;
    }

    if (player.sequence) {
      socket.emit('error', 'Sequence already set');
      return;
    }

    // Validate sequence
    if (data.sequence.length !== room.sequenceLength) {
      socket.emit('error', `Sequence must be ${room.sequenceLength} digits`);
      return;
    }

    if (!/^\d+$/.test(data.sequence)) {
      socket.emit('error', 'Sequence must contain only numbers');
      return;
    }

    const digits = data.sequence.split('');
    if (new Set(digits).size !== digits.length) {
      socket.emit('error', 'Sequence cannot have repeated digits');
      return;
    }

    // Set the sequence
    player.sequence = data.sequence;
    
    // Check if both players have set sequences
    if (room.players.every(p => p.sequence)) {
      room.gameState = 'playing';
    }
    
    io.to(data.roomCode).emit('game-updated', room);
    
    console.log(`🔐 ${player.name} set sequence in room ${data.roomCode}`);
  });

  // MAKE GUESS EVENT
  socket.on('make-guess', (data) => {
    const room = gameRooms.get(data.roomCode);
    
    if (!room || room.gameState !== 'playing') {
      socket.emit('error', 'Game not in playing state');
      return;
    }

    const currentPlayer = room.players.find(p => p.playerNumber === room.currentTurn);
    
    if (currentPlayer.id !== socket.id) {
      socket.emit('error', "Not your turn!");
      return;
    }

    // Validate guess
    if (data.guess.length !== room.sequenceLength) {
      socket.emit('error', `Guess must be ${room.sequenceLength} digits`);
      return;
    }

    if (!/^\d+$/.test(data.guess)) {
      socket.emit('error', 'Guess must contain only numbers');
      return;
    }

    const digits = data.guess.split('');
    if (new Set(digits).size !== digits.length) {
      socket.emit('error', 'Guess cannot have repeated digits');
      return;
    }

    // Get opponent's sequence
    const opponent = room.players.find(p => p.playerNumber !== room.currentTurn);
    const feedback = getFeedback(data.guess, opponent.sequence, room.sequenceLength);
    
    const guessData = {
      guess: data.guess,
      feedback: feedback,
      timestamp: new Date()
    };
    
    currentPlayer.guesses.push(guessData);

    // Check for win
    if (feedback.green === room.sequenceLength) {
      room.winner = currentPlayer.name;
      room.gameState = 'gameOver';
    } else {
      // Switch turns
      room.currentTurn = room.currentTurn === 1 ? 2 : 1;
    }

    io.to(data.roomCode).emit('game-updated', room);
    
    console.log(`🎯 ${currentPlayer.name} guessed ${data.guess} in room ${data.roomCode}`);
  });

  // DISCONNECT EVENT
  socket.on('disconnect', () => {
    console.log('👤 Player disconnected:', socket.id);
    
    // Find and update rooms where this player was
    for (let [roomCode, room] of gameRooms) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const playerName = room.players[playerIndex].name;
        
        // Notify other players
        socket.to(roomCode).emit('player-disconnected', playerName);
        
        // Remove room if empty or in waiting state
        if (room.players.length === 1 || room.gameState === 'waiting') {
          gameRooms.delete(roomCode);
          console.log(`🗑️ Room ${roomCode} deleted - player left`);
        }
        break;
      }
    }
  });
});

// Handle React routing (must be AFTER socket logic)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3002;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Game server running on ${HOST}:${PORT}`);
  console.log('🎮 Ready for number guessing battles!');
});