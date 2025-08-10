import { useState } from "react";
import axios from "axios";
import "../css/Login.css";

export default function Login({
  onLogin,
  goToSignup,
}: {
  onLogin: () => void;
  goToSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      onLogin();
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
        autoComplete="username"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
        autoComplete="current-password"
      />

      <button onClick={handleLogin} className="login-button">
        Login
      </button>

      {error && <p className="login-error">{error}</p>}

      <p className="login-signup-text">
        Don't have an account?{" "}
        <button onClick={goToSignup} className="login-link-button">
          Signup
        </button>
      </p>
    </div>
  );
}
