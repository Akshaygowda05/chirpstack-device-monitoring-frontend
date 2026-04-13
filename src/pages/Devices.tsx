import { useEffect, useState } from "react";
import { fetchdevices, unicastDownlink } from "../services/User.service";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Pagination, IconButton, Tooltip, LinearProgress
} from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy'; 
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';

function Devices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // PAGINATION STATE
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetchdevices(limit, offset, search);
      // Directly setting the result from your JSON structure
      setDevices(res.data.result || []);
    } catch (err) {
      console.error("Error fetching devices", err);
    } finally {
      setLoading(false);
    }
  };

  const sendDownLink = async (data: string, devEui: string) => {
    try {
      const result = await unicastDownlink(devEui, data);
      if (result?.data?.id) alert("Command sent successfully");
    } catch (err) {
      alert("Error sending command");
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchDevices(), 500);
    return () => clearTimeout(delay);
  }, [offset, search]);

  // Battery Logic: Calculates % based on 30V max
  const getBatteryInfo = (voltageStr: string) => {
    const voltage = parseFloat(voltageStr) || 0;
    const percentage = Math.min((voltage / 30) * 100, 100);
    return {
      volts: voltage,
      percent: percentage,
      color: percentage < 20 ? "#ef4444" : "#10b981"
    };
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#fff", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Robots</Typography>

      <Box sx={{ mb: 4, maxWidth: 400 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search robots by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              sx: { borderRadius: 2, bgcolor: "#f9fafb" }
            }
          }}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eee", borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>ROBOT / DEVEUI</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>LOCATION</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>BATTERY </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>LAST SEEN</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>STATUS</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}>Loading Robots...</TableCell></TableRow>
            ) : (
              devices.map((device) => {
                const battery = getBatteryInfo(device.batteryVoltage);
                return (
                  <TableRow key={device.devEui} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SmartToyIcon sx={{ color: "#3b82f6" }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{device.name}</Typography>
                          <Typography variant="caption" color="textSecondary">{device.devEui}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.85rem" }}>{device.description}</TableCell>

                    <TableCell sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, width: 35 }}>{device.batteryVoltage}V</Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={battery.percent} 
                            sx={{ height: 6, borderRadius: 5, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: battery.color } }}
                          />
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {formatDistanceToNow(new Date(device.lastSeenAt))} ago
                    </TableCell>

                    <TableCell>
                      <Box sx={{ 
                        display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, fontSize: "0.7rem", fontWeight: "bold",
                        bgcolor: device.isActive === "online" ? "#dcfce7" : "#fee2e2",
                        color: device.isActive === "online" ? "#166534" : "#991b1b"
                      }}>
                        {device.isActive.toUpperCase()}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button size="small" variant="contained" color="success" onClick={() => sendDownLink("Ag==", device.devEui)} sx={{ fontSize: '10px' }}>Start</Button>
                        <Button size="small" variant="contained" color="error" onClick={() => sendDownLink("Aw==", device.devEui)} sx={{ fontSize: '10px' }}>Stop</Button>
                        <Button size="small" variant="outlined" onClick={() => sendDownLink("Ae==", device.devEui)} sx={{ fontSize: '10px' }}>Return</Button>
                        
                        <IconButton size="small" color="warning" onClick={() => sendDownLink("Ac==", device.devEui)}>
                          <RestartAltIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton size="small" onClick={() => navigate(`/devices/${device.devEui}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Dynamic Pagination */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: "1px solid #eee" }}>
          <Pagination 
            // If total is missing, we show at least 1 page or more if we have a full list of 10
            count={devices.length === limit ? Math.floor(offset / limit) + 2 : Math.floor(offset / limit) + 1} 
            page={Math.floor(offset / limit) + 1}
            color="primary" 
            onChange={(_, page) => setOffset((page - 1) * limit)}
          />
        </Box>
      </TableContainer>
    </Box>
  );
}

export default Devices;