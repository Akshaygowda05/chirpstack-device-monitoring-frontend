import { useRecoilValue } from "recoil";
import { authState } from "../store/authState";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const user = useRecoilValue(authState);
  const { pathname } = useLocation();

  if (!user) return null;

  return (
    <div style={{
      position: "fixed",
      top: 50,
      left: 0,
      height: "100vh",
      width: "200px",
      background: "#f7f9fb",
      borderRight: "1px solid #e4eaf0",
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
    }}>

      {/* USER NAV */}
      {user.role === "USER" && (
        <nav style={{ display: "flex", flexDirection: "column", padding: "10px 0" }}>
          <NavItem to="/dashboard" label="DASHBOARD" pathname={pathname} />
          <NavItem to="/devices" label="DEVICES" pathname={pathname} />
        </nav>
      )}

      {/* ADMIN NAV */}
      {user.role === "ADMIN" && (
        <nav style={{ display: "flex", flexDirection: "column", padding: "10px 0" }}>
          <NavItem to="/admin" label="ADMIN PANEL" pathname={pathname} />
          <NavItem to="/users" label="USERS" pathname={pathname} />
        </nav>
      )}

    </div>
  );
}

function NavItem({ to, label, pathname }: { to: string; label: string; pathname: string }) {
  const active = pathname === to;

  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "12px 20px",
        background: active ? "#e8f5f2" : "transparent",
        cursor: "pointer",
      }}>
        {active && (
          <div style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: "3px",
            background: "#2ec4a0",
            borderRadius: "0 2px 2px 0",
          }} />
        )}
        <span style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "1px",
          color: active ? "#1a4a5c" : "#7a9aaa",
        }}>
          {label}
        </span>
      </div>
    </Link>
  );
}

export default Sidebar;