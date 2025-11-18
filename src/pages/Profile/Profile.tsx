import { useState, useEffect, type FC, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.scss';

/**
 * Profile page component for editing user information
 * 
 * Features:
 * - Edit first name, last name, age, email, and password
 * - Avatar with user's initial
 * - Form validation
 * - Backend integration with PUT /api/users/update
 * 
 * @returns {JSX.Element} Rendered profile edit page
 */
const Profile: FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: user?.age?.toString() || '',
    email: user?.email || '',
    currentPassword: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [deletePassword, setDeletePassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is OAuth (no password)
  const isOAuthUser = !user?.hasPassword;

  // Load user data into form when user changes (after login or refresh)
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        age: user.age?.toString() || '',
        email: user.email || '',
        currentPassword: '',
      });
    }
  }, [user]);

  /**
   * Gets the first letter of the user's name for the avatar
   * @returns {string} First letter of the user's name
   */
  const getUserInitial = (): string => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return 'U';
  };

  /**
   * Handles input changes
   * @param {ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validates the form data
   * @returns {boolean} True if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'El nombre solo puede contener letras';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Los apellidos son requeridos';
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Los apellidos solo pueden contener letras';
    }

    // Validate age
    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'La edad es requerida';
    } else if (isNaN(age) || age < 18 || age > 120) {
      newErrors.age = 'La edad debe estar entre 18 y 120 años';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    // Validate current password (only required for non-OAuth users)
    if (!isOAuthUser && !formData.currentPassword.trim()) {
      newErrors.currentPassword = 'La contraseña actual es requerida para actualizar el perfil';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * @param {FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_BACKEND_API_URL;
      
      const updateData: any = {
        uid: user?.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        email: formData.email,
      };

      // Include current password for verification (only for non-OAuth users)
      if (!isOAuthUser) {
        updateData.currentPassword = formData.currentPassword;
      }

      const response = await fetch(`${API_URL}/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el perfil');
      }

      const result = await response.json();
      console.log('Server response:', result);

      // Update user in context with the data we just sent (guaranteed fresh)
      updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        email: formData.email,
      });

      alert('¡Perfil actualizado con éxito!');
      
      // Clear current password field
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
      }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles password change
   */
  const handlePasswordChange = async (): Promise<void> => {
    // Validate password fields
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPasswordModal = 'La contraseña actual es requerida';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'La contraseña debe contener mayúsculas, minúsculas y números';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_BACKEND_API_URL;
      
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user?.uid,
          email: user?.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar la contraseña');
      }

      alert('¡Contraseña cambiada con éxito!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert(error.message || 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles account deletion
   */
  const handleDeleteAccount = async (): Promise<void> => {
    // Only require password for non-OAuth users
    if (!isOAuthUser && !deletePassword.trim()) {
      alert('Debes ingresar tu contraseña para eliminar la cuenta');
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_BACKEND_API_URL;
      
      const requestBody: any = {
        email: user?.email,
      };

      // Only include password for non-OAuth users
      if (!isOAuthUser) {
        requestBody.currentPassword = deletePassword;
      }

      const response = await fetch(`${API_URL}/users/delete/${user?.uid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la cuenta');
      }

      alert('Cuenta eliminada con éxito');
      logout();
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(error.message || 'Error al eliminar la cuenta');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  return (
    <>
      <Navbar />
      <main className="profile">
        <div className="profile__container">
          <h1 className="profile__title">Editar Perfil</h1>

          <div className="profile__avatar">
            {getUserInitial()}
          </div>

          <form className="profile__form" onSubmit={handleSubmit}>
            <div className="profile__field">
              <label htmlFor="firstName">Nombres</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && (
                <span className="profile__error" id="firstName-error">
                  {errors.firstName}
                </span>
              )}
            </div>

            <div className="profile__field">
              <label htmlFor="lastName">Apellidos</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Pérez"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <span className="profile__error" id="lastName-error">
                  {errors.lastName}
                </span>
              )}
            </div>

            <div className="profile__field">
              <label htmlFor="age">Edad</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="18"
                min="18"
                max="120"
                aria-invalid={!!errors.age}
                aria-describedby={errors.age ? 'age-error' : undefined}
              />
              {errors.age && (
                <span className="profile__error" id="age-error">
                  {errors.age}
                </span>
              )}
            </div>

            <div className="profile__field">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span className="profile__error" id="email-error">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Only show password field for non-OAuth users */}
            {!isOAuthUser && (
              <div className="profile__field">
                <label htmlFor="currentPassword">Contraseña Actual*</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña actual"
                  aria-invalid={!!errors.currentPassword}
                  aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
                  required
                />
                {errors.currentPassword && (
                  <span className="profile__error" id="currentPassword-error">
                    {errors.currentPassword}
                  </span>
                )}
                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                  Requerida para confirmar los cambios
                </small>
              </div>
            )}

            <button 
              type="submit" 
              className="btn profile__submit"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Información'}
            </button>

            {/* Only show change password button for non-OAuth users */}
            {!isOAuthUser && (
              <button 
                type="button" 
                className="btn profile__change-password-btn"
                onClick={() => setShowPasswordModal(true)}
                disabled={isLoading}
                style={{ 
                  marginTop: '10px',
                  backgroundColor: '#4a90e2',
                  border: 'none'
                }}
              >
                Cambiar Contraseña
              </button>
            )}

            <button 
              type="button" 
              className="profile__delete-btn"
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoading}
            >
              Eliminar cuenta
            </button>
          </form>
        </div>

        {/* Password change modal */}
        {showPasswordModal && (
          <div className="profile__modal-overlay" onClick={() => {
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
          }}>
            <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
              <h2>Cambiar Contraseña</h2>
              <p style={{ marginTop: '10px', marginBottom: '20px', color: '#666' }}>
                Ingresa tu contraseña actual y tu nueva contraseña.
              </p>
              
              {/* Current Password */}
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label htmlFor="currentPasswordModal" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Contraseña Actual:
                </label>
                <input
                  type="password"
                  id="currentPasswordModal"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Tu contraseña actual"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: errors.currentPasswordModal ? '1px solid #e74c3c' : '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
                {errors.currentPasswordModal && (
                  <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    {errors.currentPasswordModal}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Nueva Contraseña:
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: errors.newPassword ? '1px solid #e74c3c' : '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
                {errors.newPassword && (
                  <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    {errors.newPassword}
                  </span>
                )}
              </div>

              {/* Confirm New Password */}
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Confirmar Nueva Contraseña:
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Repite la nueva contraseña"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: errors.confirmPassword ? '1px solid #e74c3c' : '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
                {errors.confirmPassword && (
                  <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="profile__modal-buttons">
                <button 
                  className="profile__modal-btn profile__modal-btn--no"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors({});
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="profile__modal-btn profile__modal-btn--yes"
                  onClick={handlePasswordChange}
                  disabled={isLoading}
                >
                  {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="profile__modal-overlay" onClick={() => {
            setShowDeleteModal(false);
            setDeletePassword('');
          }}>
            <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
              <h2>¿Estás seguro que deseas eliminar tu cuenta?</h2>
              <p style={{ marginTop: '10px', marginBottom: '20px', color: '#666' }}>
                Esta acción no se puede deshacer.
              </p>
              
              {/* Password field for deletion confirmation - only for non-OAuth users */}
              {!isOAuthUser && (
                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                  <label htmlFor="deletePassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Ingresa tu contraseña para confirmar:
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Tu contraseña actual"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}

              <div className="profile__modal-buttons">
                <button 
                  className="profile__modal-btn profile__modal-btn--no"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="profile__modal-btn profile__modal-btn--yes"
                  onClick={handleDeleteAccount}
                  disabled={isLoading || (!isOAuthUser && !deletePassword.trim())}
                >
                  {isLoading ? 'Eliminando...' : 'Eliminar Cuenta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Profile;
