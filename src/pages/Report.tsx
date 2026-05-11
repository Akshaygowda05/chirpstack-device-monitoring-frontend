import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, CardContent, Grid, MenuItem, Select,
  FormControl, InputLabel, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Stack, 
  alpha, useTheme, Divider, Chip, Skeleton
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import PublicIcon from '@mui/icons-material/Public';
import { fetchMulticastGroups, fetchReports, fetchSummary } from "../services/User.service";

const getToday = () => new Date().toISOString().split("T")[0];

interface Group { id: string; name: string; }
interface RobotReport { deviceName: string; totalPanelsCleaned: number; location: string; }

function Report() {
  const theme = useTheme();

  // Filter & UI States
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [robotData, setRobotData] = useState<Record<string, RobotReport>>({});
  const [blockTotal, setBlockTotal] = useState(0);
  const [siteSummary, setSiteSummary] = useState({ totalPanels: 0, totalRobots: 0 });

  // 1. Data Fetching Logic
  const fetchData = useCallback(async (groupId: string, start: string, end: string) => {
    if (!groupId || !start) return;
    setLoading(true);
    setError(null);
    try {
      const [reportRes, summaryRes] = await Promise.all([
        fetchReports(groupId, start, end),
        fetchSummary(start, end).catch(() => null)
      ]);

      const rawReport = reportRes.data;
      const robots: Record<string, RobotReport> = {};
      let blockSum = 0;

      // Extract Block Specific Data
      Object.entries(rawReport).forEach(([key, value]) => {
        if (key === "totalPanelsCleaned") blockSum = value as number;
        else robots[key] = value as RobotReport;
      });

      // Extract Global Site Data
      const sData = summaryRes?.data?.totalRobots;
      
      setRobotData(robots);
      setBlockTotal(blockSum);
      setSiteSummary({
        totalPanels: sData?.totalPanelsCleaned || 0,
        totalRobots: sData?.totalRobots || 0
      });
    } catch (err: any) {
      setError("Failed to synchronize site data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Initialization & Refresh Persistence
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchMulticastGroups();
        const groupList = res.data.result || [];
        setGroups(groupList);

        // Check if user was previously on a specific block
        const storedId = sessionStorage.getItem("selectedGroupIdForReport");
        const idToLoad = storedId || (groupList.length > 0 ? groupList[0].id : "");

        if (idToLoad) {
          setSelectedGroup(idToLoad);
          if (!storedId) sessionStorage.setItem("selectedGroupIdForReport", idToLoad);
          fetchData(idToLoad, startDate, endDate);
        }
      } catch { setError("System initialization failed."); }
    };
    init();
  }, [fetchData]);

  // 3. Selection Handlers
  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    sessionStorage.setItem("selectedGroupIdForReport", groupId);
    fetchData(groupId, startDate, endDate);
  };

  const handleDownload = async () => {
    setDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Smooth UX delay
    
    const rows = [
      ["--- ASSET PERFORMANCE REPORT ---"],
      ["Selected Block", groups.find(g => g.id === selectedGroup)?.name || selectedGroup],
      ["Period", `${startDate} to ${endDate}`],
      [""],
      ["Robot ID", "Location", "Panels Cleaned"],
      ...Object.values(robotData).map(r => [r.deviceName, r.location, r.totalPanelsCleaned]),
      [""],
      ["BLOCK SPECIFIC TOTAL", "", blockTotal],
      ["GLOBAL SITE TOTAL", "", siteSummary.totalPanels]
    ];
    
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Performance_Report_${startDate}.csv`;
    a.click();
    setDownloading(false);
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      maxWidth: "1400px", 
      margin: "0 auto", 
      bgcolor: "background.default", 
      minHeight: "100vh",
      color: "text.primary"
    }}>
      
      {/* TOP HEADER */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} mb={5}>
        <Box>
          <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-1.5px' }}>
            Robot Cleaning Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Autonomous Cleaning & Performance Monitoring
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="medium"
          startIcon={downloading ? <CheckCircleIcon /> : <DownloadIcon />}
          onClick={handleDownload}
          disabled={loading || Object.keys(robotData).length === 0}
          sx={{ 
            borderRadius: "8px",
            px: 2,          
         py: 0.75,
            transition: 'all 0.3s ease',
            bgcolor: downloading ? 'success.main' : 'primary.main'
          }}
        >
          {downloading ? "Preparing CSV..." : "Export Site Data"}
        </Button>
      </Stack>

      {/* SEARCH & FILTER BAR */}
      <Card sx={{ mb: 5, borderRadius: 4, bgcolor: "background.paper", border: '1px solid', borderColor: 'divider', backgroundImage: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Active Block</InputLabel>
                <Select 
                  value={selectedGroup} 
                  label="Active Block" 
                  onChange={(e) => handleGroupChange(e.target.value)} 
                  disabled={loading}
                >
                  {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2.5}>
              <TextField fullWidth size="small" type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Grid>
            <Grid item xs={6} md={2.5}>
              <TextField fullWidth size="small" type="date" label="End Date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth variant="outlined" size="medium" onClick={() => fetchData(selectedGroup, startDate, endDate)} disabled={loading} sx={{ borderRadius: "8px", height: '40px' }}>
                Apply 
              </Button>
               <Button fullWidth variant="outlined" size="medium" onClick={() => {
                window.location.reload();
               }} disabled={loading} sx={{ borderRadius: "8px", height: '40px' }}>
                clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KPI DASHBOARD */}
      <Grid container spacing={3} mb={5}>
        {/* Block Performance (API #1) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: 'white' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="overline" sx={{ fontWeight: 700, opacity: 0.8 }}>Current Block Total</Typography>
                <CleaningServicesIcon />
              </Stack>
              {loading ? <Skeleton variant="rectangular" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} /> : 
                <Typography variant="h3" fontWeight={800}>{blockTotal.toLocaleString()}</Typography>
              }
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Panels cleaned in selected group</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Global Site Performance (API #2) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, bgcolor: "background.paper", border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Total Site Modules</Typography>
                <PublicIcon color="info" />
              </Stack>
              {loading ? <Skeleton variant="rectangular" height={40} /> : 
                <Typography variant="h3" fontWeight={800}>{siteSummary.totalPanels.toLocaleString()}</Typography>
              }
              <Typography variant="caption" color="text.secondary">Combined output across all blocks</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Fleet Count (API #2) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, bgcolor: "background.paper", border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Active Fleet</Typography>
                <PrecisionManufacturingIcon color="success" />
              </Stack>
              {loading ? <Skeleton variant="rectangular" height={40} /> : 
                <Typography variant="h3" fontWeight={800}>{siteSummary.totalRobots}</Typography>
              }
              <Typography variant="caption" color="text.secondary">Total deployed cleaning units</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DETAILED LOGS */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
    
        <Divider />
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.4) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Robot Identifier</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Deployment Zone</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Module Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width="70%" /></TableCell>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell align="right"><Skeleton width="40%" sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : Object.keys(robotData).length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 10, color: 'text.disabled' }}>No telemetry data received for this period.</TableCell></TableRow>
            ) : (
              Object.entries(robotData).map(([id, robot]) => (
                <TableRow key={id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{robot.deviceName}</TableCell>
                  <TableCell><Chip label={robot.location} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 500 }} /></TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={800} color="primary.main">{robot.totalPanelsCleaned.toLocaleString()}</Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Report;