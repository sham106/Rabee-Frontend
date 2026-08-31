import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { FormField } from '../components/common/FormField';
import { ApiService } from '../services/api';
import { Lock, User as UserIcon, ShieldCheck, Bike, BarChart3, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { allUsers, riders, setCurrentUser, showToast } = useApp();
  const [identifier, setIdentifier] = useState('peter.kamau@rabee.io');
  const [password, setPassword] = useState('rabee2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your username or email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ApiService.login(cleanId, password);
      if (result) {
        setCurrentUser(result.user);
        showToast({
          type: 'success',
          title: `Welcome back, ${result.user.name}`,
          message: result.rider ? `Signed in as Rider (@${result.rider.username})` : `Signed in as ${result.user.role.toUpperCase()}`,
        });
        setLoading(false);
        onSuccess();
      } else {
        setError('Account not found. For riders, enter your username (e.g. rabee1).');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    if (role === 'admin') {
      const admin = allUsers.find(u => u.role === 'admin') || allUsers[0];
      setIdentifier(admin.email);
      setPassword('rabee2026!');
      setCurrentUser(admin);
      showToast({
        type: 'success',
        title: `Logged in as ${admin.name}`,
        message: 'Role: ADMIN / OPERATIONS',
      });
      onSuccess();
    } else if (role === 'rider') {
      const activeRider = riders.find(r => r.status === 'active') || riders[0];
      setIdentifier(activeRider.username || 'rabee1');
      setPassword(activeRider.password || 'password123');
      
      const riderUser = {
        id: `usr-${activeRider.id}`,
        name: activeRider.name,
        email: `${activeRider.username}@rabee.io`,
        role: 'rider' as UserRole,
        rider_id: activeRider.id,
        phone: activeRider.phone,
        hub: activeRider.hub,
      };
      setCurrentUser(riderUser);
      showToast({
        type: 'success',
        title: `Welcome back, ${activeRider.name}`,
        message: `Rider Account (@${activeRider.username})`,
      });
      onSuccess();
    } else if (role === 'manager') {
      const mgr = allUsers.find(u => u.role === 'manager') || allUsers[1];
      setIdentifier(mgr.email);
      setPassword('rabee2026!');
      setCurrentUser(mgr);
      showToast({
        type: 'success',
        title: `Logged in as ${mgr.name}`,
        message: 'Role: FLEET MANAGER',
      });
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Rabee Brand Logo */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500 text-slate-950 font-black text-3xl shadow-lg shadow-amber-500/25 mb-4"
          >
            R
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Rabee
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mt-1">
            Parcel Operations Platform
          </p>
        </div>

        {/* Welcome Text */}
        <div className="mt-8 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sign In to Terminal
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Riders sign in with username (e.g. <span className="font-mono text-amber-700 font-bold">rabee1</span>). Admins sign in with email or username.
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-6 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleLogin} className="space-y-4">
            <FormField
              id="login-identifier"
              label="Username or Email"
              type="text"
              value={identifier}
              onChange={e => {
                setIdentifier(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. rabee1 or peter.kamau@rabee.io"
              icon={<UserIcon className="h-4 w-4 text-slate-400" />}
              error={error || undefined}
              required
              autoFocus
            />

            <FormField
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter your security password"
              icon={<Lock className="h-4 w-4 text-slate-400" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 bg-white text-amber-500 focus:ring-0"
                />
                <span>Remember terminal</span>
              </label>
              <button
                type="button"
                onClick={() => showToast({ type: 'info', title: 'Rider Credentials', message: 'Riders receive company usernames like rabee1, rabee2.' })}
                className="text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
              >
                Forgot credentials?
              </button>
            </div>

            <div className="pt-2">
              <PrimaryButton
                type="submit"
                loading={loading}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In
              </PrimaryButton>
            </div>
          </form>

          {/* Quick Demo Role Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-600" />
                Quick Role Demo Sign-in
              </span>
              <span className="text-[10px] text-slate-400 font-medium">1-click switch</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('admin')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 transition-all cursor-pointer group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-800 mb-1 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Admin</span>
                <span className="text-[10px] text-slate-400 font-medium">Peter K.</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin('rider')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 mb-1 group-hover:scale-110 transition-transform">
                  <Bike className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Rider</span>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">@rabee1</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin('manager')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-100 text-sky-800 mb-1 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Manager</span>
                <span className="text-[10px] text-slate-400 font-medium">Sarah O.</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 font-medium">
          <p>Rabee Operations System v2.4</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Nairobi Central Sorting Hub • Encrypted Operations Terminal
          </p>
        </div>
      </div>
    </div>
  );
};
