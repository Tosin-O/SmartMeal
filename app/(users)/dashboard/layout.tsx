import DashboardWrapper from '../components/DashboardWrapper';

export const metadata = {
  title: 'Dashboard | SmartMeal',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  );
}