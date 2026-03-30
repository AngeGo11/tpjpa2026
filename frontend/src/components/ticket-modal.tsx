import { X, Check, Calendar, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  features: string[];
}

const ticketTiers: TicketTier[] = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    price: 45,
    description: 'Limited time offer - save 30%',
    available: 87,
    features: ['General Admission', 'Standing Area', 'Access to Main Stage'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 65,
    description: 'Best value for money',
    available: 342,
    features: ['General Admission', 'Standing Area', 'Access to All Stages', 'Merchandise Discount'],
  },
  {
    id: 'vip',
    name: 'VIP Experience',
    price: 150,
    description: 'Premium concert experience',
    available: 23,
    features: [
      'Reserved Seating',
      'Priority Entry',
      'VIP Lounge Access',
      'Complimentary Drinks',
      'Meet & Greet Opportunity',
      'Exclusive Merchandise',
    ],
  },
];

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TicketModal({ isOpen, onClose }: TicketModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>('standard');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const selectedTierData = ticketTiers.find(tier => tier.id === selectedTier);
  const totalPrice = selectedTierData ? selectedTierData.price * quantity : 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      {/* Modal — colonne flex pour que le pied ne soit jamais rogné par max-height */}
      <div className="relative flex max-h-[min(90dvh,100vh)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-border p-6 md:p-8">
          <div className="flex-1">
            <h2 id="ticket-modal-title" className="mb-2 text-xl font-semibold text-foreground">
              Purple Lights Festival
            </h2>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>July 15, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>8:00 PM - 11:30 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>The Grand Arena, Los Angeles, CA</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu scrollable (min-h-0 obligatoire avec flex-1 pour que overflow fonctionne) */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-semibold mb-6 text-foreground">Sélectionnez votre billet</h3>

            <div className="space-y-4 mb-8">
              {ticketTiers.map((tier) => (
                <div
                  key={tier.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTier(tier.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedTier(tier.id)}
                  className={`cursor-pointer rounded-xl border p-6 transition-colors ${
                    selectedTier === tier.id
                      ? 'border-accent bg-accent/5 shadow-sm ring-2 ring-accent/20'
                      : 'border-border hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Radio Button */}
                    <div
                      className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        selectedTier === tier.id ? 'border-accent bg-accent' : 'border-border'
                      }`}
                    >
                      {selectedTier === tier.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>

                    {/* Tier Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="text-lg font-semibold mb-1 text-foreground">{tier.name}</h4>
                          <p className="text-sm text-muted-foreground">{tier.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-semibold text-foreground">€{tier.price}</p>
                          <p className="text-xs text-muted-foreground">{tier.available} left</p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="border-t border-border pt-6">
              <label className="block text-sm font-medium mb-3 text-foreground">Nombre de billets</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-border bg-card shadow-sm hover:bg-muted transition-colors flex items-center justify-center font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  −
                </button>
                <span className="text-xl font-medium w-12 text-center text-foreground">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-border bg-card shadow-sm hover:bg-muted transition-colors flex items-center justify-center font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  +
                </button>
                <span className="text-sm text-muted-foreground ml-2">Maximum 10 billets par commande</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — toujours visible sous la zone scroll */}
        <div className="shrink-0 border-t border-border bg-muted/30 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Montant total</p>
              <p className="text-2xl font-semibold text-foreground">€{totalPrice.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-border rounded-lg bg-card shadow-sm hover:bg-muted transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-8 py-3 bg-accent text-accent-foreground rounded-lg shadow-sm hover:opacity-90 transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
