'use client';

import { useState } from 'react';
import { Check, Copy, Link2, Trash2, UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import {
  updateDeckPrivacyAction,
  addDeckShareAction,
  removeDeckShareAction,
  updateDeckSharePermissionAction,
} from '@/app/actions';
import type { Deck, DeckShare, Permission } from '@/types';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  deckId: string;
  deck: Deck;
  initialShares: DeckShare[];
}

const PERMISSION_LABELS: Record<Permission, string> = {
  viewer: 'Viewer',
  editor: 'Editor',
  manager: 'Manager',
};

export function ShareModal({ open, onClose, deckId, deck, initialShares }: ShareModalProps) {
  const [shares, setShares] = useState<DeckShare[]>(initialShares);
  const [isPrivate, setIsPrivate] = useState(deck.is_private);
  const [emailInput, setEmailInput] = useState('');
  const [permissionInput, setPermissionInput] = useState<Permission>('viewer');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  const handleTogglePrivacy = async () => {
    const next = !isPrivate;
    setIsPrivate(next);
    try {
      await updateDeckPrivacyAction(deckId, next);
      showToast(next ? 'Deck is now private' : 'Deck is now public');
    } catch {
      setIsPrivate(!next);
      showToast('Failed to update privacy', 'error');
    }
  };

  const handleInviteByEmail = async () => {
    const email = emailInput.trim();
    if (!email) return;
    setInviteLoading(true);
    setInviteError('');
    try {
      const share = await addDeckShareAction(deckId, { email, permission: permissionInput });
      setShares((prev) => [...prev, share]);
      setEmailInput('');
      showToast('Invitation sent');
    } catch {
      setInviteError('Could not send invite. The email may already have access.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setLinkLoading(true);
    try {
      const share = await addDeckShareAction(deckId, { permission: 'viewer', generateToken: true });
      setShares((prev) => [...prev, share]);
      showToast('Invite link generated');
    } catch {
      showToast('Failed to generate link', 'error');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCopyLink = async (token: string) => {
    const url = `${window.location.origin}/deck/${deckId}?token=${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleChangePermission = async (shareId: string, permission: Permission) => {
    try {
      await updateDeckSharePermissionAction(deckId, shareId, permission);
      setShares((prev) => prev.map((s) => s.id === shareId ? { ...s, permission } : s));
    } catch {
      showToast('Failed to update permission', 'error');
    }
  };

  const handleRemove = async (shareId: string) => {
    try {
      await removeDeckShareAction(deckId, shareId);
      setShares((prev) => prev.filter((s) => s.id !== shareId));
      showToast('Access removed');
    } catch {
      showToast('Failed to remove access', 'error');
    }
  };

  const tokenShares = shares.filter((s) => s.token && !s.email);
  const emailShares = shares.filter((s) => s.email);

  const inputClass =
    'w-full px-3 py-2 rounded-lg text-sm ' +
    'bg-surface-50 dark:bg-surface-700 ' +
    'border border-surface-200 dark:border-surface-600 ' +
    'text-surface-800 dark:text-surface-100 ' +
    'placeholder:text-surface-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500';

  const selectClass =
    'px-2 py-1.5 rounded-lg text-sm ' +
    'bg-surface-50 dark:bg-surface-700 ' +
    'border border-surface-200 dark:border-surface-600 ' +
    'text-surface-800 dark:text-surface-100 ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <Modal open={open} onClose={onClose} title="Share Deck" maxWidth="max-w-lg">
      {/* ── Privacy toggle ─────────────────────────────────────── */}
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-medium text-surface-700 dark:text-surface-200">
            Private deck
          </p>
          <p className="text-xs text-surface-400 mt-0.5">
            {isPrivate
              ? 'Only you and invited people can access.'
              : 'Anyone with the link can view.'}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={isPrivate}
          onClick={handleTogglePrivacy}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            isPrivate ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
              isPrivate ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="border-t border-surface-200 dark:border-surface-700 my-3" />

      {/* ── Invite by email ────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-surface-700 dark:text-surface-200">
          Invite by email
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="email@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleInviteByEmail(); }}
            className={`flex-1 ${inputClass}`}
          />
          <select
            value={permissionInput}
            onChange={(e) => setPermissionInput(e.target.value as Permission)}
            className={selectClass}
          >
            {(Object.keys(PERMISSION_LABELS) as Permission[]).map((p) => (
              <option key={p} value={p}>{PERMISSION_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <Button
          onClick={handleInviteByEmail}
          disabled={!emailInput.trim() || inviteLoading}
          className="w-full"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {inviteLoading ? 'Inviting…' : 'Invite'}
        </Button>
        {inviteError && (
          <p className="text-xs text-error">{inviteError}</p>
        )}
      </div>

      <div className="border-t border-surface-200 dark:border-surface-700 my-3" />

      {/* ── Invite link ────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-surface-700 dark:text-surface-200">
          Invite link
        </p>
        {tokenShares.length === 0 ? (
          <Button
            variant="secondary"
            onClick={handleGenerateLink}
            disabled={linkLoading}
            className="w-full"
          >
            <Link2 className="w-4 h-4 mr-2" />
            {linkLoading ? 'Generating…' : 'Generate invite link'}
          </Button>
        ) : (
          tokenShares.map((share) => {
            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/deck/${deckId}?token=${share.token}`;
            const isCopied = copiedToken === share.token;
            return (
              <div key={share.id} className="flex items-center gap-2">
                <input
                  readOnly
                  value={url}
                  className={`flex-1 truncate ${inputClass}`}
                />
                <button
                  onClick={() => handleCopyLink(share.token!)}
                  title={isCopied ? 'Copied!' : 'Copy link'}
                  className="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleRemove(share.id)}
                  title="Remove link"
                  className="p-2 rounded-lg text-error hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
        <p className="text-xs text-surface-400">
          Anyone with this link can view the deck after signing in.
        </p>
      </div>

      {/* ── People with access ─────────────────────────────────── */}
      {emailShares.length > 0 && (
        <>
          <div className="border-t border-surface-200 dark:border-surface-700 my-3" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">
              People with access
            </p>
            {emailShares.map((share) => (
              <div key={share.id} className="flex items-center gap-2 py-1">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-surface-700 dark:text-surface-200 truncate block">
                    {share.email}
                  </span>
                  {!share.accepted_at && (
                    <span className="text-xs text-surface-400">Pending</span>
                  )}
                </div>
                <select
                  value={share.permission}
                  onChange={(e) => handleChangePermission(share.id, e.target.value as Permission)}
                  className={selectClass}
                >
                  {(Object.keys(PERMISSION_LABELS) as Permission[]).map((p) => (
                    <option key={p} value={p}>{PERMISSION_LABELS[p]}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemove(share.id)}
                  title="Remove access"
                  className="p-1.5 rounded-lg text-error hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Modal>
  );
}
