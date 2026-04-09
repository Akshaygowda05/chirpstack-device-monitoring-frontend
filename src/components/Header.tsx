import { useRecoilValue, useResetRecoilState } from "recoil";
import { authState } from "../store/authState";
import log from "../assets/Aegeus-Technologies-logo.png";
import { FiLogOut } from "react-icons/fi";

function Header() {
  const user = useRecoilValue(authState);
  const resetAuth = useResetRecoilState(authState);

  const logout = () => {
    localStorage.removeItem("token");
    resetAuth();
    window.location.href = "/";
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99,
      background: "#ffffff",
      padding: "8px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e5e7eb",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src={log} alt="Logo" style={{ height: "35px" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span style={{ color: "#374151", fontWeight: 500 }}>
          Welcome, {user?.name}
        </span>

        <FiLogOut
          onClick={logout}
          title="Logout"
          style={{ cursor: "pointer", fontSize: "20px", color: "#6b7280", transition: "0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
        />
      </div>
    </div>
  );
}

export default Header;