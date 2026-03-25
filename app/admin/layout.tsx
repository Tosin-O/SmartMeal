import AdminDashboardWrapper from '../components/admin/AdminDashboardWrapper';

export const metadata = {
  title: 'Admin Panel | SmartMeal',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDashboardWrapper>
      {children}
    </AdminDashboardWrapper>
  );
}