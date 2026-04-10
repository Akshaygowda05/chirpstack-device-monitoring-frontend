import  { useEffect, useState } from "react";
import { fetchGroup, multicastDownlink } from "../services/User.service";

type Group = {
  id: string;
  name: string;
  region: string;
  groupType: string;
};

const MulticastControl = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const res = await fetchGroup();
    setGroups(res.data.result);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(g => g !== id)
        : [...prev, id]
    );
  };

  const sendDownlink = async (data: string) => {
    if (selected.length === 0) {
      alert("Select at least one group");
      return;
    }

    await multicastDownlink(selected, data);

    alert("Command sent 🚀");
  };

  return (
    <div>
      <h2>Multicast Groups</h2>

      {groups.map(group => (
        <div key={group.id}>
          <input
            type="checkbox"
            checked={selected.includes(group.id)}
            onChange={() => toggleSelect(group.id)}
          />
          {group.name} ({group.region})
        </div>
      ))}

      <hr />

      <button onClick={() => sendDownlink("Ag==")}>Start</button>
      <button onClick={() => sendDownlink("Aq==")}>Stop</button>
      <button onClick={() => sendDownlink("Aw==")}>Return to Dock</button>
      <button onClick={() => sendDownlink("As==")}>Reboot</button>
    </div>
  );
};

export default MulticastControl;