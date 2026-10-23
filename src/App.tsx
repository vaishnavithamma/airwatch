import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { AQIExplorerPage } from './pages/AQIExplorerPage';
import { PollutantAnalysisPage } from './pages/PollutantAnalysisPage';
import { HealthSafetyPage } from './pages/HealthSafetyPage';
import { CityMapPage } from './pages/CityMapPage';
import { AlertsCentrePage } from './pages/AlertsCentrePage';
import { CleanAirActionsPage } from './pages/CleanAirActionsPage';
import { MethodologyPage } from './pages/MethodologyPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="explorer" element={<AQIExplorerPage />} />
            <Route path="pollutants" element={<PollutantAnalysisPage />} />
            <Route path="health" element={<HealthSafetyPage />} />
            <Route path="map" element={<CityMapPage />} />
            <Route path="alerts" element={<AlertsCentrePage />} />
            <Route path="actions" element={<CleanAirActionsPage />} />
            <Route path="methodology" element={<MethodologyPage />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
