import { ChangeEvent, useEffect, useState } from 'react';
import {
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  BusinessApplication,
  deleteBusinessListing,
  fetchVerifiedBusinesses,
  updateBusinessListing,
  uploadAdminImage,
} from '../../data/businesses';
import { useRequireAdmin } from '../../lib/adminAuth';
import { safeHttpUrl, safeImageUrl } from '../../lib/safeUrl';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

const CATEGORIES: BusinessApplication['category'][] = [
  'Home',
  'Plumbing',
  'Electronics',
  'Car',
  'Appliances',
  'HVAC',
];

export default function AdminBusinessesPage() {
  const { ready } = useRequireAdmin();
  const [businesses, setBusinesses] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<BusinessApplication | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'logoUrl' | 'imageUrl' | null>(null);

  const reload = async () => {
    setLoading(true);
    const data = await fetchVerifiedBusinesses();
    setBusinesses(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    reload();
    const channel = supabase
      .channel('admin:businesses')
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

  if (!ready) return null;

  const filtered = businesses.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.country.toLowerCase().includes(q)
    );
  });

  const saveBusiness = async (updated: BusinessApplication) => {
    setSaving(true);
    setError('');
    try {
      await updateBusinessListing(updated.id, updated);
      await reload();
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const removeBusiness = async (id: string) => {
    if (!window.confirm('Delete this business? This cannot be undone.')) return;
    setError('');
    try {
      await deleteBusinessListing(id);
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const onImageUpload = async (
    field: 'logoUrl' | 'imageUrl',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (!editing) return;
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingField(field);
    setError('');
    try {
      const url = await uploadAdminImage(file, field === 'logoUrl' ? 'logo' : 'highlight');
      setEditing({ ...editing, [field]: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <AdminLayout active="businesses" businessCount={businesses.length}>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Verified Businesses</h1>
            <p className="text-sm text-[#6B7280] mt-1">Manage active business listings</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search businesses..."
                className="pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 w-48"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((biz) => (
            <article
              key={biz.id}
              className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {(() => {
                const safeImg = safeImageUrl(biz.imageUrl);
                return safeImg ? (
                  <img
                    src={safeImg}
                    alt={`${biz.name} highlight`}
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div className="w-full h-36 bg-[#F3F4F6] flex items-center justify-center text-xs text-[#9CA3AF]">
                    No highlight picture
                  </div>
                );
              })()}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  {(() => {
                    const safeLogo = safeImageUrl(biz.logoUrl);
                    return safeLogo ? (
                      <img
                        src={safeLogo}
                        alt={biz.name}
                        className="w-12 h-12 rounded-xl object-contain border border-[#E5E7EB] bg-white -mt-10 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-lg font-bold text-[#2E7D32] -mt-10 shadow-sm">
                        {biz.name[0]}
                      </div>
                    );
                  })()}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEditing(biz)}
                      className="p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => removeBusiness(biz.id)}
                      className="p-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-[#1F2937] mb-1">{biz.name}</h3>
                <span className="inline-block bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-2.5 py-1 rounded-full mb-3 self-start">
                  {biz.category}
                </span>

                {biz.description && (
                  <p className="text-xs text-[#6B7280] line-clamp-2 mb-3">{biz.description}</p>
                )}

                <div className="space-y-1.5 text-sm text-[#6B7280] mt-auto">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span className="truncate">{biz.city}, {biz.country}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    <span className="truncate">{biz.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    <span className="truncate">{biz.email || '—'}</span>
                  </div>
                </div>

                {(() => {
                  const safe = safeHttpUrl(biz.googleMapsUrl);
                  return safe ? (
                    <a
                      href={safe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#6DBE75] hover:underline text-sm mt-3 font-medium"
                    >
                      <ExternalLink size={14} />
                      Open in Google Maps
                    </a>
                  ) : null;
                })()}
              </div>
            </article>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-[#9CA3AF]">No verified businesses found</div>
        )}
        {loading && (
          <div className="text-center py-12 text-[#9CA3AF]">Loading…</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1F2937]">Edit Business</h2>
              <button onClick={() => setEditing(null)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                <X size={22} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveBusiness(editing);
              }}
              className="p-6 space-y-4"
            >
              <Field label="Business Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Category</label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as BusinessApplication['category'] })}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Field label="Address" value={editing.address} onChange={(v) => setEditing({ ...editing, address: v })} />
              <Field label="City" value={editing.city} onChange={(v) => setEditing({ ...editing, city: v })} />
              <Field label="Country" value={editing.country} onChange={(v) => setEditing({ ...editing, country: v })} />
              <Field label="Phone" value={editing.phone} onChange={(v) => setEditing({ ...editing, phone: v })} />
              <Field label="Email" value={editing.email} onChange={(v) => setEditing({ ...editing, email: v })} />
              <Field label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
              <Field label="Google Maps Link" value={editing.googleMapsUrl} onChange={(v) => setEditing({ ...editing, googleMapsUrl: v })} />
              <Field label="Latitude" value={String(editing.lat)} onChange={(v) => setEditing({ ...editing, lat: parseFloat(v) || 0 })} />
              <Field label="Longitude" value={String(editing.lng)} onChange={(v) => setEditing({ ...editing, lng: parseFloat(v) || 0 })} />
              <Field label="Hours" value={editing.hours ?? ''} onChange={(v) => setEditing({ ...editing, hours: v })} />
              <label className="flex items-center gap-2 text-sm text-[#374151]">
                <input
                  type="checkbox"
                  checked={!!editing.isPremium}
                  onChange={(e) => setEditing({ ...editing, isPremium: e.target.checked })}
                />
                Premium / Highlighted listing
              </label>
              <Field
                label="Business Logo URL"
                value={editing.logoUrl || ''}
                onChange={(v) => setEditing({ ...editing, logoUrl: v })}
              />
              <Field
                label="Highlight Picture URL"
                value={editing.imageUrl || ''}
                onChange={(v) => setEditing({ ...editing, imageUrl: v })}
              />

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Upload Business Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingField !== null}
                  onChange={(e) => onImageUpload('logoUrl', e)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-sm"
                />
                {uploadingField === 'logoUrl' && <p className="text-xs text-[#6B7280] mt-1">Uploading…</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Upload Highlight Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingField !== null}
                  onChange={(e) => onImageUpload('imageUrl', e)}
                  className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-sm"
                />
                {uploadingField === 'imageUrl' && <p className="text-xs text-[#6B7280] mt-1">Uploading…</p>}
              </div>

              {editing.logoUrl && safeImageUrl(editing.logoUrl) && (
                <div>
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Logo Preview</p>
                  <img src={safeImageUrl(editing.logoUrl) ?? ''} alt="Logo preview" className="w-32 h-32 rounded-xl object-contain border border-[#E5E7EB] bg-white" />
                </div>
              )}

              {editing.imageUrl && safeImageUrl(editing.imageUrl) && (
                <div>
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Highlight Preview</p>
                  <img src={safeImageUrl(editing.imageUrl) ?? ''} alt="Highlight preview" className="w-full h-40 rounded-xl object-cover border border-[#E5E7EB]" />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={saving || uploadingField !== null}
                  className="flex-1 bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 bg-white border border-[#E5E7EB] text-[#374151] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#374151] mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 focus:border-[#6DBE75]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 focus:border-[#6DBE75]"
        />
      )}
    </div>
  );
}
