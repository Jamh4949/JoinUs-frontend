/**
 * WebRTC Hook for Real-Time Audio and Video Communication
 * 
 * Manages WebRTC peer connections, audio/video streams, and media controls.
 * Uses PeerJS for simplified WebRTC implementation and Socket.IO for signaling.
 * 
 * Features:
 * - Audio and video stream capture and management
 * - Peer connection handling
 * - Real-time mute/unmute and video on/off
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
  /** Unique identifier for the peer */
  peerId: string;
  /** Display name of the user */
  userName: string;
  /** The PeerJS call object */
  call: any;
  /** The remote media stream */
  stream: MediaStream | null;
  /** Whether the peer has video enabled */
  isVideoEnabled: boolean;
};

/**
 * Interface representing the return values of the useWebRTC hook.
 */
interface UseWebRTC {
  /** The current mute state of the local audio stream */
  isMuted: boolean;
  /** The current video off state */
  isVideoOff: boolean;
  /** Function to toggle the mute state */
  toggleMute: () => void;
  /** Function to toggle the video state */
  toggleVideo: () => void;
  /** Boolean indicating if the WebRTC connection is fully initialized */
  isInitialized: boolean;
  /** Error message if any error occurs during connection */
  error: string | null;
  /** Local media stream (for video rendering) */
  localStream: MediaStream | null;
  /** Map of peer connections with their streams */
  peers: Map<string, PeerConnection>;
  /** Check permission state */
  permissionState: PermissionState | 'prompt' | 'denied' | 'granted';
}

/**
 * Custom hook for handling WebRTC audio connections using PeerJS.
 * 
 * This hook manages the lifecycle of a PeerJS connection, handles incoming calls,
 * and manages the local audio stream. It integrates with Socket.IO for signaling.
 * 
 * @param socket - The Socket.IO client instance used for signaling.
 * @param roomId - The ID of the room to join.
 * @param userName - The name of the local user.
 * @returns {UseWebRTC} An object containing the mute state, toggle function, initialization status, and any errors.
 * 
 * @example
 * ```tsx
 * const { isMuted, toggleMute } = useWebRTC(socket, 'room-123', 'Alice');
 * ```
 */
