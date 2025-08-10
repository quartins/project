import { useState } from "react";
import axios from "axios";
import "../css/Signup.css";

export default function Signup({
  onSignup,
  goToLogin,
}: {
  onSignup: () => void;
  goToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignup() {
    try {
      await axios.post("/api/auth/signup", { name, email, password });
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      onSignup();
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    }
  }

  return (
    
    <div className="signup-container">
      <h2 className="signup-title">Signup</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="signup-input"
      />

      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="signup-input"
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="signup-input"
      />

      <button
        onClick={handleSignup}
        className="signup-button"
      >
        Signup
      </button>

      {error && <p className="signup-error">{error}</p>}

      <p className="signup-login-text">
        Already have an account?{" "}
        <button onClick={goToLogin} className="signup-login-button">
          Login
        </button>
      </p>
    </div>
  );
}
