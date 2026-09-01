import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { ArrowRight, Eye, EyeOff, LockKeyhole, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps { onSuccess: () => void; }

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { setCurrentUser } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await ApiService.login(identifier.trim(), password, keepSignedIn);
      if (!result) throw new Error('Unable to sign in.');
      setCurrentUser(result.user);
      onSuccess();
    } catch (loginError: any) {
      setError(loginError?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eceee9] p-3 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#94a3b8_0.6px,transparent_0.6px)] [background-size:18px_18px]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-2xl shadow-slate-900/10 sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-28 top-1/3 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-xl font-black text-slate-950">R</div>
            <div><p className="text-lg font-black tracking-tight">Rabee</p><p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">Parcel operations</p></div>
          </div>
          <div className="relative">
            <p className="max-w-sm text-5xl font-black leading-[0.94] tracking-[-0.065em]">Every parcel.<br /><span className="text-amber-300">Clearly managed.</span></p>
            <div className="mt-10 h-px w-full bg-gradient-to-r from-amber-400/70 to-transparent" />
          </div>
          <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Mauritius · Operations system</p>
        </aside>

        <main className="flex items-center justify-center px-5 py-10 sm:px-12 lg:px-20">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-sm">
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-amber-300">R</div>
              <div><p className="text-lg font-black text-slate-950">Rabee</p><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Parcel operations</p></div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-700">Secure access</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-slate-950">Sign in</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Username or email</span>
                <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-500/10">
                  <UserIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  <input value={identifier} onChange={event => { setIdentifier(event.target.value); setError(null); }} autoComplete="username" autoFocus required className="h-14 w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400" placeholder="Username or email" />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Password</span>
                <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-500/10">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); setError(null); }} autoComplete="current-password" required className="h-14 min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400" placeholder="Password" />
                  <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </span>
              </label>

              <div className="flex items-center justify-between py-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={keepSignedIn} onChange={event => setKeepSignedIn(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-amber-500" />Keep me signed in</label>
              </div>

              {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{error}</div>}

              <button type="submit" disabled={loading} className="group flex h-14 w-full items-center justify-between rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60">
                <span>{loading ? 'Signing in…' : 'Continue'}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950"><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
              </button>
            </form>

            <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Rabee · Mauritius</p>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
