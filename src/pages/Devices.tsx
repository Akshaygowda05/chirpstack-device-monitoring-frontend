import { useEffect, useState } from "react";
import { fetchdevices } from "../services/User.service";


function Devices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetchdevices(limit, offset);

      setDevices(res.data.result);
    } catch (err) {
      console.error("Error fetching devices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [limit, offset]);

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
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Name</th>
              <th>DevEUI</th>
              <th>Description</th>
              <th>Profile</th>
              <th>Last Seen</th>
              <th>Signal</th>
              <th>Power</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device) => (
              <tr key={device.devEui}>
                <td>{device.name}</td>
                <td>{device.devEui}</td>
                <td>{device.description}</td>
                <td>{device.deviceProfileName}</td>
                <td>{new Date(device.lastSeenAt).toLocaleString()}</td>
                <td>{device.deviceStatus?.margin}</td>
                <td>
                  {device.deviceStatus?.externalPowerSource
                    ? "External"
                    : "Battery"}
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