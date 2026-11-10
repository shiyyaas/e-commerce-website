import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserOrders } from '../../lib/dataService';
import { Order, ShippingAddress } from '../../types/database';
import { X, LogOut, Package, MapPin, CheckCircle, Clock } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, signOut, updateProfileAddress, updateFullName } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [editingAddress, setEditingAddress] = useState<ShippingAddress>({
    fullName: profile?.shipping_address?.fullName || profile?.full_name || '',
    addressLine1: profile?.shipping_address?.addressLine1 || '',
    addressLine2: profile?.shipping_address?.addressLine2 || '',
    city: profile?.shipping_address?.city || '',
    state: profile?.shipping_address?.state || '',
    postalCode: profile?.shipping_address?.postalCode || '',
    country: profile?.shipping_address?.country || 'United States',
  });
  const [nameInput, setNameInput] = useState(profile?.full_name || '');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserOrders(user.id).then(setOrders);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setNameInput(profile.full_name || '');
      if (profile.shipping_address) {
        setEditingAddress(profile.shipping_address);
      }
    }
  }, [profile]);

  if (!isOpen || !user) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput) await updateFullName(nameInput);
    if (editingAddress.addressLine1) await updateProfileAddress(editingAddress);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative bg-canvas w-full max-w-2xl rounded-lg border border-hairline overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-hairline flex items-center justify-between bg-surface-soft/40">
          <div>
            <span className="font-caption text-xs text-ink/60">AUTHENTICATED MEMBER</span>
            <h2 className="font-card-title text-xl font-bold text-ink">
              {profile?.full_name || user.email}
            </h2>
            <span className="font-mono text-xs text-ink/50">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              title="Sign Out"
              className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close profile"
              className="w-8 h-8 rounded-full bg-surface-soft hover:bg-hairline flex items-center justify-center text-ink cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex px-6 pt-4 border-b border-hairline gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-primary text-ink'
                : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            Order History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-ink'
                : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            Profile & Shipping Address
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="py-12 text-center text-ink/60">
                <Package className="w-10 h-10 mx-auto mb-3 text-ink/30" />
                <h4 className="font-card-title text-base font-bold text-ink mb-1">No Orders Yet</h4>
                <p className="font-body-sm text-sm">Your order receipts will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-md border border-hairline bg-surface-soft/20 space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">ORDER #{ord.id.substring(0, 12)}</span>
                        <span className="text-ink/40">·</span>
                        <span className="text-ink/60">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-pill bg-block-lime text-ink font-semibold uppercase text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-semantic-success" />
                        {ord.status}
                      </span>
                    </div>

                    {ord.items && ord.items.length > 0 && (
                      <div className="divide-y divide-hairline-soft pt-1">
                        {ord.items.map((item) => (
                          <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                            <span className="font-medium text-ink">
                              {item.product?.title || 'Studio Object'} × {item.quantity}
                            </span>
                            <span className="font-mono text-ink/80">
                              ${(item.unit_price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-hairline font-mono text-xs font-bold text-ink">
                      <span>Total Amount Paid</span>
                      <span>${ord.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-lg">
              {savedNotice && (
                <div className="p-3 rounded-md bg-block-lime text-xs font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-semantic-success" />
                  Profile and Shipping Address synced to Supabase!
                </div>
              )}

              <div>
                <label className="block text-xs font-caption text-ink/70 mb-1">YOUR FULL NAME</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2 text-sm outline-none font-sans"
                />
              </div>

              <div className="pt-2">
                <span className="font-caption text-xs text-ink/70 mb-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  DEFAULT SHIPPING ADDRESS
                </span>
              </div>

              <div>
                <label className="block text-xs font-caption text-ink/50 mb-1">ADDRESS LINE 1</label>
                <input
                  type="text"
                  value={editingAddress.addressLine1}
                  onChange={(e) =>
                    setEditingAddress({ ...editingAddress, addressLine1: e.target.value })
                  }
                  placeholder="740 Broadway, Suite 1200"
                  className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2 text-sm outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-caption text-ink/50 mb-1">CITY</label>
                  <input
                    type="text"
                    value={editingAddress.city}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, city: e.target.value })
                    }
                    placeholder="New York"
                    className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2 text-sm outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-caption text-ink/50 mb-1">STATE / PROVINCE</label>
                  <input
                    type="text"
                    value={editingAddress.state}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, state: e.target.value })
                    }
                    placeholder="NY"
                    className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2 text-sm outline-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-caption text-ink/50 mb-1">POSTAL CODE</label>
                  <input
                    type="text"
                    value={editingAddress.postalCode}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, postalCode: e.target.value })
                    }
                    placeholder="10003"
                    className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2 text-sm outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-caption text-ink/50 mb-1">COUNTRY</label>
                  <input
                    type="text"
                    value={editingAddress.country}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, country: e.target.value })
                    }
                    className="w-full bg-canvas text-ink border border-hairline focus:border-ink rounded-md px-3.5 py-2 text-sm outline-none font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary !py-2.5 !px-5 text-sm cursor-pointer mt-4"
              >
                Save Shipping Profile
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
