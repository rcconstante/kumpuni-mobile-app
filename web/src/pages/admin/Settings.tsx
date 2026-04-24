import { useState } from 'react';
import { Eye, EyeOff, Lock, Save, ShieldCheck } from 'lucide-react';
import { useAdminAuth, useRequireAdmin } from '../../lib/adminAuth';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';

export default function AdminSettingsPage() {
  const { ready } = useRequireAdmin();
  const { user } = useAdminAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  if (!ready) return null;

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user?.email) {
      setError('No active session.');
      return;
    }
    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 12) {
      setError('New password must be at least 12 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain upper, lower and a number.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from the current one.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    // Re-authenticate to ensure the session token isn't simply hijacked.
    const { error: reauthErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reauthErr) {
      setSaving(false);
      setError('Current password is incorrect.');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccess('Password updated successfully.');
  };

  return (
    <AdminLayout active="settings">
      <div className="p-6 lg:p-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1F2937] mb-2">Settings</h1>
        <p className="text-sm text-[#6B7280] mb-8">Manage your admin account.</p>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-[#6DBE75]" />
              <h2 className="font-bold text-[#1F2937]">Account</h2>
            </div>
            <label className="block text-sm font-semibold text-[#374151] mb-1.5">Admin Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#6B7280]"
            />
            <p className="text-xs text-[#9CA3AF] mt-2">
              Manage admin users in the Supabase dashboard (Authentication → Users) and the
              <code className="mx-1 bg-[#F3F4F6] px-1.5 py-0.5 rounded">public.admins</code> table.
            </p>
          </section>

          <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-[#6DBE75]" />
              <h2 className="font-bold text-[#1F2937]">Change Password</h2>
            </div>
            <form onSubmit={changePassword} className="space-y-4">
              <PasswordField
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
              />
              <PasswordField
                label="New Password (min 12 chars, mixed case + number)"
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
              />
              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#6DBE75] hover:bg-[#5CAE65] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#374151] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#6DBE75]/30 focus:border-[#6DBE75]"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
