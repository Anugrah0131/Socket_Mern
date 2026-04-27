import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    const res = await axios.post("/api/auth/login", form);

    login({
      ...res.data.user,
      token: res.data.token,
    });
  };

  const guestLogin = async () => {
    const res = await axios.get("/api/auth/guest");
    login(res.data.user);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="p-6 bg-zinc-900 rounded-xl w-80">
        <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
        <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />

        <button onClick={handleLogin}>Login</button>
        <button onClick={guestLogin}>Continue as Guest</button>
      </div>
    </div>
  );
}