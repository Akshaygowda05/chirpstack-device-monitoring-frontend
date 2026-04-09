import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { authState } from "../store/authState";
import {jwtDecode} from "jwt-decode"; 

interface TokenPayload {
  userId: number;
  role: "USER" | "ADMIN" | undefined ;
  applicationId: string | undefined;
  name?: string | undefined;
  iat: number;
  exp: number;
}

export const useAuthInit = () => {
  const setAuth = useSetRecoilState(authState);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuth({ initialized: true, name: "User", role: undefined, token: undefined });
      return;
    }

    try {
      const decoded: TokenPayload = jwtDecode(token);

      setAuth({
        token,
        role: decoded.role,
        name: decoded.name || "User",
        initialized: true,
      });
    } catch (error) {
      console.error("Invalid token");
      localStorage.removeItem("token");
      setAuth({ initialized: true, name: "User", role: undefined, token: undefined });
    }
  }, []);
};