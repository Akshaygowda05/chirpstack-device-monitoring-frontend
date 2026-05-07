import React, { useState, useEffect } from "react";
import { 
  Box, Paper, Typography, TextField, Button, 
  Switch, FormControlLabel, Select, MenuItem, 
  InputLabel, FormControl, Grid, Divider, CircularProgress, 
  Alert, Snackbar, useTheme, Card, CardContent
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SaveIcon from '@mui/icons-material/Save';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import HubIcon from '@mui/icons-material/Hub';
import StraightenIcon from '@mui/icons-material/Straighten';
import { getsiteConfig, updateSiteConfig } from "../services/User.service";

export function SiteConfigPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<String | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    panelsGap: 0,
    panelWidth: 0,
    multiplicationFactor: 1,
    triggeringAction: "UNICAST",
    sendTwiceAday: false
  });

  // Fetch existing "Old Data" on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await getsiteConfig();
        console.log("Fetch response:", response);
        const data = await response.data;
        
        // Populate form with existing data from DB
        setFormData({
          panelsGap: data.panelsGap || 0,
          panelWidth: data.panelWidth || 0,
          multiplicationFactor: data.multiplicationFactor || 1,
          triggeringAction: data.triggeringAction || "UNICAST",
          sendTwiceAday: data.sendTwiceAday || false
        });
      } catch (err) {
        setError("System could not retrieve existing configuration.");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e:any) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
    const response = await updateSiteConfig(formData);

      if (!response.data) throw new Error("Update failed");

        
      setSuccess(true);
      
     // this is will wait for 1.5 seconds then it will navigate 
      setTimeout(() => {
        navigate("/dashboard");
        window.location.href = "/dashboard"; 
      }, 1500);

    } catch (err) {
      setError("Failed to save configuration. Please verify your connection.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 2 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">Fetching System Data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 6 }, 
      maxWidth: 1200, 
      mx: "auto", 
      mt: { xs: 8, md: 10 } 
    }}>
      
      {/* Top Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SettingsInputComponentIcon fontSize="large" color="primary" /> Site Configuration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage hardware specifications and downlink scheduling.
          </Typography>
        </Box>
        <Button 
          startIcon={<DashboardIcon />} 
          variant="outlined" 
          onClick={() => navigate("/dashboard")}
          sx={{ borderRadius: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <form onSubmit={handleUpdate}>
        <Grid container spacing={3}>
          
          {/* Physical Layout Card */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StraightenIcon color="action" /> Physical Layout
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Panel Width (mm)"
                      name="panelWidth"
                      type="number"
                      value={formData.panelWidth}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Gap Between Panels (mm)"
                      name="panelsGap"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      value={formData.panelsGap}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Multiplication Factor (Panel Count)</InputLabel>
                      <Select
                        name="multiplicationFactor"
                        value={formData.multiplicationFactor}
                        label="Multiplication Factor (Panel Count)"
                        onChange={handleChange}
                      >
                        <MenuItem value={1}>1 Panel</MenuItem>
                        <MenuItem value={2}>2 Panels</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Logic & Communication Card */}
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HubIcon color="action" /> Logic & Comm
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Triggering Action</InputLabel>
                    <Select
                      name="triggeringAction"
                      value={formData.triggeringAction}
                      label="Triggering Action"
                      onChange={handleChange}
                    >
                      <MenuItem value="UNICAST">Unicast</MenuItem>
                      <MenuItem value="MULTICAST">Multicast</MenuItem>
                      <MenuItem value="BOTH">Both (Unicast & Multicast)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'rgba(255,255,255,0.05)', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={formData.sendTwiceAday} 
                        onChange={handleChange} 
                        name="sendTwiceAday" 
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>Downlink Frequency</Typography>
                        <Typography variant="caption" color="text.secondary">Send downlink twice at the same time</Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button Row */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button 
                size="large" 
                variant="contained" 
                type="submit"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ px: 6, py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 700 }}
              >
                {saving ? "Saving Data..." : "Update Configuration"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Snackbar 
        open={success} 
        autoHideDuration={2000} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', fontWeight: 'bold' }}>
          Configuration Saved Successfully! Redirecting...
        </Alert>
      </Snackbar>
    </Box>
  );
}