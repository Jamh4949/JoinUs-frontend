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
import { BsMicFill, BsMicMuteFill, BsCameraVideoFill, BsCameraVideoOffFill } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../hooks/useSocket';
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

  // State
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(true);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    }) => {
      console.log('✅ Joined meeting:', data.meetingId);
      setParticipants(data.participants);
      setParticipantCount(data.participants.length);
      setMessages(data.messages);
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
      socket.off('error');
    };
  }, [socket, isConnected, meetingId, user, isAuthenticated, navigate]);

  /**
   * Handles message input change
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
   * Toggles microphone mute state
   */
  const toggleMute = (): void => {
    setIsMuted(!isMuted);
  };

  /**
   * Toggles video on/off state
   */
  const toggleVideo = (): void => {
    setIsVideoOff(!isVideoOff);
  };

  /**
   * Handles ending the call
   */
  const handleEndCall = (): void => {
    setShowExitModal(false);
    if (socket) {
      socket.disconnect();
    }
    navigate('/');
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
                🟢 Conectado
              </span>
            ) : (
              <span className="conference__status conference__status--disconnected">
                🔴 Desconectado
              </span>
            )}
          </div>
        </div>

        {/* Participants grid */}
        <div className="conference__participants">
          {Array.from({ length: Math.min(participantCount, 4) }).map((_, index) => (
            <div key={index} className="conference__participant">
              <div className="conference__participant-video">
                <div className="conference__participant-avatar">
                  {getInitials(participants[index]?.name || 'Usuario')}
                </div>
              </div>
              <span className="conference__participant-name">
                {participants[index]?.name || 'Cargando...'}
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
            className="conference__control-btn conference__control-btn--end"
            onClick={() => setShowExitModal(true)}
            aria-label="Finalizar llamada"
          >
            <MdCallEnd />
          </button>
        </div>
      </div>

      {/* Chat panel */}
      <div className="conference__chat">
        <div className="conference__chat-header">
          <h2>Chat</h2>
          <span className="conference__message-count">
            {messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'}
          </span>
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
                No
              </button>
              <button
                className="conference__modal-btn conference__modal-btn--yes"
                onClick={handleEndCall}
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conference;
