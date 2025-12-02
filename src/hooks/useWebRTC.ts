/**
 * WebRTC Hook for Real-Time Audio Communication
 * 
 * Manages WebRTC peer connections, audio streams, and mute/unmute functionality.
 * Uses PeerJS for simplified WebRTC implementation and Socket.IO for signaling.
 * 
 * Features:
 * - Audio stream capture and management
 * - Peer connection handling
 * - Real-time mute/unmute
 * - Automatic cleanup
 * 
 * @module useWebRTC
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';
import { Socket } from 'socket.io-client';

/**
 * Type definition for peer connections
 */
type PeerConnection = {
  peerId: string;
  userName: string;
  call: any;
  stream: MediaStream | null;
};

/**
 * Type definition for WebRTC hook return value
 */
type UseWebRTCReturn = {
  peers: Map<string, PeerConnection>;
  localStream: MediaStream | null;
  isMuted: boolean;
  toggleMute: () => void;
  isInitialized: boolean;
  error: string | null;
};

/**
 * WebRTC hook for managing peer connections and audio streams
 * 
 * @param {Socket | null} socket - Socket.IO connection for signaling
 * @param {string} roomId - Room ID to join
 * @param {string} userName - User's display name
 * @returns {UseWebRTCReturn} WebRTC state and controls
 */
export const useWebRTC = (
  socket: Socket | null,
  roomId: string,
  userName: string
): UseWebRTCReturn => {
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerInstance = useRef<Peer | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  /**
   * Initialize WebRTC: get audio stream and create peer instance
   */
  useEffect(() => {
    if (!socket || !roomId) return;

    const initWebRTC = async () => {
      try {
        // Get user's audio stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        setLocalStream(stream);

        // Create peer instance
        // Create peer instance
        const PEER_SERVER_URL = import.meta.env.VITE_PEER_SERVER_URL || 'localhost';
        // If we are in production (Render), we likely use 443 (https) or 80 (http). 
        // If localhost, we use the port from env or 3000.
        // IMPORTANT: We are now running PeerServer on the SAME port as the WebRTC server.
        const PEER_SERVER_PORT = import.meta.env.VITE_PEER_SERVER_PORT ? parseInt(import.meta.env.VITE_PEER_SERVER_PORT) : 3000;

        const isSecure = PEER_SERVER_URL !== 'localhost'; // Simple check, can be improved

        const peer = new Peer({
          host: PEER_SERVER_URL,
          port: PEER_SERVER_PORT,
          path: '/peerjs',
          secure: isSecure,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        });

        peerInstance.current = peer;

        // When peer is ready, try to join room
        peer.on('open', (id) => {
          console.log('🎙️ Peer connected with ID:', id);
          if (socket && socket.connected) {
            console.log('🔗 Socket ready, joining room...');
            socket.emit('join-room', { roomId, peerId: id, userName });
            setIsInitialized(true);
          } else {
            console.log('⏳ Peer ready but socket not connected yet...');
          }
        });

        // ... (rest of initWebRTC)


        // Handle incoming calls
        peer.on('call', (call) => {
          console.log('📞 Receiving call from:', call.peer);

          // Answer with local stream
          call.answer(stream);

          // Receive remote stream
          call.on('stream', (remoteStream) => {
            console.log('🔊 Received remote stream from:', call.peer);

            const peerConnection: PeerConnection = {
              peerId: call.peer,
              userName: 'Usuario',
              call,
              stream: remoteStream,
            };

            peersRef.current.set(call.peer, peerConnection);
            setPeers(new Map(peersRef.current));

            // Play audio
            playAudioStream(remoteStream);
          });

          call.on('close', () => {
            console.log('📴 Call closed with:', call.peer);
            peersRef.current.delete(call.peer);
            setPeers(new Map(peersRef.current));
          });
        });

        peer.on('error', (err) => {
          console.error('❌ Peer error:', err);
          setError(`Error de conexión: ${err.type}`);
        });

      } catch (err) {
        console.error('❌ Failed to initialize WebRTC:', err);
        setError('No se pudo acceder al micrófono. Por favor, permite el acceso.');
      }
    };

    initWebRTC();

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
      peersRef.current.forEach(peer => {
        if (peer.call) {
          peer.call.close();
        }
      });
      peersRef.current.clear();
    };
  }, [socket, roomId, userName]);

  /**
   * Handle socket reconnection or late connection
   */
  useEffect(() => {
    if (socket && socket.connected && peerInstance.current && !isInitialized) {
      const peerId = peerInstance.current.id;
      if (peerId) {
        console.log('🔗 Socket reconnected/ready, joining room with PeerID:', peerId);
        socket.emit('join-room', { roomId, peerId, userName });
        setIsInitialized(true);
      }
    }
  }, [socket, socket?.connected, roomId, userName, isInitialized]);

  /**
   * Handle new user joining the room
   */
  useEffect(() => {
    if (!socket || !localStream || !peerInstance.current) return;

    const handleUserJoined = ({ peerId, userName }: { peerId: string; userName: string }) => {
      console.log('👋 New user joined, calling:', peerId, userName);

      // Call the new user
      const call = peerInstance.current!.call(peerId, localStream);

      const peerConnection: PeerConnection = {
        peerId,
        userName,
        call,
        stream: null,
      };

      // Receive remote stream
      call.on('stream', (remoteStream) => {
        console.log('🔊 Received stream from:', peerId);
        peerConnection.stream = remoteStream;
        peersRef.current.set(peerId, peerConnection);
        setPeers(new Map(peersRef.current));

        // Play audio
        playAudioStream(remoteStream);
      });

      call.on('close', () => {
        console.log('📴 Call closed with:', peerId);
        peersRef.current.delete(peerId);
        setPeers(new Map(peersRef.current));
      });

      peersRef.current.set(peerId, peerConnection);
      setPeers(new Map(peersRef.current));
    };

    const handleUserDisconnected = (peerId: string) => {
      console.log('👋 User disconnected:', peerId);
      const peer = peersRef.current.get(peerId);
      if (peer?.call) {
        peer.call.close();
      }
      peersRef.current.delete(peerId);
      setPeers(new Map(peersRef.current));
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('user-disconnected', handleUserDisconnected);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-disconnected', handleUserDisconnected);
    };
  }, [socket, localStream]);

  /**
   * Play audio stream through Audio element
   */
  const playAudioStream = (stream: MediaStream) => {
    const audio = new Audio();
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.play().catch(err => {
      console.error('❌ Failed to play audio:', err);
    });
  };

  /**
   * Toggle mute/unmute local audio stream
   * This is a local-only operation - no backend notification needed
   */
  const toggleMute = useCallback(() => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);

      console.log(`🔇 Audio ${!audioTrack.enabled ? 'muted' : 'unmuted'}`);
    }
  }, [localStream]);

  return {
    peers,
    localStream,
    isMuted,
    toggleMute,
    isInitialized,
    error,
  };
};
