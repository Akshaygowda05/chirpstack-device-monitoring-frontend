import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box, Typography, Card, CardContent, Grid, MenuItem, Select,
  FormControl, InputLabel, TextField, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Stack, alpha, useTheme, Divider
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
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
  const [error, setError] = useState<string | null>(null);

  const [robotData, setRobotData] = useState<Record<string, RobotReport>>({});
  const [groupTotal, setGroupTotal] = useState(0); // Specific Block Total
  const [summary, setSummary] = useState({ totalRobots: 0 });

  const fetchReportData = useCallback(async (groupId: string, start: string, end: string) => {
    if (!groupId || !start) return;

    setLoading(true);
    setError(null);

    try {
      const reportRes = await fetchReports(groupId, start, end);
      const rawData = reportRes.data;
      
      const robots: Record<string, RobotReport> = {};
      let totalFromReport = 0;

      // Extract the block total AND the robot list separately
      Object.entries(rawData).forEach(([key, value]) => {
        if (key === "totalPanelsCleaned") {
          totalFromReport = value as number;
        } else {
          robots[key] = value as RobotReport;
        }
      });

      setRobotData(robots);
      setGroupTotal(totalFromReport); // Saving that specific "totalPanelsCleaned" from JSON
      setSummary({
        totalRobots: Object.keys(robots).length,
      });

    } catch (err: any) {
      console.error("❌ Report fetch failed:", err);
      setError(err?.message || "Failed to fetch report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchMulticastGroups();
        const groupList = res.data.result || [];
        setGroups(groupList);

        const storedGroupId = sessionStorage.getItem("selectedGroupIdForReport");
        const initialId = storedGroupId || groupList[0]?.id;

        if (initialId) {
          setSelectedGroup(initialId);
          fetchReportData(initialId, getToday(), getToday());
        }
      } catch (err) {
        setError("Failed to load groups. Please refresh.");
      }
    };
    init();
  }, [fetchReportData]);

  const handleGenerate = () => {
    if (!selectedGroup) return setError("Please select a group.");
    sessionStorage.setItem("selectedGroupIdForReport", selectedGroup);
    fetchReportData(selectedGroup, startDate, endDate);
  };

  const handleDownload = () => {
    const rows = [
      ["Robot Name", "Location", "Panels Cleaned"],
      ...Object.values(robotData).map(r => [r.deviceName, r.location, r.totalPanelsCleaned]),
      ["", "GROUP TOTAL", groupTotal],
      ["Date Range", `${startDate} to ${endDate}`]
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Report-${startDate}.csv`;
    a.click();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", margin: "0 auto" }}>
      {/* HEADER SECTION */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Cleaning Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitoring robot performance and panel efficiency
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={Object.keys(robotData).length === 0}
          sx={{ borderRadius: 2, textTransform: "none", px: 3, display: { xs: 'none', sm: 'flex' } }}
        >
          Export CSV
        </Button>
      </Stack>

      {/* FILTER CARD */}
      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Target Group</InputLabel>
                <Select
                  value={selectedGroup}
                  label="Target Group"
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2.5}>
              <TextField
                fullWidth size="small" type="date" label="Start"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={2.5}>
              <TextField
                fullWidth size="small" type="date" label="End"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button 
                  fullWidth variant="contained" 
                  onClick={handleGenerate} 
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Generate"}
                </Button>
                <Button 
                   variant="outlined" color="inherit" 
                   onClick={() => { setRobotData({}); setGroupTotal(0); }}
                   sx={{ borderRadius: 2 }}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
          {error && <Typography color="error" variant="caption" mt={1} display="block"> {error}</Typography>}
        </CardContent>
      </Card>

      {/* SUMMARY CARDS */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 2, display: 'flex' }}>
                  <CleaningServicesIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total Panels Cleaned</Typography>
                  <Typography variant="h4" fontWeight={800}>{groupTotal.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.success.main, 0.02) }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ bgcolor: 'success.main', p: 1, borderRadius: 2, display: 'flex' }}>
                  <PrecisionManufacturingIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Active Robots</Typography>
                  <Typography variant="h4" fontWeight={800}>{summary.totalRobots}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DATA TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.03)", border: '1px solid', borderColor: 'divider' }}>
        <Divider />
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.7) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Robot Identifier</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Deployment Location</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Panels Cleaned</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
            ) : Object.keys(robotData).length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8, color: 'text.disabled' }}>No records found for this period.</TableCell></TableRow>
            ) : (
              Object.entries(robotData).map(([id, robot]) => (
                <TableRow key={id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{robot.deviceName}</TableCell>
                  <TableCell color="text.secondary">{robot.location}</TableCell>
                  <TableCell align="right">
                    <Box component="span" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 700, color: 'primary.dark' }}>
                      {robot.totalPanelsCleaned.toLocaleString()}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile Download Button */}
      <Button
          fullWidth
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={Object.keys(robotData).length === 0}
          sx={{ mt: 2, borderRadius: 2, display: { xs: 'flex', sm: 'none' } }}
        >
          Download CSV Report
        </Button>
    </Box>
  );
}

export default Report;