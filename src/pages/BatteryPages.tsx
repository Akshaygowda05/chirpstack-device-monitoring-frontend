import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchGroup,fetchBattery } from "../services/User.service";


type Group = {
  id: string;
  name: string;
};

type Battery = {
  batteryLevel: string | null;
  lastSeen: string;
  name: string;
};

const BatteryPages = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [batteries, setBatteries] = useState<Record<string, Battery>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [defaultGroupId, setDefaultGroupId] = useState<string>("");

  // ✅ Fetch groups
  useEffect(() => {
       fetchGroupsForbatery();
  }, []);

  const fetchGroupsForbatery = async () => {
    const res = await fetchGroup()
    setGroups(res.data.result);

    const firstGroupId = res.data.result[0]?.id || "";
    sessionStorage.setItem("defaultIdForBattry", firstGroupId);
    setDefaultGroupId(firstGroupId);
  };

 
  const fetchBatteries = async (groupId: string) => {
    setLoading(true);
    try {
        sessionStorage.setItem("selectedGroupIdForBattery", groupId);
      const res = await fetchBattery(groupId);
      setBatteries(res.data.batteries);
    } catch (err) {
      console.error(err);
      setBatteries({});
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setSelectedGroup(groupId);
    setDefaultGroupId(groupId)

    if (groupId) {
      fetchBatteries(groupId);
    }
  };

  return (
    <div>
      <h2>Battery Dashboard 🔋</h2>

      {/* ✅ Dropdown */}
      <select value={selectedGroup} onChange={handleChange}>
        <option value="">Select Group</option>
        {groups.map(group => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>

      <hr />

      {/* ✅ Loading */}
      {loading && <p>Loading...</p>}

      {/* ✅ Table */}
      {!loading && selectedGroup && (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>Device EUI</th>
              <th>Name</th>
              <th>Battery</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(batteries).map(([devEui, data]) => (
              <tr key={devEui}>
                <td>{devEui}</td>
                <td>{data.name}</td>
                <td>
                  {data.batteryLevel && data.batteryLevel !== "null"
                    ? `${data.batteryLevel}%`
                    : "N/A"}
                </td>
                <td>{new Date(data.lastSeen).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BatteryPages;