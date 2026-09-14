import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProjectListPage from './pages/proyectos/ProjectListPage';
import ProjectDetailPage from './pages/proyectos/ProjectDetailPage';
import ProjectCreatePage from './pages/proyectos/ProjectCreatePage';
import ProjectEditPage from './pages/proyectos/ProjectEditPage';
import MarcoLogicoPage from './pages/planificacion/MarcoLogicoPage';
import WBSPage from './pages/planificacion/WBSPage';
import CronogramaPage from './pages/planificacion/CronogramaPage';
import PresupuestoPage from './pages/planificacion/PresupuestoPage';
import RiesgosPage from './pages/planificacion/RiesgosPage';
import RecursosPage from './pages/planificacion/RecursosPage';
import EjecucionPage from './pages/ejecucion/EjecucionPage';
import MonitoreoPage from './pages/monitoreo/MonitoreoPage';
import CierrePage from './pages/cierre/CierrePage';
import EvaluacionPage from './pages/evaluacion/EvaluacionPage';
import PortafolioPage from './pages/portafolio/PortafolioPage';
import AdminPage from './pages/config/AdminPage';
import InicioPage from './pages/inicio/InicioPage';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="proyectos" element={<ProjectListPage />} />
                <Route path="proyectos/nuevo" element={<ProjectCreatePage />} />
                <Route path="proyectos/:id/editar" element={<ProjectEditPage />} />
                <Route path="proyectos/:id" element={<ProjectDetailPage />} />
                <Route path="proyectos/:id/planificacion/marco-logico" element={<MarcoLogicoPage />} />
                <Route path="proyectos/:id/planificacion/wbs" element={<WBSPage />} />
                <Route path="proyectos/:id/planificacion/cronograma" element={<CronogramaPage />} />
                <Route path="proyectos/:id/planificacion/presupuesto" element={<PresupuestoPage />} />
                <Route path="proyectos/:id/planificacion/riesgos" element={<RiesgosPage />} />
                <Route path="proyectos/:id/planificacion/recursos" element={<RecursosPage />} />
                <Route path="proyectos/:id/ejecucion" element={<EjecucionPage />} />
                <Route path="proyectos/:id/monitoreo" element={<MonitoreoPage />} />
                <Route path="proyectos/:id/cierre" element={<CierrePage />} />
                <Route path="proyectos/:id/evaluacion" element={<EvaluacionPage />} />
                <Route path="proyectos/:id/inicio" element={<InicioPage />} />
                <Route path="portafolio" element={<PortafolioPage />} />
                <Route path="reportes" element={<div>Reportes</div>} />
                <Route path="config" element={<AdminPage />} />
                <Route path="config/usuarios" element={<AdminPage />} />
                <Route path="config/areas" element={<AdminPage />} />
                <Route path="config/catalogos" element={<AdminPage />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
