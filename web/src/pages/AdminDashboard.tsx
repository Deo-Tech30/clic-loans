import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import AdminOverview from './admin/Overview';
import AdminMarkets from './admin/Markets';
import AdminAgents from './admin/Agents';
import AdminUsers from './admin/Users';
import AdminLoans from './admin/Loans';
import AdminReports from './admin/Reports';
import AdminRepayments from './admin/Repayments';
import AdminLoanManagement from './admin/LoanManagement';
import AdminSettings from './admin/Settings';
import AdminAuditLogs from './admin/AuditLogs';
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  let content;

  if (location.pathname === '/admin/markets') {
    content = <AdminMarkets />;
  } else if (location.pathname === '/admin/agents') {
    content = <AdminAgents />;
  } else if (location.pathname === '/admin/users') {
    content = <AdminUsers />;
  } else if (location.pathname === '/admin/loans') {
    content = <AdminLoans />;
  } else if (location.pathname === '/admin/reports') {
    content = <AdminReports />;
  } else if (location.pathname === '/admin/repayments') {
    content = <AdminRepayments />;
  } else if (location.pathname === '/admin/loan-management') {
    content = <AdminLoanManagement />;
 } else if (location.pathname === '/admin/audit-logs') {
    content = <AdminAuditLogs />;

  } else if (location.pathname === '/admin/settings') {
    content = <AdminSettings />;
  } else {
    content = <AdminOverview />;
  }

  return (
    <Layout role="admin" onLogout={onLogout}>
      {content}
    </Layout>
  );
}