import { Box, Container, Typography } from '@mui/material';
import background from '../assets/Aegeus-Banner-1.jpg';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Top tagline — sits above the card, lets background show around it */}
      <Box sx={{ textAlign: 'center', px: 1, mb: 4 ,}}>
        <Typography
          variant="h4"
          sx={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)', fontWeight: 700 }}
        >
          Aegeus Technologies
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: 'rgba(255,255,255,0.85)', mt: 1, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
        >
          India's clean energy transformation, simplified.
        </Typography>
      </Box>

    {/* Login card */}
      <Container maxWidth="xs">
        <LoginForm />
      </Container>
    </Box>
  );
};

export default LoginPage;