import { useRecoilState } from "recoil";
import { authState } from "../store/authState";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [, setAuth] = useRecoilState(authState);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Trim input to remove accidental spaces
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Simple validation
    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Email and password are required.");
      return;
    }

    console.log('Attempting login with:', { email: cleanEmail, password: cleanPassword });

    try {
      const res = await api.post(
        '/v1/user/login',
        { email: cleanEmail, password: cleanPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Login response:', res.data);

      const { token, name, role } = res.data;

 
      setAuth({ name, role, token, initialized: true });

      localStorage.setItem('token', token);

      setPassword('');

      
     if (role === 'ADMIN') {
    navigate('/admin');
} else if (role === 'USER') {
    navigate('/dashboard'); 
} else {
    navigate('/');
}

    } catch (error: any) {
      console.error('Login failed', error.response?.data || error.message);

      // Show a friendly error message
      if (error.response?.status === 401) {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '10px auto' }}>
      <h1>Login Page</h1>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />
      <button
        onClick={handleLogin}
        style={{ width: '100%', padding: '10px', cursor: 'pointer' }}
      >
        Login
      </button>
    </div>
  );
}

export default Login;