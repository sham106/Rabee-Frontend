import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { FormField } from '../components/common/FormField';
import { ApiService } from '../services/api';
import { ArrowRight, Bike, Eye, EyeOff, Lock, PackageCheck, RotateCcw, ShieldCheck, User as UserIcon, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps { onSuccess: () => void; }

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { setCurrentUser, showToast } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Enter your username or work email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await ApiService.login(identifier.trim(), password, keepSignedIn);
      if (!result) {
        setError('The credentials entered are incorrect. Please try again.');
        return;
      }
      setCurrentUser(result.user);
      showToast({ type: 'success', title: `Welcome back, ${result.user.name}`, message: `Signed in to your ${result.user.role} workspace.` });
      onSuccess();
    } catch (loginError: any) {
      setError(loginError?.message || 'Unable to sign in. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-2xl font-black text-slate-950">R</div>
              <div><p className="text-xl font-extrabold">Rabee</p><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Parcel Operations</p></div>
            </div>
            <div className="mt-20 max-w-lg">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300"><ShieldCheck className="h-3.5 w-3.5" /> Secure operations access</span>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight xl:text-5xl">Move parcels with clarity and control.</h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">One secure sign-in gives every team member access to the workspace and permissions assigned to their account.</p>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {[{ icon: PackageCheck, value: 'Live', label: 'Allocation status' }, { icon: RotateCcw, value: 'Fast', label: 'Return capture' }, { icon: Users, value: 'Clear', label: 'Fleet oversight' }].map(item => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><item.icon className="h-5 w-5 text-amber-400" /><p className="mt-3 text-sm font-extrabold">{item.value}</p><p className="mt-0.5 text-xs text-slate-500">{item.label}</p></div>
            ))}
          </div>
        </section>

        <main className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-xl font-black text-slate-950">R</div><div><p className="text-xl font-extrabold text-slate-900">Rabee</p><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Parcel Operations</p></div></div>
            <div>
              <p className="text-sm font-bold text-amber-700">Secure workspace access</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">Enter the credentials assigned to your account. Your workspace and permissions will open automatically.</p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <FormField id="login-identifier" label="Username or work email" type="text" value={identifier} onChange={event => { setIdentifier(event.target.value); if (error) setError(null); }} placeholder="Enter your username or email" icon={<UserIcon className="h-4 w-4 text-slate-400" />} error={error || undefined} autoComplete="username" required autoFocus />
              <div>
                <FormField id="login-password" label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); if (error) setError(null); }} placeholder="Enter your password" icon={<Lock className="h-4 w-4 text-slate-400" />} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword(value => !value)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">{showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{showPassword ? 'Hide password' : 'Show password'}</button>
              </div>
              <div className="flex items-center justify-between gap-4 text-xs">
                <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-600"><input type="checkbox" checked={keepSignedIn} onChange={event => setKeepSignedIn(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-amber-500" /><span>Keep me signed in</span></label>
                <button type="button" onClick={() => showToast({ type: 'info', title: 'Credential assistance', message: 'Riders should contact an administrator. Staff should contact their system administrator.' })} className="font-bold text-amber-700 hover:text-amber-800">Need help signing in?</button>
              </div>
              <PrimaryButton type="submit" loading={loading} icon={<ArrowRight className="h-4 w-4" />}>Sign in securely</PrimaryButton>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3"><Bike className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><div><p className="text-xs font-bold text-slate-800">Rider access</p><p className="mt-1 text-xs leading-relaxed text-slate-500">Use the username and temporary password issued by your administrator. You do not need to select a role.</p></div></div>
            </div>
            <p className="mt-8 text-center text-xs text-slate-400">Rabee Operations System • Mauritius</p>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
