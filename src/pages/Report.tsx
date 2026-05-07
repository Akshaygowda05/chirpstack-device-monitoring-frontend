import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box, Typography, Card, CardContent, Grid, MenuItem, Select,
  FormControl, InputLabel, TextField, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, alpha, useTheme
} from "@mui/material";
import { fetchMulticastGroups, fetchReports, fetchSummary } from "../services/User.service";

const getToday = () => new Date().toISOString().split("T")[0];

interface Group { id: string; name: string; }
interface RobotReport { deviceName: string; totalPanelsCleaned: number; location: string; }

function Report() {
  const theme = useTheme();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [loading, setLoading] = useState(false);
  
  const [robotData, setRobotData] = useState<Record<string, RobotReport>>({});
  const [summary, setSummary] = useState({ totalPanelsCleaned: 0, totalRobots: 0 });

  // 1. Core Fetch Function
  const fetchReportData = useCallback(async (groupId: string, start: string, end: string) => {
    if (!groupId || !start) return;
    
    setLoading(true);
    console.log("Fetching for:", { groupId, start, end });

    try {
      const [reportRes, summaryRes] = await Promise.all([
        fetchReports(groupId, start, end),
        fetchSummary(start, end)
      ]);



      
      const rawData = reportRes.data; 
      console.log("Raw Report API Response:", rawData);

      const robots: Record<string, RobotReport> = {};
      let totalFromReport = 0;

      // Iterate through the object keys
      Object.entries(rawData).forEach(([key, value]) => {
        if (key === "totalPanelsCleaned") {
          totalFromReport = value as number;
        } else {
          // It's a robot object (like "ac1f0...")
          robots[key] = value as RobotReport;
        }
      });

      setRobotData(robots);

      // Handle Summary API response
      const sData = summaryRes.data?.totalRobots || {};
      setSummary({
        // Use the total from your specific report JSON if summary API is empty
        totalPanelsCleaned: sData.totalPanelsCleaned || totalFromReport || 0,
        totalRobots: sData.totalRobots || Object.keys(robots).length,
      });

    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);


  const fetchReportDataRef = useRef(fetchReportData);
    useEffect(() => {
        fetchReportDataRef.current = fetchReportData;
    }, [fetchReportData]);

  // 2. Load Groups and Auto-Fetch on Refresh
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchMulticastGroups();
        const groupList = res.data.result || [];
        setGroups(groupList);

        // Check if user had a group selected before refresh
        const storedGroupId = sessionStorage.getItem("selectedGroupIdForReport");
        if (storedGroupId) {
          setSelectedGroup(storedGroupId);
          // Trigger the fetch automatically
          fetchReportData(storedGroupId, getToday(), getToday());
        }
      } catch (err) {
        console.error("Init Error:", err);
      }
    };
    init();
  }, [fetchReportData]);

  const handleGenerate = () => {
    // Save selection so it persists on refresh
    sessionStorage.setItem("selectedGroupIdForReport", selectedGroup);
    fetchReportData(selectedGroup, startDate, endDate);
  };

  const handleClear = () => {
    const today = getToday();
    setStartDate(today);
    setEndDate(today);
    setSelectedGroup("");
    setRobotData({});
    setSummary({ totalPanelsCleaned: 0, totalRobots: 0 });
    sessionStorage.removeItem("selectedGroupIdForReport");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight={800} mb={4}>Robot Cleaning Report</Typography>

      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Group</InputLabel>
              <Select
                value={selectedGroup}
                label="Select Group"
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField
              fullWidth size="small" type="date" label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <TextField
              fullWidth size="small" type="date" label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <Button variant="contained" onClick={handleGenerate} disabled={loading} sx={{ px: 4 }}>
              {loading ? <CircularProgress size={24} /> : "Generate"}
            </Button>
            <Button variant="outlined" onClick={handleClear}>Clear</Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), textAlign: 'center' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Panels Cleaned</Typography>
              <Typography variant="h3" fontWeight={800}>{summary.totalPanelsCleaned.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.05), textAlign: 'center' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Robots Active</Typography>
              <Typography variant="h3" fontWeight={800}>{summary.totalRobots}</Typography>
            </CardContent>
          
          </Card>

            <button>
            download Block report
            </button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
            <TableRow>
              <TableCell><strong>Robot Name</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell align="right"><strong>Panels Cleaned</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(robotData).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>No data available</TableCell>
              </TableRow>
            ) : (
              Object.entries(robotData).map(([id, robot]) => (
                <TableRow key={id}>
                  <TableCell>{robot.deviceName}</TableCell>
                  <TableCell>{robot.location}</TableCell>
                  <TableCell align="right">{robot.totalPanelsCleaned.toLocaleString()}</TableCell>
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