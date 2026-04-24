import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Search,
  XCircle,
} from 'lucide-react';
import {
  BusinessApplication,
  fetchBusinessApplications,
  getPaymentProofSignedUrl,
  updateBusinessApplicationStatus,
} from '../../data/businesses';
import { useRequireAdmin } from '../../lib/adminAuth';
import { safeHttpUrl } from '../../lib/safeUrl';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

type StatusFilter = 'all' | 'pending' | 'verified' | 'rejected';

export default function AdminApplicationsPage() {
  const { ready } = useRequireAdmin();
  const [apps, setApps] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<BusinessApplication | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const reload = async () => {
    setLoading(true);
    const data = await fetchBusinessApplications();
    setApps(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    reload();
    const channel = supabase
      .channel('admin:applications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'businesses' },
        () => reload()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ready]);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      );
    });
  }, [apps, filter, search]);

  const updateStatus = async (id: string, status: 'verified' | 'rejected') => {
    setBusyId(id);
    setError('');
    try {
      const updated = await updateBusinessApplicationStatus(id, status);
      setApps((prev) => prev.map((a) => (a.id === id ? updated ?? a : a)));
      if (selected?.id === id && updated) setSelected(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  if (!ready) return null;

  const pendingCount = apps.filter((a) => a.status === 'pending').length;
  const verifiedCount = apps.filter((a) => a.status === 'verified').length;

  return (
    <AdminLayout active="applications" pendingCount={pendingCount} businessCount={verifiedCount}>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Business Applications</h1>
            <p className="text-sm text-[#6B7280] mt-1">Review and verify submitted businesses</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 w-48"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Business</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Highlight</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Category</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Location</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Contact</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Description</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Payment</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Submitted</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Status</th>
                  <th className="text-left font-semibold text-[#374151] px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors align-top">
                    <td className="px-6 py-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        {app.logoUrl ? (
                          <img
                            src={app.logoUrl}
                            alt={app.name}
                            className="w-11 h-11 rounded-lg object-contain border border-[#E5E7EB] bg-white"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-[#E8F5E9] rounded-lg flex items-center justify-center text-sm font-bold text-[#2E7D32]">
                            {app.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-[#1F2937]">{app.name}</div>
                          {(() => {
                            const safe = safeHttpUrl(app.googleMapsUrl);
                            return safe ? (
                              <a
                                href={safe}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#6DBE75] hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <ExternalLink size={11} /> Map
                              </a>
                            ) : (
                              <span className="text-xs text-[#9CA3AF]">No map link</span>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {app.imageUrl ? (
                        <img
                          src={app.imageUrl}
                          alt={`${app.name} highlight`}
                          className="w-20 h-14 rounded-lg object-cover border border-[#E5E7EB]"
                        />
                      ) : (
                        <div className="w-20 h-14 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF]">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-2.5 py-1 rounded-full">
                        {app.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[#6B7280]">
                        <MapPin size={14} />
                        <div>
                          <div className="text-sm">{app.city}, {app.country}</div>
                          <div className="text-xs text-[#9CA3AF]">{app.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-[#6B7280]">
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} />
                          <span className="text-xs">{app.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} />
                          <span className="text-xs">{app.email || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[260px]">
                      <p className="text-xs text-[#6B7280] line-clamp-3">
                        {app.description || <span className="italic text-[#9CA3AF]">No description provided</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentProofCell app={app} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[#6B7280]">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF]">
                        {new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(app)}
                          className="text-[#6B7280] hover:text-[#1F2937] px-3 py-1.5 rounded-lg hover:bg-[#F3F4F6] text-xs font-medium transition-colors"
                        >
                          View
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              disabled={busyId === app.id}
                              onClick={() => updateStatus(app.id, 'verified')}
                              className="text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={14} className="inline mr-1" />
                              Verify
                            </button>
                            <button
                              disabled={busyId === app.id}
                              onClick={() => updateStatus(app.id, 'rejected')}
                              className="text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <XCircle size={14} className="inline mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">No applications found</div>
          )}
          {loading && (
            <div className="text-center py-12 text-[#9CA3AF]">Loading…</div>
          )}
        </div>
      </div>

      {selected && (
        <DetailModal
          app={selected}
          busy={busyId === selected.id}
          onClose={() => setSelected(null)}
          onUpdate={updateStatus}
        />
      )}
    </AdminLayout>
  );
}

function DetailModal({
  app,
  busy,
  onClose,
  onUpdate,
}: {
  app: BusinessApplication;
  busy: boolean;
  onClose: () => void;
  onUpdate: (id: string, status: 'verified' | 'rejected') => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1F2937]">{app.name}</h2>
            <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#1F2937]">
              <XCircle size={22} />
            </button>
          </div>
          <p className="text-sm text-[#6B7280] mt-1 break-all">{app.id}</p>
        </div>
        <div className="p-6 space-y-5">
          <DetailRow label="Category" value={app.category} />
          <DetailRow label="Address" value={app.address || '—'} />
          <DetailRow label="City / Country" value={`${app.city || '—'}, ${app.country || '—'}`} />
          <DetailRow label="Phone" value={app.phone || '—'} />
          <DetailRow label="Email" value={app.email || '—'} />
          <DetailRow label="Description" value={app.description || '—'} />
          {app.logoUrl && (
            <ImageBlock label="Business Logo" src={app.logoUrl} aspect="contain" height="h-28 w-28" />
          )}
          {app.imageUrl && (
            <ImageBlock label="Highlight Picture" src={app.imageUrl} aspect="cover" height="h-44 w-full" />
          )}
          <div>
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Google Maps</span>
            {(() => {
              const safe = safeHttpUrl(app.googleMapsUrl);
              return safe ? (
                <a
                  href={safe}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#6DBE75] hover:underline mt-1 text-sm break-all"
                >
                  <ExternalLink size={14} />
                  {safe}
                </a>
              ) : (
                <p className="text-sm text-[#9CA3AF] mt-1">No valid map link</p>
              );
            })()}
          </div>
          <DetailRow label="Coordinates" value={`${app.lat}, ${app.lng}`} />
          <DetailRow label="Submitted" value={new Date(app.submittedAt).toLocaleString()} />
          <DetailRow label="Payment Reference" value={app.paymentReference || '—'} />
          <PaymentProofViewer path={app.paymentProofPath} />

          <div className="pt-4 border-t border-[#E5E7EB]">
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-3">Actions</span>
            <div className="flex gap-3">
              {app.status !== 'verified' && (
                <button
                  disabled={busy}
                  onClick={() => onUpdate(app.id, 'verified')}
                  className="flex-1 bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  <CheckCircle size={16} className="inline mr-1.5" />
                  Verify Business
                </button>
              )}
              {app.status !== 'rejected' && (
                <button
                  disabled={busy}
                  onClick={() => onUpdate(app.id, 'rejected')}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 rounded-xl text-sm transition-colors border border-red-200 disabled:opacity-60"
                >
                  <XCircle size={16} className="inline mr-1.5" />
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageBlock({ label, src, aspect, height }: { label: string; src: string; aspect: 'cover' | 'contain'; height: string }) {
  const safe = safeHttpUrl(src);
  if (!safe) return null;
  return (
    <div>
      <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">{label}</span>
      <img
        src={safe}
        alt={label}
        className={`mt-2 ${height} rounded-xl border border-[#E5E7EB] bg-white object-${aspect}`}
      />
    </div>
  );
}

function PaymentProofCell({ app }: { app: BusinessApplication }) {
  if (!app.paymentProofPath) {
    return <span className="text-xs text-[#9CA3AF]">—</span>;
  }
  return (
    <div className="text-xs text-[#374151]">
      <div className="font-medium">{app.paymentReference || 'Uploaded'}</div>
      <span className="text-[#9CA3AF]">View in detail</span>
    </div>
  );
}

function PaymentProofViewer({ path }: { path?: string }) {
  const [signed, setSigned] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setSigned(null);
      return;
    }
    setLoading(true);
    setErr('');
    getPaymentProofSignedUrl(path, 120)
      .then((url) => {
        if (cancelled) return;
        if (!url) setErr('Could not load payment proof.');
        setSigned(url);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!path) return null;
  return (
    <div>
      <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Payment Proof</span>
      {loading && <p className="text-sm text-[#6B7280] mt-1">Loading…</p>}
      {err && <p className="text-sm text-red-600 mt-1">{err}</p>}
      {signed && /\.pdf(\?|$)/i.test(signed) ? (
        <a
          href={signed}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#6DBE75] hover:underline mt-1 inline-flex items-center gap-1"
        >
          <ExternalLink size={14} /> Open PDF (link expires)
        </a>
      ) : signed ? (
        <img
          src={signed}
          alt="Payment proof"
          className="mt-2 max-h-72 w-full object-contain rounded-xl border border-[#E5E7EB] bg-white"
        />
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-[#FFF8E1] text-[#F57F17]',
    verified: 'bg-[#E8F5E9] text-[#2E7D32]',
    rejected: 'bg-[#FCE4EC] text-[#C62828]',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">{label}</span>
      <p className="text-sm text-[#1F2937] mt-1 font-medium whitespace-pre-wrap">{value}</p>
    </div>
  );
}
