import {
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton,
  Divider,
  Box,
  InputAdornment,
} from '@mui/material';
import { useState } from 'react';
import { FiInstagram, FiYoutube, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { authState } from '../store/authState';
import { login } from '../services/User.service';
import logo from '../assets/Aegeus-Technologies-logo.png';
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [, setAuth] = useRecoilState(authState);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const res = await login(cleanEmail, cleanPassword);
      const { token, name, role, siteName } = res.data;

      setAuth({ name, role, token, initialized: true });
      localStorage.setItem('auth', JSON.stringify({ name, role, token, siteName }));
      setPassword('');

      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'USER') navigate('/dashboard');
      else navigate('/');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrorMessage('Invalid email or password.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        borderRadius: 3,
        backdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        ziIndex: -100,
      }}
    >
      {/* Logo */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <img src={logo} alt="Aegeus Technologies" style={{ width: 130 }} />
      </Box>

      {/* Heading */}
      <Typography variant="h6" align="center" color="#1a1a2e" gutterBottom sx={{ fontWeight: 700 }}>
        Welcome Back
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
      Sign in to manage your clean energy ecosystem
      </Typography>

      {/* Error */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Fields */}
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
       
      />

      {/* Login Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      {/* Divider + Social */}
      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Follow Us
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', justifyContent: 'center'}}>
        <IconButton
          href="https://www.instagram.com/aegeustech/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: '#E1306C' }}
        >
          <FiInstagram size={20} />
        </IconButton>

        <IconButton
          href="https://www.youtube.com/@aegeustechnologiesltd"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: '#FF0000' }}
        >
          <FiYoutube size={20} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default LoginForm;