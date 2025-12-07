/**
 * Conference Page Component
 * 
 * Real-time video conference page with chat functionality.
 * Connects to Socket.IO chat server for real-time messaging.
 * 
 * Features:
 * - Real-time chat with Socket.IO
 * - Participant management (2-10 users)
 * - Audio/video controls (UI only)
 * - Meeting ID display
 * - Leave meeting functionality
 * 
 * @component
 * @module Conference
 */

import { useState, useEffect, useRef, type FC, type FormEvent, type ChangeEvent } from 'react';
import { IoMdSend } from 'react-icons/io';
import { MdCallEnd } from 'react-icons/md';
import { BsMicFill, BsMicMuteFill, BsCameraVideoFill, BsCameraVideoOffFill, BsChatDotsFill } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import './Conference.scss';

/**
 * Type definition for chat message
 */
type ChatMessage = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
};

/**
 * Type definition for participant
 */
type Participant = {
  uid: string;
  name: string;
  socketId: string;
  joinedAt: Date;
};

/**
 * Conference page component with real-time chat
 * 
 * @returns {JSX.Element} Rendered conference page
 */
const Conference: FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { meetingId } = useParams<{ meetingId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket.IO connection
  const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';
  const { socket, isConnected } = useSocket(CHAT_SERVER_URL, true);

  // WebRTC connection for audio and video
  const WEBRTC_SERVER_URL = import.meta.env.VITE_WEBRTC_SERVER_URL || 'http://localhost:3000';
  const { socket: webrtcSocket } = useSocket(WEBRTC_SERVER_URL, true);
  const {
    isMuted,
    isVideoOff,
    toggleMute: toggleWebRTCMute,
    toggleVideo: toggleWebRTCVideo,
    isInitialized: isWebRTCInitialized,
    error: webrtcError,
    localStream,
    peers: webrtcPeers
  } = useWebRTC(
    webrtcSocket,
    meetingId || '',
    user?.firstName || user?.name || 'Usuario'
  );

  // State
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isCreator, setIsCreator] = useState(false);

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  /**
   * Remove body padding and overflow on mount
   */
  useEffect(() => {
    // Save original styles
    const originalPadding = document.body.style.paddingTop;
    const originalOverflow = document.body.style.overflow;

    // Apply conference styles
    document.body.style.paddingTop = '0';
    document.body.style.overflow = 'hidden';

    // Cleanup on unmount
    return () => {
      document.body.style.paddingTop = originalPadding;
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  /**
   * Join meeting on component mount
   */
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!meetingId) {
      navigate('/meeting');
      return;
    }

    if (!socket || !isConnected) {
      return;
    }

    // Join the meeting
    socket.emit('join-meeting', {
      meetingId,
      uid: user?.uid,
      name: user?.firstName || user?.name || 'Usuario',
    });

    // Listen for successful join
    socket.on('joined-meeting', (data: {
      meetingId: string;
      participants: Participant[];
      messages: ChatMessage[];
      createdBy: string;
    }) => {
      console.log('✅ Joined meeting:', data.meetingId);
      setParticipantCount(data.participants.length);
      setMessages(data.messages);
      setIsCreator(data.createdBy === user?.uid);
      setIsJoining(false);
    });

    // Listen for join errors
    socket.on('join-error', (data: { message: string }) => {
      console.error('❌ Join error:', data.message);
      setError(data.message);
      setIsJoining(false);
      setTimeout(() => navigate('/meeting'), 3000);
    });

    // Listen for new participants
    socket.on('user-joined', (data: {
      uid: string;
      name: string;
      participantCount: number;
    }) => {
      console.log('👋 User joined:', data.name);
      setParticipantCount(data.participantCount);
    });

    // Listen for participants leaving
    socket.on('user-left', (data: {
      name: string;
      participantCount: number;
    }) => {
      console.log('👋 User left:', data.name);
      setParticipantCount(data.participantCount);
    });

    // Listen for new messages
    socket.on('new-message', (newMessage: ChatMessage) => {
      console.log('💬 New message:', newMessage);
      setMessages(prev => [...prev, newMessage]);

      // Increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadMessages(prev => prev + 1);
      }
    });

    // Listen for meeting ended
    socket.on('meeting-ended', () => {
      alert('La reunión ha sido finalizada por el anfitrión.');
      handleEndCall();
    });

    // Listen for errors
    socket.on('error', (data: { message: string }) => {
      console.error('❌ Socket error:', data.message);
      setError(data.message);
    });

    // Cleanup on unmount
    return () => {
      socket.off('joined-meeting');
      socket.off('join-error');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('new-message');
      socket.off('meeting-ended');
      socket.off('error');
    };
  }, [socket, isConnected, meetingId, user, isAuthenticated, navigate, isChatOpen]);

  /**
   * Attach local video stream to video element
   */
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      // Force reconnection to ensure video displays after toggle
      localVideoRef.current.srcObject = null;
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]); // Added isVideoOff dependency

  /**
   * Attach remote peer streams to video elements
   */
  useEffect(() => {
    webrtcPeers.forEach((peer, peerId) => {
      if (peer.stream) {
        const videoElement = remoteVideoRefs.current.get(peerId);
        if (videoElement && videoElement.srcObject !== peer.stream) {
          videoElement.srcObject = peer.stream;
        }
      }
    });
  }, [webrtcPeers]);

  /**
   * Handles input change for message
   */
  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value);
  };

  /**
   * Handles sending a message
   */
  const handleSendMessage = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (message.trim() && socket && isConnected) {
      socket.emit('send-message', {
        meetingId,
        text: message.trim(),
      });
      setMessage('');
    }
  };

  /**
   * Toggles microphone mute state using WebRTC
   */
  const toggleMute = (): void => {
    toggleWebRTCMute();
  };

  /**
   * Toggles video on/off state using WebRTC
   */
  const toggleVideo = (): void => {
    toggleWebRTCVideo();
  };

  /**
   * Toggles chat visibility
   */
  const toggleChat = (): void => {
    const newChatState = !isChatOpen;
    setIsChatOpen(newChatState);

    // Reset unread count when opening chat
    if (newChatState) {
      setUnreadMessages(0);
    }
  };

  /**
   * Handles ending the call
   */
  const handleEndCall = (): void => {
    setShowExitModal(false);
    if (socket) {
      socket.disconnect();
    }
    if (webrtcSocket) {
      webrtcSocket.disconnect();
    }
    navigate('/');
  };

  /**
   * Handles ending the meeting for everyone (host only)
   */
  const handleEndMeetingForAll = async (): Promise<void> => {
    if (!socket || !isConnected) return;

    try {
      const response = await fetch(`${CHAT_SERVER_URL}/api/meetings/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId,
          uid: user?.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al finalizar la reunión');
      }

      // The socket event 'meeting-ended' will handle the cleanup
    } catch (error: any) {
      console.error('Error ending meeting:', error);
      alert(error.message);
    }
  };

  /**
   * Gets initials from a name
   */
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Formats timestamp to time string
   */
  const formatTime = (timestamp: Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Show loading state
  if (isJoining) {
    return (
      <div className="conference conference--loading">
        <div className="conference__loading">
          <div className="conference__spinner"></div>
          <p>Uniéndose a la reunión {meetingId}...</p>
          {!isWebRTCInitialized && <p className="conference__loading-info">🎙️ Conectando audio...</p>}
          {webrtcError && <p className="conference__error-info">⚠️ {webrtcError}</p>}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="conference conference--error">
        <div className="conference__error-message">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <p>Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conference">
      {/* Video area */}
      <div className="conference__video-area">
        {/* Meeting info header */}
        <div className="conference__header">
          <div className="conference__meeting-info">
            <span className="conference__meeting-id">ID: {meetingId}</span>
            <span className="conference__participant-count">
              👥 {participantCount} {participantCount === 1 ? 'participante' : 'participantes'}
            </span>
          </div>
          <div className="conference__connection-status">
            {isConnected ? (
              <span className="conference__status conference__status--connected">
                🟢 Chat conectado
              </span>
            ) : (
              <span className="conference__status conference__status--disconnected">
                🔴 Chat desconectado
              </span>
            )}
            {isWebRTCInitialized ? (
              <span className="conference__status conference__status--connected">
                🎙️ Audio conectado
              </span>
            ) : (
              <span className="conference__status conference__status--disconnected">
                🎙️ Audio desconectado
              </span>
            )}
            {localStream && localStream.getVideoTracks().length > 0 ? (
              <span className="conference__status conference__status--connected">
                🎥 Video conectado
              </span>
            ) : (
              <span className="conference__status conference__status--disconnected">
                🎥 Video desconectado
              </span>
            )}
          </div>
        </div>

        {/* Participants grid */}
        <div className="conference__participants">
          {/* Local user video */}
          <div className="conference__participant conference__participant--local">
            <div className="conference__participant-video">
              {!isVideoOff && localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="conference__video-element"
                />
              ) : (
                <div className="conference__participant-avatar">
                  {getInitials(user?.firstName || user?.name || 'Usuario')}
                </div>
              )}
            </div>
            <span className="conference__participant-name">
              {user?.firstName || user?.name || 'Tú'} (Tú)
            </span>
          </div>

          {/* Remote participants */}
          {Array.from(webrtcPeers.entries()).slice(0, 9).map(([peerId, peer]) => (
            <div key={peerId} className="conference__participant">
              <div className="conference__participant-video">
                {peer.stream && peer.isVideoEnabled ? (
                  <video
                    ref={(el) => {
                      if (el) {
                        remoteVideoRefs.current.set(peerId, el);
                      }
                    }}
                    autoPlay
                    playsInline
                    className="conference__video-element"
                  />
                ) : (
                  <div className="conference__participant-avatar">
                    {getInitials(peer.userName || 'Usuario')}
                  </div>
                )}
              </div>
              <span className="conference__participant-name">
                {peer.userName || 'Usuario'}
              </span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="conference__controls">
          <button
            className={`conference__control-btn ${isMuted ? 'conference__control-btn--active' : ''}`}
            onClick={toggleMute}
            aria-label={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
          >
            {isMuted ? <BsMicMuteFill /> : <BsMicFill />}
          </button>

          <button
            className={`conference__control-btn ${isVideoOff ? 'conference__control-btn--active' : ''}`}
            onClick={toggleVideo}
            aria-label={isVideoOff ? 'Activar cámara' : 'Desactivar cámara'}
          >
            {isVideoOff ? <BsCameraVideoOffFill /> : <BsCameraVideoFill />}
          </button>

          <button
            className={`conference__control-btn ${isChatOpen ? 'conference__control-btn--chat-active' : ''}`}
            onClick={toggleChat}
            aria-label={isChatOpen ? 'Cerrar chat' : 'Abrir chat'}
            style={{ position: 'relative' }}
          >
            <BsChatDotsFill />
            {unreadMessages > 0 && (
              <span className="conference__notification-badge">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </button>

          <button
            className="conference__control-btn conference__control-btn--end"
            onClick={() => setShowExitModal(true)}
            aria-label="Finalizar llamada"
          >
            <MdCallEnd />
          </button>
        </div>
      </div>

      {/* Chat overlay for mobile */}
      {isChatOpen && (
        <div
          className="conference__chat-overlay"
          onClick={toggleChat}
          aria-label="Cerrar chat"
        />
      )}

      {/* Chat panel */}
      <div className={`conference__chat ${isChatOpen ? 'conference__chat--open' : ''}`}>
        <div className="conference__chat-header">
          <h2>Chat</h2>
          <span className="conference__message-count">
            {messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'}
          </span>
          <button
            className="conference__close-chat"
            onClick={toggleChat}
            aria-label="Cerrar chat"
          >
            ×
          </button>
        </div>

        <div className="conference__messages">
          {messages.length === 0 ? (
            <div className="conference__no-messages">
              <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`conference__message ${msg.userId === user?.uid ? 'conference__message--own' : ''
                  }`}
              >
                <div className="conference__message-header">
                  <span className="conference__message-user">{msg.userName}</span>
                  <span className="conference__message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="conference__message-text">{msg.text}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="conference__input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Escribir tu mensaje..."
            className="conference__input"
            aria-label="Escribe un mensaje"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="conference__send-btn"
            aria-label="Enviar mensaje"
            disabled={!message.trim() || !isConnected}
          >
            <IoMdSend />
          </button>
        </form>
      </div>

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="conference__modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="conference__modal" onClick={(e) => e.stopPropagation()}>
            <h2>¿Estás seguro que deseas salir de la reunión?</h2>
            <div className="conference__modal-buttons">
              <button
                className="conference__modal-btn conference__modal-btn--no"
                onClick={() => setShowExitModal(false)}
              >
                Cancelar
              </button>

              {isCreator && (
                <button
                  className="conference__modal-btn conference__modal-btn--end-all"
                  onClick={handleEndMeetingForAll}
                  style={{ backgroundColor: '#e74c3c', marginRight: '10px' }}
                >
                  Finalizar para todos
                </button>
              )}

              <button
                className="conference__modal-btn conference__modal-btn--yes"
                onClick={handleEndCall}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conference;
