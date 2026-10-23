import { Building2, ChevronRight, ExternalLink, Folder, LayoutDashboard, Leaf, PackageCheck, PackageSearch, Truck } from "lucide-react";
import { hotelPartners } from "../data/mockData";
import type { User } from "../types";

export type SidebarWorkspace = "overview" | "catalog" | "deliveries" | string;

interface SidebarProps {
  user: User;
  workspace: SidebarWorkspace;
  pendingCount: number;
  mobileOpen: boolean;
  onNavigate: (workspace: SidebarWorkspace) => void;
  onSignOut: () => void;
}

export function Sidebar({ user, workspace, pendingCount, mobileOpen, onNavigate, onSignOut }: SidebarProps) {
  const isSeller = user.role === "SELLER";
  const activeHotel = hotelPartners.find((hotel) => hotel.id === user.hotelId);

  return (
    <aside className={`sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}>
      <button className="brand sidebar-brand" type="button" onClick={onSignOut} aria-label="Sign out of StokVault">
        <span className="brand-mark"><Leaf aria-hidden="true" size={20} strokeWidth={2.3} /></span>
        <span className="brand-word">Stok<span>Vault</span><small>VERIFIABLE STOCK LEDGER</small></span>
      </button>
      <p className="sidebar-tagline">Stock clarity, invoice certainty.</p>

      <div className="workspace-switcher">
        <span className="workspace-monogram"><Building2 aria-hidden="true" size={17} /></span>
        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{isSeller ? "CV. Alam Zempol" : activeHotel?.name}</span><span className="mt-0.5 block text-xs text-stone-500">{isSeller ? "Supplier workspace" : "Private hotel workspace"}</span></span>
      </div>

      {isSeller ? (
        <>
          <p className="nav-caption">OVERVIEW &amp; HOME</p>
          <nav className="main-nav" aria-label="Supplier workspace">
            <button className={`nav-link ${workspace === "overview" ? "nav-link-active" : ""}`} type="button" onClick={() => onNavigate("overview")} aria-current={workspace === "overview" ? "page" : undefined}>
              <LayoutDashboard aria-hidden="true" size={18} /><span>Overview</span>{pendingCount > 0 && <span className="nav-count" aria-label={`${pendingCount} pending`}>{pendingCount}</span>}
            </button>
            <button className={`nav-link ${workspace === "catalog" ? "nav-link-active" : ""}`} type="button" onClick={() => onNavigate("catalog")} aria-current={workspace === "catalog" ? "page" : undefined}><PackageSearch aria-hidden="true" size={18} /><span>Master catalog</span></button>
            <button className={`nav-link ${workspace === "deliveries" ? "nav-link-active" : ""}`} type="button" onClick={() => onNavigate("deliveries")} aria-current={workspace === "deliveries" ? "page" : undefined}><Truck aria-hidden="true" size={18} /><span>Delivery tracker</span></button>
            <button className={`nav-link ${workspace === "locked-stock" ? "nav-link-active" : ""}`} type="button" onClick={() => onNavigate("locked-stock")} aria-current={workspace === "locked-stock" ? "page" : undefined}><PackageCheck aria-hidden="true" size={18} /><span>Locked Stock</span></button>
          </nav>
          <p className="nav-caption sidebar-partners-caption">HOTEL WORKSPACES / PARTNERS</p>
          <nav className="main-nav" aria-label="Hotel partner workspaces">
            {hotelPartners.map((hotel) => (
              <div key={hotel.id} className="flex items-center gap-1">
                <button className={`nav-link partner-nav-link flex-1 ${workspace === hotel.id ? "nav-link-active" : ""}`} type="button" onClick={() => onNavigate(hotel.id)} aria-current={workspace === hotel.id ? "page" : undefined}>
                  <Folder aria-hidden="true" size={17} /><span className="flex-1 truncate">{hotel.name}</span><ChevronRight aria-hidden="true" className="partner-chevron" size={13} />
                </button>
                <a href={`/hotel/${hotel.id}`} className="p-1.5 text-stone-400 hover:text-emerald-800 transition-colors" title={`Buka dynamic route /hotel/${hotel.id}`} aria-label={`Buka dynamic route untuk ${hotel.name}`}>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </div>
            ))}
          </nav>
        </>
      ) : (
        <>
          <p className="nav-caption">HOTEL WORKSPACE</p>
          <nav className="main-nav" aria-label="Hotel workspace">
            <button className="nav-link nav-link-active" type="button" onClick={() => onNavigate("overview")} aria-current="page"><LayoutDashboard aria-hidden="true" size={18} /><span>My dashboard</span></button>
            {activeHotel && (
              <a href={`/hotel/${activeHotel.id}`} className="nav-link" title={`Buka dynamic route /hotel/${activeHotel.id}`}>
                <ExternalLink aria-hidden="true" size={16} /><span>Public partner page</span>
              </a>
            )}
          </nav>
        </>
      )}

      <div className="sidebar-spacer" />
      <div className="ledger-health">
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-900"><span className="ledger-health-check">✓</span> Ledger protected</div>
        <p className="mt-2 text-xs leading-5 text-stone-500">{isSeller ? "Track partner sign-offs and invoices across your hotel network." : "Your hotel stock and invoices are private to this account."}</p>
        <div className="health-rule"><span /></div>
        <p className="mt-2 font-mono text-[10px] text-stone-500">SHA-256 · ACTIVE</p>
      </div>
      <div className="profile-button">
        <span className="avatar">{user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
        <span className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-semibold">{user.name}</span><span className="mt-0.5 block truncate text-xs text-stone-500">{user.email}</span></span>
      </div>
    </aside>
  );
}
