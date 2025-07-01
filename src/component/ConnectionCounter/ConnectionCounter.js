import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function ConnectionCounter() {
    const [socket, setSocket] = useState(null);
    const [counter, setCounter] = useState(0);
    const [users, setUsers] = useState(0);
    const [connected, setConnected] = useState(false);
  
    useEffect(() => {
      // Connect to server
      const newSocket = io('http://localhost:3002');
  
      // Connection events
      newSocket.on('connect', () => {
        console.log('✅ Connected to server');
        setConnected(true);
      });
  
      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        setConnected(false);
      });
  
      // Listen for counter updates from server
      newSocket.on('counter-update', (newCount) => {
        console.log('Counter updated to:', newCount);
        setCounter(newCount);
      });
  
      // Listen for user count updates
      newSocket.on('users-update', (userCount) => {
        console.log('Users online:', userCount);
        setUsers(userCount);
      });
  
      setSocket(newSocket);
  
      // Cleanup when component unmounts
      return () => {
        newSocket.close();
      };
    }, []);
  
    const incrementCounter = () => {
      if (socket) {
        socket.emit('increment-counter');
      }
    };
  
    const resetCounter = () => {
      if (socket) {
        socket.emit('reset-counter');
      }
    };
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <h1 className="text-3xl font-bold mb-6">Real-Time Counter Demo</h1>
            
            {/* Connection Status */}
            <div className={`mb-4 p-2 rounded ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {connected ? '✅ Connected to server' : '❌ Disconnected from server'}
            </div>
    
            {/* Users Online */}
            <div className="mb-6 text-gray-600">
              👥 Users Online: <span className="font-bold">{users}</span>
            </div>
    
            {/* Counter Display */}
            <div className="mb-6">
              <div className="text-6xl font-bold text-blue-600 mb-2">{counter}</div>
              <p className="text-gray-500">Global Counter</p>
            </div>
    
            {/* Buttons */}
            <div className="space-y-3">
              <button 
                onClick={incrementCounter}
                disabled={!connected}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
              >
                +1 Increment
              </button>
              
              <button 
                onClick={resetCounter}
                disabled={!connected}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
              >
                🔄 Reset Counter
              </button>
            </div>
    
            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Test Real-Time:</h3>
              <p className="text-sm text-blue-700">
                Open this page in multiple browser tabs/windows and click the buttons. 
                Watch how all tabs update instantly! 🎉
              </p>
            </div>
          </div>
        </div>
      );
}

export default ConnectionCounter;