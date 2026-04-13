import { useEffect, useState } from "react";
import { fetchGroup, multicastDownlink } from "../services/User.service";
import { 
  Box, Typography, Button, Checkbox, Paper, 
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Stack 
} from "@mui/material";

const MulticastControl = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const res = await fetchGroup();
    setGroups(res.data.result || []);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const sendDownlink = async (data: string) => {
    if (selected.length === 0) return alert("Select at least one group");

    try {
      await multicastDownlink(selected, data);
      alert("Command sent 🚀");
      // ✅ Automatically deselect all groups after sending
      setSelected([]); 
    } catch (err) {
      alert("Error sending command");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        Multicast Groups
      </Typography>

      {/* ✅ List of Groups */}
      <Paper variant="outlined" sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
        <List sx={{ bgcolor: 'background.paper' }}>
          {groups.map((group) => (
            <ListItem key={group.id} disablePadding divider>
              <ListItemButton onClick={() => toggleSelect(group.id)}>
                <ListItemIcon>
                  <Checkbox checked={selected.includes(group.id)} disableRipple />
                </ListItemIcon>
                <ListItemText 
                  primary={group.name} 
                  secondary={group.region} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* ✅ 4 Command Buttons Below */}
      <Stack spacing={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Button variant="contained" color="success" onClick={() => sendDownlink("Ag==")}>
            Start
          </Button>
          <Button variant="contained" color="error" onClick={() => sendDownlink("Aq==")}>
            Stop
          </Button>
          <Button variant="outlined" onClick={() => sendDownlink("Aw==")}>
            Return
          </Button>
          <Button variant="outlined" color="warning" onClick={() => sendDownlink("As==")}>
            Reboot
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default MulticastControl;