import styles from "./dashboardLayout.module.css";
import "../globals.css";
import SidebarNavItem from "@/components/sidebar/SidebarNavItem";
import SidebarTrip from "@/components/sidebar/SidebarTripDynamic";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";
import InstallPrompt from "@/components/pwa/InstallPrompt";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <SidebarTrip />
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Travelog</h2>

        <nav className={styles.nav}>
          <SidebarNavItem icon="dashboard" label="Dashboard" href="/" />
          <SidebarNavItem
            icon="calendar_month"
            label="Itinerary"
            href="/itinerary"
          />
          <SidebarNavItem
            icon="account_balance_wallet"
            label="Expenses"
            href="/expenses"
          />
          <SidebarNavItem icon="menu_book" label="Notes" href="/notes" />
          <SidebarNavItem icon="info" label="Trip Details" href="/profile" />
        </nav>
      </aside>

      <main className={styles.main} id="main-content">
        {children}
        <ServiceWorkerRegistrar />
        <InstallPrompt />
      </main>
    </div>
  );
}
