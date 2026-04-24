import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  Store,
} from 'lucide-react';
import { useAdminAuth } from '../../lib/adminAuth';

interface AdminLayoutProps {
  active: 'dashboard' | 'applications' | 'businesses' | 'settings';
  pendingCount?: number;
  businessCount?: number;
  children: ReactNode;
}

export function AdminLayout({ active, pendingCount, businessCount, children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { signOut, user } = useAdminAuth();

  const logout = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex">
      <aside className="w-64 bg-white border-r border-[#E5E7EB] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Kumpuni" className="w-9 h-9 rounded-lg" />
            <span className="font-bold text-[#1F2937]">Kumpuni Admin</span>
          </div>
          {user?.email && (
            <p className="text-xs text-[#9CA3AF] mt-2 truncate">{user.email}</p>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={active === 'dashboard'}
            onClick={() => navigate('/admin/dashboard')}
          />
          <SidebarItem
            icon={ClipboardList}
            label="Applications"
            active={active === 'applications'}
            count={pendingCount}
            onClick={() => navigate('/admin/applications')}
          />
          <SidebarItem
            icon={Store}
            label="Businesses"
            active={active === 'businesses'}
            count={businessCount}
            onClick={() => navigate('/admin/businesses')}
          />
          <SidebarItem
            icon={SettingsIcon}
            label="Settings"
            active={active === 'settings'}
            onClick={() => navigate('/admin/settings')}
          />
        </nav>
        <div className="p-4 border-t border-[#E5E7EB]">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <div className="md:hidden bg-white border-b border-[#E5E7EB] p-4 flex items-center justify-between">
          <span className="font-bold text-[#1F2937] capitalize">{active}</span>
          <button onClick={logout} className="text-[#6B7280]">
            <LogOut size={20} />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}

interface SidebarItemProps {
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
  count?: number;
  onClick: () => void;
}

function SidebarItem({ icon: Icon, label, active, count, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-[#6DBE75]/10 text-[#6DBE75]'
          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        {label}
      </div>
      {count !== undefined && count > 0 && (
        <span className="bg-[#6DBE75] text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}
