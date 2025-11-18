import { useState, type FC, type FormEvent, type ChangeEvent } from 'react';
import { IoMdSend } from 'react-icons/io';
import { MdCallEnd } from 'react-icons/md';
import { BsMicFill, BsMicMuteFill, BsCameraVideoFill, BsCameraVideoOffFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Conference.scss';

type Message = {
  id: number;
  user: string;
  text: string;
  time: string;
};

/**
 * Conference page component with video area and chat
 * 
 * Features:
 * - Video conference area with participant placeholders
 * - Real-time chat interface
 * - Audio/video controls
 * - End call functionality
 * 
 * @returns {JSX.Element} Rendered conference page
 */
const Conference: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: 'Admin', text: 'Bienvenidos a la reunión', time: '10:30 AM' }
  ]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Mock participants
  const participants = [
    { id: 1, name: 'Alejandra Pizarro', photo: null },
    { id: 2, name: 'José Asencio', photo: null },
    { id: 3, name: 'Jorge Borges', photo: null },
    { id: 4, name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Tú', photo: null },
  ];

  /**
   * Handles message input change
   * @param {ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value);
  };

  /**
   * Handles sending a message
   * @param {FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleSendMessage = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        user: user?.firstName || 'Usuario',
        text: message,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([...messages, newMessage]);
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
    navigate('/');
  };

  /**
   * Gets initials from a name
   * @param {string} name - Full name
   * @returns {string} Initials
   */
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="conference">
      {/* Video area */}
      <div className="conference__video-area">
        <div className="conference__participants">
          {participants.map((participant) => (
            <div key={participant.id} className="conference__participant">
              <div className="conference__participant-video">
                <div className="conference__participant-avatar">
                  {getInitials(participant.name)}
                </div>
              </div>
              <span className="conference__participant-name">{participant.name}</span>
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
          <button 
            className="conference__close-chat"
            onClick={() => setShowExitModal(true)}
            aria-label="Cerrar chat"
          >
            ×
          </button>
        </div>

        <div className="conference__messages">
          {messages.map((msg) => (
            <div key={msg.id} className="conference__message">
              <div className="conference__message-header">
                <span className="conference__message-user">{msg.user}</span>
                <span className="conference__message-time">{msg.time}</span>
              </div>
              <p className="conference__message-text">{msg.text}</p>
            </div>
          ))}
        </div>

        <form className="conference__input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Escribir tu mensaje..."
            className="conference__input"
            aria-label="Escribe un mensaje"
          />
          <button 
            type="submit" 
            className="conference__send-btn"
            aria-label="Enviar mensaje"
            disabled={!message.trim()}
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
