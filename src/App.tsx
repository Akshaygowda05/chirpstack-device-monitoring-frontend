import { BrowserRouter, Routes,Route } from "react-router-dom";
import  Login from "./pages/Login";
import  ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashBoard";
import { useAuthInit } from "./hooks/useAuthInit";
import MainLayout from "./components/MainLayout";
import Users from "./pages/Users";
import CreateUser from "./pages/CreateUser";
import Devices from "./pages/Devices";
import MulticastGroup from "./pages/MulticastGorup";
import BatteryPages from "./pages/BatteryPages";
import Logs from "./pages/Logs";
import { useSocketInit } from "./hooks/useSocketInit";


function App() {

  useAuthInit(); //now i dont want to login everyrime
  useSocketInit();
  return (
   <BrowserRouter>
   <Routes>
    {/* public route */}
    <Route path="/" element={<Login />} />

    {/* protected routes */}

    <Route
    path="/dashboard"
    element={
      <ProtectedRoute allowedRoles={["USER"]}>
        <MainLayout>
        <Dashboard />
        </MainLayout>
      </ProtectedRoute>
    }/>

    <Route
    path="/multicast-groups"
    element={
      <ProtectedRoute allowedRoles={["USER"]}>
        <MainLayout>
        <MulticastGroup />
        </MainLayout>
      </ProtectedRoute>
    }/>

     <Route
    path="/logs"
    element={
      <ProtectedRoute allowedRoles={["USER"]}>
        <MainLayout>
        <Logs />
        </MainLayout>
      </ProtectedRoute>
    }/>



     <Route
    path="/Robotsbatteies"
    element={
      <ProtectedRoute allowedRoles={["USER"]}>
        <MainLayout>
        <BatteryPages />
        </MainLayout>
      </ProtectedRoute>
    }/>





       <Route
    path="/devices"
    element={
      <ProtectedRoute allowedRoles={["USER"]}>
        <MainLayout>
       <Devices />
        </MainLayout>
      </ProtectedRoute>
    }/>

    <Route
    path = '/admin'
    element={
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <MainLayout>
        <AdminDashboard />
        </MainLayout>
      </ProtectedRoute>
    }
/>

<Route 
path="/users"
element = {
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <MainLayout>
    <Users />
    </MainLayout>
  </ProtectedRoute>
}
/>

<Route 
path="/users/create"
element = {
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <MainLayout>
    <CreateUser />
    </MainLayout>
  </ProtectedRoute>
}
/>

    
    </Routes>
    </BrowserRouter>
  );
}

export default App;