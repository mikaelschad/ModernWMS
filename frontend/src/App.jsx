import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { FacilityProvider } from './contexts/FacilityContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
import Consignees from './pages/Consignees';
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
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/lookup" element={<PlateLookup />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/items" element={<Items />} />
                <Route path="/itemgroups" element={<ItemGroups />} />
                <Route path="/zones" element={<Zones />} />
                <Route path="/sections" element={<Sections />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/consignees" element={<Consignees />} />
                <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
              </Route>
            </Routes>
          </ThemeProvider>
        </FacilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
