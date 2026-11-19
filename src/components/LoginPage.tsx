import React, { useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { IMAGES } from '../assets/images';
import { DISTRICT_CLIMATOLOGY, getDistrictsForState } from '../data/indianClimatology';
import { auth, googleProvider } from '../firebase';
import type { UserRole } from '../types/aeroflora';
import { ResilientImage } from './ResilientImage';

export interface PendingSignupMeta {
  fullName: string;
  role: UserRole;
  organization: string;
  state: string;
  district: string;
}

export const PENDING_META_STORAGE_KEY = 'aeroflora_pending_signup_meta';

interface LoginPageProps {
  unverifiedUser: User | null;
  onVerificationComplete: () => Promise<void>;
}

const UNIQUE_STATES = Array.from(new Set(DISTRICT_CLIMATOLOGY.map((d) => d.state)));

export const LoginPage: React.FC<LoginPageProps> = ({
  unverifiedUser,
  onVerificationComplete,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [organization, setOrganization] = useState('Banaskantha Arid Farmers FPO');
  const [stateName, setStateName] = useState('Gujarat');
  const [districtName, setDistrictName] = useState('Banaskantha');

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const availableDistricts = useMemo(() => getDistrictsForState(stateName), [stateName]);

  const passwordChecks = useMemo(
    () => [
      { id: 'len', label: 'At least 8 characters', ok: password.length >= 8 },
      { id: 'upper', label: 'Uppercase letter (A–Z)', ok: /[A-Z]/.test(password) },
      { id: 'lower', label: 'Lowercase letter (a–z)', ok: /[a-z]/.test(password) },
      { id: 'num', label: 'Number (0–9)', ok: /\d/.test(password) },
      { id: 'spec', label: 'Special character (!@#$%^&*)', ok: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  );

  const isPasswordStrong = passwordChecks.every((c) => c.ok);

  const mapFirebaseError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    const msg = err instanceof Error ? err.message : String(err);

    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in popup was closed before completing authentication. Please try again.';
    }
    if (code === 'auth/unauthorized-domain') {
      return `This preview domain (${window.location.hostname}) is not yet allowlisted in Firebase Auth Authorized Domains.`;
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Email/Password sign-in is not yet enabled in Firebase Console -> Authentication -> Sign-in method. Please use Continue with Google or enable Email/Password in Firebase Console.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please double-check your credentials or reset your password.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Please switch to Sign In.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts detected. Please wait a moment before trying again.';
    }
    return msg;
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!cred.user.emailVerified) {
        setInfoMsg('Your email is not verified yet. Please check your inbox and verify before continuing.');
      }
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!isPasswordStrong) {
      setErrorMsg('Please satisfy all 5 password complexity requirements before creating an account.');
      return;
    }

    setBusy(true);
    try {
      const pendingMeta: PendingSignupMeta = {
        fullName: fullName.trim(),
        role,
        organization: organization.trim() || 'Independent Farm Holding',
        state: stateName,
        district: districtName,
      };
      localStorage.setItem(PENDING_META_STORAGE_KEY, JSON.stringify(pendingMeta));

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: fullName.trim() });
      await sendEmailVerification(cred.user);
      setInfoMsg(`Verification email dispatched to ${email.trim()}. Please verify to unlock your workspace.`);
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim()) {
      setErrorMsg('Enter your registered email address to receive a password reset link.');
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg(`Password reset instructions sent to ${email.trim()}.`);
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setBusy(true);
    try {
      await sendEmailVerification(unverifiedUser);
      setInfoMsg(`Fresh verification email sent to ${unverifiedUser.email}.`);
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!unverifiedUser) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setBusy(true);
    try {
      await unverifiedUser.reload();
      if (auth.currentUser?.emailVerified) {
        await onVerificationComplete();
      } else {
        setErrorMsg('Verification not detected yet. Please click the link inside your inbox email and try again.');
      }
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Left Hero Column */}
      <div className="lg:w-[54%] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/60 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-sky-400 tracking-wide mb-6">
            <Droplets className="w-4 h-4 shrink-0" />
            <span>AeroFlora Systems</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300">AgriTech</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400">India</span>
          </div>

          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.12] max-w-xl text-balance mb-5">
            Pure Atmospheric Water. Data-Driven Farming.
          </h1>

          <p className="text-slate-300 text-base leading-relaxed max-w-xl mb-8">
            Autonomous solar MOF-801 atmospheric water harvesting engineered for arid Indian orchards—integrating
            biomimetic condensation, FAO-56 Penman-Monteith irrigation planning, and PM-KUSUM financial telemetry.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Biomimetic Yield</div>
              <div className="text-lg font-bold font-mono text-sky-400 tabular-nums">450+ L/day</div>
              <div className="text-xs text-slate-400 mt-0.5">At 15–25% RH, 0 kWh grid</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">ICAR & FAO-56</div>
              <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">15 Crops</div>
              <div className="text-xs text-slate-400 mt-0.5">IMD & CGWB district normals</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">PM-KUSUM Ready</div>
              <div className="text-lg font-bold font-mono text-cyan-300 tabular-nums">30–50%</div>
              <div className="text-xs text-slate-400 mt-0.5">Central & State subsidy fit</div>
            </div>
          </div>
        </div>

        {/* Atmospheric Tower Showcase Card */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-60 sm:h-72 w-full max-w-2xl">
          <ResilientImage
            src={IMAGES.heroWater}
            alt="AeroFlora Mk-IV autonomous solar atmospheric water harvesting tower in an arid Indian orchard"
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-sky-300 mb-1 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                <span>Mk-IV Solar Sorption Architecture</span>
              </div>
              <p className="text-sm font-medium text-white">
                Passive nocturnal capture · Volcanic basalt & calcite mineralization
              </p>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <div className="text-xs text-slate-300">Target TDS</div>
              <div className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">199.2 ppm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Authentication Panel */}
      <div className="lg:w-[46%] flex items-center justify-center p-6 sm:p-10 bg-slate-950">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-7 sm:p-8">
          {unverifiedUser ? (
            <div>
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Verify Your Email Address</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                We sent a verification link to <strong className="text-slate-900">{unverifiedUser.email}</strong>.
                Confirm your inbox link to unlock your AeroFlora farm intelligence workspace.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}
              {infoMsg && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                  {infoMsg}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCheckVerification}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{busy ? 'Checking...' : 'I Have Verified, Check Status'}</span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleResendVerification}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend Verification Email</span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => signOut(auth)}
                  className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Sign out and use another account
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Sign In / Create Account Tabs */}
              {mode !== 'forgot' ? (
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className={`py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      mode === 'signin'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className={`py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      mode === 'signup'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Reset Password</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* Google SSO */}
              {mode !== 'forgot' && (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2.5 text-slate-400">or use email credentials</span>
                    </div>
                  </div>
                </>
              )}

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed">
                  {errorMsg}
                </div>
              )}
              {infoMsg && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 leading-relaxed">
                  {infoMsg}
                </div>
              )}

              <form
                onSubmit={
                  mode === 'signin'
                    ? handleEmailSignIn
                    : mode === 'signup'
                    ? handleEmailSignUp
                    : handleForgotPassword
                }
                className="space-y-4"
              >
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Sureshbhai Chaudhary"
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as UserRole)}
                          className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="farmer">Farmer / Grower</option>
                          <option value="agronomist">Agronomist</option>
                          <option value="technician">Field Technician</option>
                          <option value="fpo_admin">FPO Coordinator</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                        <select
                          value={stateName}
                          onChange={(e) => {
                            const nextState = e.target.value;
                            setStateName(nextState);
                            const nextDists = getDistrictsForState(nextState);
                            setDistrictName(nextDists[0]?.district || '');
                          }}
                          className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {UNIQUE_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                        <select
                          value={districtName}
                          onChange={(e) => setDistrictName(e.target.value)}
                          className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {availableDistricts.map((d) => (
                            <option key={d.district} value={d.district}>
                              {d.district}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Farm / FPO Name</label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="Farm or FPO"
                          className="w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Password</label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setErrorMsg(null);
                            setInfoMsg(null);
                          }}
                          className="text-xs font-medium text-sky-600 hover:text-sky-700"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {mode === 'signup' && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="text-xs font-semibold text-slate-700 mb-1">Password Requirements</div>
                        {passwordChecks.map((rule) => (
                          <div key={rule.id} className="flex items-center gap-2 text-xs">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                rule.ok ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span className={rule.ok ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {busy
                    ? 'Authenticating...'
                    : mode === 'signin'
                    ? 'Sign In to AeroFlora OS'
                    : mode === 'signup'
                    ? 'Create Account & Verify Email'
                    : 'Send Password Reset Email'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>TLS 1.3 · Firebase Zero-Trust Rules</span>
                </span>
                <span className="font-mono text-slate-400">Mk-IV OS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
