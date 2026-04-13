import React, { useEffect, useState } from "react";
import { fetchGroup, fetchBattery } from "../services/User.service";
import { 
  Box, Typography, MenuItem, Select, FormControl, InputLabel, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, CircularProgress, Grid
} from "@mui/material";
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';

// Helper component for the Battery Gauge
const BatteryGauge = ({ value }: { value: number }) => {
  // Color logic based on voltage (assuming 30V is 100%)
  const percentage = Math.min((value / 30) * 100, 100);
  const color = percentage < 20 ? "#ef4444" : percentage < 50 ? "#f59e0b" : "#10b981";

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress 
        variant="determinate" 
        value={100} 
        size={50} 
        thickness={5} 
        sx={{ color: (theme) => theme.palette.mode === 'light' ? '#eee' : '#334155' }} 
      />
      <CircularProgress 
        variant="determinate" 
        value={percentage} 
        size={50} 
        thickness={5} 
        sx={{ color: color, position: 'absolute', left: 0, strokeLinecap: 'round' }} 
      />
      <Box sx={{ position: 'absolute' }}>
        <Typography variant="caption" component="div" sx={{ fontWeight: 800 }}>
          {value}V
        </Typography>
      </Box>
    </Box>
  );
};

const BatteryPages = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [batteries, setBatteries] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroupsForBattery();
  }, []);

  const fetchGroupsForBattery = async () => {
    try {
      const res = await fetchGroup();
      const groupData = res.data.result;
      setGroups(groupData);
      if (groupData.length > 0) {
        const firstId = groupData[0].id;
        setSelectedGroup(firstId);
        fetchBatteries(firstId);
      }
    } catch (err) { console.error(err); }
  };

  const fetchBatteries = async (groupId: string) => {
    setLoading(true);
    try {
      const res = await fetchBattery(groupId);
      setBatteries(res.data.batteries || {});
    } catch (err) { setBatteries({}); }
    setLoading(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>Fleet Power Monitor</Typography>
        <Typography variant="body2" color="textSecondary">Real-time voltage tracking per robot group</Typography>
      </Box>

      <FormControl sx={{ minWidth: 280, mb: 4 }} size="small">
        <InputLabel>Active Fleet Group</InputLabel>
        <Select
          value={selectedGroup}
          label="Active Fleet Group"
          onChange={(e) => { setSelectedGroup(e.target.value); fetchBatteries(e.target.value); }}
          sx={{ borderRadius: 2 }}
        >
          {groups.map(group => (
            <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eee", borderRadius: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? '#fafafa' : '#1e293b' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>ROBOT NAME</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>BATTERY GAUGE</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>LAST SEEN</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>HEALTH STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 10 }}>Scanning Robots...</TableCell></TableRow>
            ) : Object.entries(batteries).map(([devEui, data]) => {
              const voltage = parseFloat(data.batteryLevel || "0");
              return (
                <TableRow key={devEui} hover>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{data.name}</Typography>
                    <Typography variant="caption" color="textSecondary">Active Node</Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <BatteryGauge value={voltage} />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{new Date(data.lastSeen).toLocaleTimeString()}</Typography>
                    <Typography variant="caption" color="textSecondary">{new Date(data.lastSeen).toLocaleDateString()}</Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ 
                      display: 'inline-block', px: 2, py: 0.5, borderRadius: 5, fontSize: '0.7rem', fontWeight: 900,
                      bgcolor: voltage > 5 ? '#dcfce7' : '#fee2e2',
                      color: voltage > 5 ? '#166534' : '#991b1b'
                    }}>
                      {voltage > 5 ? "HEALTHY" : "CRITICAL"}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BatteryPages;