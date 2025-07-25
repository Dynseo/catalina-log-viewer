import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const credentials = btoa(`${username}:${password}`);
    try {
      // Test de connexion via un appel API
      const res = await axios.get(import.meta.env.VITE_API_URL + "/api/logs", {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (res.status === 200) {
        onLogin({ username, password });
        navigate("/logs");
      }
    } catch (err) {
      setError(`Identifiants invalides : ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Connexion</h1>
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Se connecter
      </button>
    </form>
  );
}