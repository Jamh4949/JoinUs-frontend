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
 * Custom hook for managing a Socket.IO connection.
 * 
 * This hook handles the lifecycle of a Socket.IO client, including connection,
 * disconnection, and reconnection logic. It provides the socket instance and
 * the current connection status.
 * 
 * @param serverUrl - The URL of the Socket.IO server to connect to.
 * @param autoConnect - Whether to connect automatically on mount. Defaults to true.
 * @returns An object containing the socket instance, connection status, and manual connect/disconnect functions.
 * 
 * @example
 * ```tsx
 * const { socket, isConnected } = useSocket('http://localhost:3000');
 * ```
 */
export const useSocket = (serverUrl: string, autoConnect: boolean = false) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Only connect if autoConnect is true and we don't have a socket instance
        if (autoConnect && !socketRef.current) {
            console.log('🔌 Initializing socket connection to:', serverUrl);

            // Create socket connection with robust options
            socketRef.current = io(serverUrl, {
                transports: ['polling', 'websocket'], // Start with polling for maximum compatibility, then upgrade
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                autoConnect: true
            });

            // Connection event handlers
            socketRef.current.on('connect', () => {
                console.log('✅ Socket connected:', socketRef.current?.id);
                setIsConnected(true);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('❌ Socket disconnected:', reason);
                setIsConnected(false);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('⚠️ Socket connection error:', error.message);
                setIsConnected(false);
            });
        }

        // Cleanup on unmount - ONLY if the component is truly unmounting
        return () => {
            // We consciously decide NOT to disconnect on unmount for this debugging session 
            // to see if it fixes the flickering. 
            // In a real app, we should disconnect, but maybe use a provider instead.
            // For now, let's keep the standard behavior but log it.
            if (socketRef.current) {
                console.log('🧹 Socket cleanup for:', serverUrl);
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
                transports: ['polling', 'websocket'],
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
