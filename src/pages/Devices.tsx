import { useEffect, useState } from "react";
import { fetchdevices, unicastDownlink } from "../services/User.service";
import { formatDistanceToNow } from "date-fns";
import { Alert, Button, IconButton } from "@mui/materiaimport { } from "react-router-dom";{ Navigate, useNavigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";



function Devices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");



const handleView = (devEui: string) => {
  navigate(`/devices/${devEui}`);
};


  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetchdevices(limit, offset,search);

      setDevices(res.data.result);
    } catch (err) {
      console.error("Error fetching devices", err);
    } finally {
      setLoading(false);
    }
  };

    const sendDownLink = async(data: string,devEui:string) => {
    console.log("Sending down link:", data);
    console.log("ths is the device i an trying to send the data",devEui)
    const result = await unicastDownlink(devEui,data)
    console.log(result.data.id)
    const isSuccess = result?.data?.id;
    {isSuccess ? (
    alert("sent succsfully")
) : (
  alert("not send anything sisya")
)}
       
    
   
  }

  
 

  useEffect(() => {
  const delay = setTimeout(() => {
    fetchDevices();
  }, 500);

  return () => clearTimeout(delay);
}, [limit, offset, search]);

  return (
    <div>
      <h2>Robots </h2>

      {/* Pagination Controls */}
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
          disabled={offset === 0}
        >
          Prev
        </button>

        <button onClick={() => setOffset((prev) => prev + limit)}>
          Next
        </button>
      </div>

      {/* Limit Selector */}
      <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>

      <input
  type="text"
  placeholder="Search by name..."
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setOffset(0); 
  }}
/>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Battery</th>
              <th>Last Seen</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device) => (
              <tr key={device.devEui}>
                <td>
                    {device.name}
                    <p>{device.devEui}</p>
                    </td>
                <td>{device.description || "unknow"}</td>
                <td>{device.batteryVoltage}</td>
                <td>{formatDistanceToNow(new Date(device.lastSeenAt))}</td>

                <td>{device.isActive}</td>
                <td>
                 <Button
                  variant="outlined"
                  onClick={() =>sendDownLink("Ag==",device.devEui)}
                 
                 >Start</Button> 
                  <Button 
                  variant="outlined"
                  onClick={() =>sendDownLink("Aw==",device.devEui)}
                  >Stop</Button>
                  <Button 
                  variant="outlined"
                  onClick={() =>sendDownLink("Ae==",device.devEui)}>Return</Button>
                  <Button 
                  variant="outlined"
                  onClick={() =>sendDownLink("Ac==",device.devEui)}
                  >Reboot</Button>
                  <Button variant="outlined"
                  Onclick
                  >View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Devices;