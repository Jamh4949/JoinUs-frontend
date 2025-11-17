import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


import { loginWithGoogle, loginWithGithub, loginWithEmail } from "../config/firebase";


const API_URL = import.meta.env.VITE_BACKEND_API_URL;

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const saveSession = async (firebaseUser: any) => {
    const token = await firebaseUser.getIdToken();

    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      photo: firebaseUser.photoURL,
      token,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    return userData;
  };


  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();

      const token = await result.getIdToken();
      const session = await saveSession(result);
      console.log(token);
      const res = await axios.post(`${API_URL}/users/userExist`,{ token });

        if (!res.data.exists) {
        navigate("/registroExterno", {
            state: { googleData: res.data.googleData }
        });
        } else {
        navigate("/");
        }

      alert(`Bienvenido ${session.name}`);

    } catch (err) {
      console.error(err);
      alert("Error al iniciar sesión con Google");
    }
  };


  const handleGithubLogin = async () => {
  try {
    const user = await loginWithGithub();
    const token = await user.getIdToken();
    const session = await saveSession(user);

    const res = await axios.post(`${API_URL}/users/userExist`, { token });

    if (!res.data.exists) {
      navigate("/registroExterno", {
        state: { googleData: res.data.googleData }
      });
    } else {
      navigate("/");
    }

    alert(`Bienvenido ${session.name}`);

  } catch (err) {
    console.error(err);
    alert("Error al iniciar sesión con GitHub");
  }
};
  // -----------------------------------------------------------
  // LOGIN CON EMAIL / PASSWORD
  // -----------------------------------------------------------
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await loginWithEmail(email, password);
      const session = await saveSession(user);

      alert(`Bienvenido ${session.email}`);
      navigate("/");

    } catch (err) {
      alert("Correo o contraseña incorrectos");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Iniciar Sesión</h1>

      <button onClick={handleGoogleLogin}>Iniciar con Google</button>
      <button onClick={handleGithubLogin}>Iniciar con GitHub</button>

      <hr style={{ margin: "20px 0" }} />

      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Iniciar con Correo</button>
      </form>
    </div>
  );
};

export default Login;
