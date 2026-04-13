import { useAuthInit } from "../hooks/useAuthInit";
import { useEffect, useState } from "react";
import { fetchDevicesV1, getHomePannelsCleandata } from "../services/User.service";
import { Box, Skeleton } from "@mui/material";

function Dashboard() {

  const user  = useAuthInit();
  const [devicesCount, setDevicesCount] = useState(0);
  const[activeDevices, setActiveDevices] = useState([]);
  const[inactiveDevices, setInactiveDevices] = useState([]);
  const [multicastGroupsCount, setMulticastGroupsCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);
  const  [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pannelsCleaned , setPannelsCleaned] = useState([]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await fetchDevicesV1();
      const devices = res.data || [];
      setDevicesCount(devices.totalCount || 0);
      setActiveDevices(devices.onlineDevices);
      setInactiveDevices(devices.offlineDevices);
      setActiveCount(devices.onlineCount);
      setInactiveCount(devices.offlineCount);


    } catch (error) {
      setError("Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  }

  const fetchPannelsCleanedData = async () => {
    try {
      const res = await getHomePannelsCleandata();
      setPannelsCleaned(res.data.data || []);
    } catch (error) {
      setError("Failed to fetch pannels cleaned data");
    }
  }


  useEffect(() => {
    if (user!) {
      fetchDevices();
      fetchPannelsCleanedData();
    }
  }, [user])


  return (
  <>
  <div>
<Box>
  <h3>Total Device</h3>
  <p>{devicesCount}</p>
</Box>
<Box>
  <h3>Active Devices</h3>
  <p>{activeCount}</p>
  <Skeleton variant="circular" width={40} height={40} />
</Box>
<Box>
  <h3>Inactive Devices</h3>
  <p>{inactiveCount}</p>
  <Skeleton variant="circular" width={40} height={40} />
</Box>

  </div>

  <div>

  </div>



  

</>
);
}

export default Dashboard;