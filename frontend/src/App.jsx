import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { FacilityProvider } from './contexts/FacilityContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlateLookup from './pages/PlateLookup';
import Facilities from './pages/Facilities';
import Customers from './pages/Customers';
import Items from './pages/Items';
import ItemGroups from './pages/ItemGroups';
import Zones from './pages/Zones';
import Sections from './pages/Sections';
import Locations from './pages/Locations';
import LocationTypes from './pages/LocationTypes';
import Consignees from './pages/Consignees';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Roles from './pages/Roles';
import AuditLog from './pages/AuditLog';
import ChangePassword from './pages/ChangePassword';
import './App.css';

const Layout = () => {
  return (
    <div className="dashboard-container">
      <Navigation />
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FacilityProvider>
          <ThemeProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/lookup" element={
                    <ProtectedRoute requiredPermission="PLATE_READ">
                      <PlateLookup />
                    </ProtectedRoute>
                  } />
                  <Route path="/facilities" element={
                    <ProtectedRoute requiredPermission="FACILITY_READ">
                      <Facilities />
                    </ProtectedRoute>
                  } />
                  <Route path="/customers" element={
                    <ProtectedRoute requiredPermission="CUSTOMER_READ">
                      <Customers />
                    </ProtectedRoute>
                  } />
                  <Route path="/items" element={
                    <ProtectedRoute requiredPermission="ITEM_READ">
                      <Items />
                    </ProtectedRoute>
                  } />
                  <Route path="/itemgroups" element={
                    <ProtectedRoute requiredPermission="ITEMGROUP_READ">
                      <ItemGroups />
                    </ProtectedRoute>
                  } />
                  <Route path="/zones" element={
                    <ProtectedRoute requiredPermission="ZONE_READ">
                      <Zones />
                    </ProtectedRoute>
                  } />
                  <Route path="/sections" element={
                    <ProtectedRoute requiredPermission="SECTION_READ">
                      <Sections />
                    </ProtectedRoute>
                  } />
                  <Route path="/locations" element={
                    <ProtectedRoute requiredPermission="LOCATION_READ">
                      <Locations />
                    </ProtectedRoute>
                  } />
                  <Route path="/location-types" element={
                    <ProtectedRoute requiredPermission="LOCATION_READ">
                      <LocationTypes />
                    </ProtectedRoute>
                  } />
                  <Route path="/consignees" element={
                    <ProtectedRoute requiredPermission="CONSIGNEE_READ">
                      <Consignees />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/users" element={
                    <ProtectedRoute requiredPermission="USER_READ">
                      <Users />
                    </ProtectedRoute>
                  } />
                  <Route path="/roles" element={
                    <ProtectedRoute requiredPermission="ROLE_READ">
                      <Roles />
                    </ProtectedRoute>
                  } />
                  <Route path="/audit" element={
                    <ProtectedRoute requiredPermission="AUDIT_READ">
                      <AuditLog />
                    </ProtectedRoute>
                  } />
                  <Route path="/change-password" element={<ChangePassword />} />
                </Route>
              </Routes>
            </ToastProvider>
          </ThemeProvider>
        </FacilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