export const useWebRTC = (
  socket: Socket | null,
  roomId: string,
  userName: string
): UseWebRTC => {
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | 'prompt'>('prompt');

  const peerInstance = useRef<Peer | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const participantsRef = useRef<Map<string, string>>(new Map()); // Map<peerId, userName>
  const myPeerIdRef = useRef<string | null>(null);

  /**
   * Helper function to play audio stream
   * 
   * @param stream - The MediaStream to play
   * @param peerId - The peer ID for tracking
   */


  /**
   * Initialize WebRTC: get audio stream and create peer instance
   */
  useEffect(() => {
    if (!socket || !roomId) return;

    const initWebRTC = async () => {
      try {
        // Get user's audio and video stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user',
          },
        });

        setLocalStream(stream);
        setPermissionState('granted');

        // Create peer instance
        const PEER_SERVER_URL = import.meta.env.VITE_PEER_SERVER_URL || 'localhost';
        const PEER_SERVER_PORT = import.meta.env.VITE_PEER_SERVER_PORT ? parseInt(import.meta.env.VITE_PEER_SERVER_PORT) : 3000;
        const PEER_SERVER_PATH = import.meta.env.VITE_PEER_SERVER_PATH || '/peerjs';

        // Determine if connection should be secure
        const isSecure = import.meta.env.VITE_PEER_SECURE
          ? import.meta.env.VITE_PEER_SECURE === 'true'
          : window.location.protocol === 'https:';

        const peer = new Peer({
          host: PEER_SERVER_URL,
          port: PEER_SERVER_PORT,
          path: PEER_SERVER_PATH,
          secure: isSecure,
          config: {
            iceServers: [
              // OpenRelay (Free TURN) - Critical for cross-network (Symmetric NAT)
              {
                urls: [
                  "stun:openrelay.metered.ca:80",
                  "turn:openrelay.metered.ca:80",
                  "turn:openrelay.metered.ca:443?transport=tcp"
                ],
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              // Google STUN (Backup)
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        });

        peerInstance.current = peer;

        // When peer is ready, try to join room
        peer.on('open', (id) => {
          console.log('🎙️ Peer connected with ID:', id);
          myPeerIdRef.current = id;
          if (socket && socket.connected) {
            console.log('🔗 Socket ready, joining room...');
            socket.emit('join-room', {
              roomId,
              peerId: id,
              userName,
              isVideoEnabled: !stream.getVideoTracks()[0].enabled ? false : true
            });
            setIsInitialized(true);
          } else {
            console.log('⏳ Peer ready but socket not connected yet...');
          }
        });

        // Handle incoming calls
        peer.on('call', (call) => {
          console.log('📞 Receiving call from:', call.peer);

          // Answer with local stream
          call.answer(stream);

          // Receive remote stream
          call.on('stream', (remoteStream) => {
            console.log('🔊 Received remote stream from:', call.peer);

            // Try to find name in our participants map
            const storedName = participantsRef.current.get(call.peer);
            console.log(`👤 Resolved name for ${call.peer}: ${storedName || 'Usuario'}`);

            const peerConnection: PeerConnection = {
              peerId: call.peer,
              userName: storedName || 'Usuario',
              call,
              stream: remoteStream,
              isVideoEnabled: true // Default assumption
            };

            peersRef.current.set(call.peer, peerConnection);
            setPeers(new Map(peersRef.current));

            // Play audio -> Now handled by UI
            // playAudioStream(remoteStream, call.peer);

            // Log ICE state changes
            call.peerConnection.oniceconnectionstatechange = () => {
              console.log(`❄️ ICE State (${call.peer}):`, call.peerConnection.iceConnectionState);
            };
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
        setError('No se pudo acceder al micrófono o cámara. Por favor, permite el acceso.');
        setPermissionState('denied');
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
   * Listen for socket events (Get Users & Toggle Video)
   */
  useEffect(() => {
    if (!socket) return;

    // Handle initial user list
    const handleGetUsers = ({ participants }: { roomId: string; participants: Record<string, { peerId: string; userName: string; isVideoEnabled: boolean }> }) => {
      console.log('👥 Received participants list:', participants);

      // Store names in our ref map first
      Object.values(participants).forEach(({ peerId, userName }) => {
        participantsRef.current.set(peerId, userName);
      });

      // Update existing peers with correct userNames and video state
      Object.values(participants).forEach(({ peerId, userName, isVideoEnabled }) => {
        const existingPeer = peersRef.current.get(peerId);
        if (existingPeer) {
          existingPeer.userName = userName;
          existingPeer.isVideoEnabled = isVideoEnabled ?? true;
          peersRef.current.set(peerId, existingPeer);
        }
      });

      setPeers(new Map(peersRef.current));
    };

    // Handle toggle video event from other peers
    const handleUserToggledVideo = ({ peerId, isVideoOff }: { peerId: string; isVideoOff: boolean }) => {
      console.log(`🎥 Peer ${peerId} toggled video. Off: ${isVideoOff}`);
      const peer = peersRef.current.get(peerId);
      if (peer) {
        peer.isVideoEnabled = !isVideoOff;
        peersRef.current.set(peerId, peer);
        setPeers(new Map(peersRef.current));
      }
    };

    socket.on('get-users', handleGetUsers);
    socket.on('user-toggled-video', handleUserToggledVideo);

    return () => {
      socket.off('get-users', handleGetUsers);
      socket.off('user-toggled-video', handleUserToggledVideo);
    };
  }, [socket]);

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
   * Handle new user joining the room (Cleaned & Debounced)
   */
  useEffect(() => {
    if (!socket || !localStream || !peerInstance.current) return;

    const handleUserJoined = ({ peerId, userName, isVideoEnabled }: { peerId: string; userName: string; isVideoEnabled: boolean }) => {
      console.log('👋 New user joined, calling:', peerId, userName);

      // Store in participants map
      participantsRef.current.set(peerId, userName);

      // Prevent duplicate calls if we are already seeing this peer
      if (peersRef.current.has(peerId)) {
        console.log('⚠️ Already connected to peer:', peerId);
        return;
      }

      // Add a small delay to ensure the other peer is fully ready to answer
      setTimeout(() => {
        const call = peerInstance.current!.call(peerId, localStream);

        if (!call) {
          console.error('❌ Failed to call peer:', peerId);
          return;
        }

        const peerConnection: PeerConnection = {
          peerId,
          userName,
          call,
          stream: null, // Stream comes later
          isVideoEnabled: isVideoEnabled ?? true
        };

        // Cache connection immediately to prevent duplicates
        peersRef.current.set(peerId, peerConnection);
        setPeers(new Map(peersRef.current));

        // Event: Receive remote stream
        call.on('stream', (remoteStream) => {
          console.log('🔊 Received stream from (outgoing):', peerId);

          // Update the existing connection with the stream
          const currentPeer = peersRef.current.get(peerId);
          if (currentPeer) {
            currentPeer.stream = remoteStream;
            peersRef.current.set(peerId, currentPeer);
            setPeers(new Map(peersRef.current));

            // Play audio -> Now handled by UI
            // playAudioStream(remoteStream, peerId);
            
            // Log ICE state changes
            call.peerConnection.oniceconnectionstatechange = () => {
              console.log(`❄️ ICE State (${peerId}):`, call.peerConnection.iceConnectionState);
            };
          }
        });

        call.on('error', (err) => {
          console.error('❌ Call error with:', peerId, err);
          peersRef.current.delete(peerId);
          setPeers(new Map(peersRef.current));
        });

        call.on('close', () => {
          console.log('📴 Call closed with:', peerId);
          peersRef.current.delete(peerId);
          setPeers(new Map(peersRef.current));
        });
      }, 1000); // 1s delay
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
   * Toggle mute state of local audio track
   */
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  /**
   * Toggle video on/off state of local video track
   */
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);

        // Notify signal server about video state change
        if (socket && myPeerIdRef.current) {
          socket.emit('toggle-video', {
            roomId,
            peerId: myPeerIdRef.current,
            isVideoOff: !videoTrack.enabled
          });
        }
      }
    }
  }, [localStream, socket, roomId]);

  return {
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    isInitialized,
    error,
    localStream,
    peers,
    permissionState
  };
};
