import { useRecoilValue, useResetRecoilState } from "recoil";
import { authState } from "../store/authState";
import log from "../assets/Aegeus-Technologies-logo.png";
import { FiLogOut } from "react-icons/fi";
import { useContext } from "react";
import { 
  AppBar, Toolbar, Box, Typography, IconButton, 
  Tooltip, Avatar, Divider, useTheme 
} from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from "../App";


function Header() {
  const user = useRecoilValue(authState);
  const resetAuth = useResetRecoilState(authState);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext)

  const logout = () => {
    localStorage.removeItem("auth");
    resetAuth();
    window.location.href = "/";
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        background: theme.palette.mode === 'light' 
          ? "rgba(255, 255, 255, 0.8)" 
          : "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(12px)", // "Glass" effect
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: 1201 // Stays above sidebar
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        
        {/* Left Side: Logo & System Identity */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img src={log} alt="Logo" style={{ height: "32px", borderRadius: '4px' }} />
          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, my: 'auto' }} />
        </Box>

        {/* Right Side: Tools & User Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
          
          {/* Theme Toggle */}
          <Tooltip title={theme.palette.mode === 'dark' ? "Switch to Light" : "Switch to Dark"}>
            <IconButton onClick={colorMode.toggleColorMode} sx={{ color: 'text.primary' }}>
              {theme.palette.mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

          {/* User Profile Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1 }}>
                {user?.name || "Operator"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user?.role === "ADMIN" ? "Admin Access" : "User Access"}
              </Typography>
            </Box>
            
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: 'primary.main', 
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              {user?.name?.charAt(0) || "A"}
            </Avatar>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

          {/* Logout Button */}
          <Tooltip title="Logout">
            <IconButton 
              onClick={logout} 
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'error.main', bgcolor: 'error.lighter' } 
              }}
            >
              <FiLogOut size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;