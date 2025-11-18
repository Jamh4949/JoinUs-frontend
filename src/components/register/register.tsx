import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;


interface GoogleData {
  uid: string;
  email: string;
  name: string;
  photo?: string;
  token?: string;
}

interface Props {
  googleData: GoogleData;
}

export default function Registration({ googleData }: Props) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: googleData.email,
    firstName: googleData.name?.split(" ")[0] || "",
    lastName: googleData.name?.split(" ")[1] || "",
    age: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/users/registerProvider`,
        {
          uid: googleData.uid,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: Number(formData.age),
        }
      );
      alert("Registro completado correctamente");
      navigate("/");
      console.log(res.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Error al completar el registro");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Completar Registro</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label>Email</label>
        <input type="text" value={formData.email} disabled style={styles.input} />

        <label>Nombre</label>
        <input
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <label>Apellido</label>
        <input
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <label>Edad</label>
        <input
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          min={1}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>
          Completar Registro
        </button>
      </form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "400px",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "10px",
    background: "#f2f2f2",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
};
