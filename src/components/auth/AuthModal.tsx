import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUp(email, password || 'password123', fullName || 'Design Studio Member');
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to create account.');
        } else {
          setSuccessNotice(true);
          setTimeout(() => {
            setSuccessNotice(false);
            onSuccess?.();
            onClose();
          }, 1000);
        }
      } else {
        const res = await signIn(email, password || 'password123');
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to sign in. Please verify credentials.');
        } else {
          setSuccessNotice(true);
          setTimeout(() => {
            setSuccessNotice(false);
            onSuccess?.();
            onClose();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative bg-canvas w-full max-w-md rounded-lg border border-hairline overflow-hidden shadow-2xl p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary font-mono text-xs">
              ✦
            </div>
            <span className="font-card-title text-lg font-bold">ATELIER AUTH</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close authentication modal"
            className="w-8 h-8 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        <div className="flex p-1 bg-surface-soft rounded-pill mb-6 border border-hairline">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-pill transition-all cursor-pointer ${
              !isSignUp ? 'bg-primary text-on-primary' : 'text-ink/70 hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-pill transition-all cursor-pointer ${
              isSignUp ? 'bg-primary text-on-primary' : 'text-ink/70 hover:text-ink'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-md bg-block-pink border border-red-200 text-xs text-ink font-mono">
            {errorMsg}
          </div>
        )}

        {/* Success notification */}
        {successNotice && (
          <div className="p-3 mb-4 rounded-md bg-block-lime border border-green-200 text-xs text-ink font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-semantic-success" />
            Authenticated successfully! Loading profile...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-caption text-ink/70 mb-1">FULL NAME</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2.5 text-sm outline-none font-sans"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-caption text-ink/70 mb-1">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-ink/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@studio.design"
                className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md pl-9 pr-3.5 py-2.5 text-sm outline-none font-sans"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-caption text-ink/70">PASSWORD</label>
              <span className="text-[11px] font-mono text-ink/40">(Default: password123)</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-ink/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md pl-9 pr-3.5 py-2.5 text-sm outline-none font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Atelier Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-hairline text-center text-xs font-caption text-ink/60 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
          <span>Integrated Supabase Authentication & RLS</span>
        </div>
      </div>
    </div>
  );
};
