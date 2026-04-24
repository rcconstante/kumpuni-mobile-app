import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Store, Users } from 'lucide-react';
import { fetchBusinessApplications, BusinessApplication } from '../../data/businesses';
import { useRequireAdmin } from '../../lib/adminAuth';
import { AdminLayout } from './AdminLayout';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { ready } = useRequireAdmin();
  const [apps, setApps] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    fetchBusinessApplications().then((data) => {
      if (cancelled) return;
      setApps(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready) return null;

  const pending = apps.filter((a) => a.status === 'pending');
  const verified = apps.filter((a) => a.status === 'verified');
  const rejected = apps.filter((a) => a.status === 'rejected');

  return (
    <AdminLayout active="dashboard" pendingCount={pending.length} businessCount={verified.length}>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1F2937] mb-8">Dashboard Overview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard label="Total Applications" value={loading ? '—' : apps.length} color="bg-[#E8F5E9] text-[#2E7D32]" />
          <StatCard label="Pending Review" value={loading ? '—' : pending.length} color="bg-[#FFF8E1] text-[#F57F17]" />
          <StatCard label="Verified" value={loading ? '—' : verified.length} color="bg-[#E3F2FD] text-[#1565C0]" />
          <StatCard label="Rejected" value={loading ? '—' : rejected.length} color="bg-[#FCE4EC] text-[#C62828]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <button
            onClick={() => navigate('/admin/applications')}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <ClipboardList size={24} className="text-[#F57F17]" />
              <span className="text-sm font-semibold text-[#F57F17] bg-[#FFF8E1] px-2.5 py-1 rounded-full">
                {pending.length} pending
              </span>
            </div>
            <h3 className="font-bold text-[#1F2937] text-lg">Review Applications</h3>
            <p className="text-sm text-[#6B7280] mt-1">Verify or reject new business submissions</p>
          </button>

          <button
            onClick={() => navigate('/admin/businesses')}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <Store size={24} className="text-[#1565C0]" />
              <span className="text-sm font-semibold text-[#1565C0] bg-[#E3F2FD] px-2.5 py-1 rounded-full">
                {verified.length} active
              </span>
            </div>
            <h3 className="font-bold text-[#1F2937] text-lg">Manage Businesses</h3>
            <p className="text-sm text-[#6B7280] mt-1">Edit, update, or remove verified listings</p>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
      <div className={`w-10 h-10 ${color.split(' ')[0]} rounded-xl flex items-center justify-center mb-3`}>
        <Users size={20} className={color.split(' ')[1]} />
      </div>
      <p className="text-3xl font-extrabold text-[#1F2937]">{value}</p>
      <p className="text-sm text-[#6B7280] mt-1">{label}</p>
    </div>
  );
}
