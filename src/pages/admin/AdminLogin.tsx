import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_CONFIG, ADMIN_STORAGE_KEY } from "@/config/admin";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === ADMIN_CONFIG.id && password === ADMIN_CONFIG.password) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ isAdmin: true }));
      navigate("/admin/books", { replace: true });
    } else {
      setError("아이디 또는 비밀번호가 틀렸어요");
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleLogin}>
        <div className="admin-login-logo">📚 Chaekgado</div>
        <p className="admin-login-subtitle">관리자 로그인</p>

        {error && <div className="admin-login-error">{error}</div>}

        <input
          className="admin-input"
          placeholder="아이디"
          value={id}
          onChange={(e) => { setId(e.target.value); setError(""); }}
        />
        <input
          className="admin-input"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
        />

        <button type="submit" className="admin-btn-primary w-full">
          로그인
        </button>
      </form>
    </div>
  );
}
