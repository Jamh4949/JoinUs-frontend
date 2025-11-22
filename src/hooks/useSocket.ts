/**
 * Socket.IO Hook
 * 
 * Custom React hook for managing Socket.IO connection lifecycle.
 * Handles connection, disconnection, and event listeners.
 * 
 * @module hooks/useSocket
 */

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Custom hook for Socket.IO connection management
 * 
 * @param {string} serverUrl - Socket.IO server URL
 * @param {boolean} autoConnect - Whether to connect automatically
 * @returns {Object} Socket instance and connection status
 */
export const useSocket = (serverUrl: string, autoConnect: boolean = false) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (autoConnect && !socketRef.current) {
            // Create socket connection
            socketRef.current = io(serverUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // Connection event handlers
            socketRef.current.on('connect', () => {
                console.log('✅ Socket connected:', socketRef.current?.id);
                setIsConnected(true);
            });

            socketRef.current.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                setIsConnected(false);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
            });
        }

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [serverUrl, autoConnect]);

    /**
     * Manually connect to the socket server
     */
    const connect = () => {
        if (!socketRef.current) {
            socketRef.current = io(serverUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketRef.current.on('connect', () => {
                console.log('✅ Socket connected:', socketRef.current?.id);
                setIsConnected(true);
            });

            socketRef.current.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                setIsConnected(false);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
            });
        } else if (!socketRef.current.connected) {
            socketRef.current.connect();
        }
    };

    /**
     * Manually disconnect from the socket server
     */
    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        connect,
        disconnect,
    };
};
