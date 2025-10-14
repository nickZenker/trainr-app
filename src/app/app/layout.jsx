import TopNavTabs from '../../components/TopNavTabs';

export default function AppLayout({ children }) {
  return (
    <>
      <TopNavTabs />
      {children}
    </>
  );
}
