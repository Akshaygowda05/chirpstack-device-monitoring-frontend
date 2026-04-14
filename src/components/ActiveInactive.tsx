import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { getActiveInactiveCount } from '../services/User.service';

export default function FleetStatusChart() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getActiveInactiveCount();
        const raw = res.data.data.last5day;

        const formatted = raw.map((d: any) => ({
          label: new Date(d.createdAt || d.date).toLocaleDateString('en-US', { weekday: 'short' }),
          active: d.activeCount || 0,
          offline: d.inactiveCount || 0,
        }));

        setData(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) return <CircularProgress size={20} sx={{ m: 2 }} />;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Active and Inactive Status 
      </Typography>
      
      <BarChart
        dataset={data}
        layout="horizontal" 
        height={220} 
        series={[
          { dataKey: 'active', label: 'Active', stack: 'total', color: theme.palette.success.main },
          { dataKey: 'offline', label: 'Offline', stack: 'total', color: theme.palette.action.disabled },
        ]}
        yAxis={[{ 
          scaleType: 'band', 
          dataKey: 'label',
          hideTooltip: true,
          tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary }
        }]}
        xAxis={[{ 
          disableTicks: true, 
          disableLine: true,
          labelStyle: { fontSize: 10 }
        }]}
       
        margin={{ left: 45, right: 10, top: -1, bottom: 30 }}
        skipAnimation={false} // Enables the growing bar animation
      />
    </Box>
  );
}