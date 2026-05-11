import React, { useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { organizerService } from '../services/organizerService';
import { authService } from '../services/authService';
import { type User } from '../services/userService';

type OrganizerSettingsProps = {
  currentUser: User;
  onUserUpdated: (updatedUser: User) => void;
};

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-colors focus:border-festigo focus:outline-none focus:ring-2 focus:ring-festigo/20';

export function OrganizerSettings({ currentUser, onUserUpdated }: OrganizerSettingsProps) {
  const [formData, setFormData] = useState({
    nom: currentUser.nom || '',
    email: currentUser.email || '',
    nomOrganisation: currentUser.nomOrganisation || '',
    mdp: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.id) return;

    if (!formData.nom.trim() || !formData.email.trim() || !formData.nomOrganisation.trim()) {
      setMessage({ type: 'error', text: 'Nom, email et nom de l’organisation sont obligatoires.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const payload = {
        nom: formData.nom.trim(),
        email: formData.email.trim(),
        nomOrganisation: formData.nomOrganisation.trim(),
        ...(formData.mdp.trim() ? { mdp: formData.mdp } : {}),
      };

      const updatedOrganizer = await organizerService.updateOrganizer(currentUser.id, payload);
      const updatedUser: User = {
        ...currentUser,
        nom: updatedOrganizer.nom,
        email: updatedOrganizer.email,
        nomOrganisation: updatedOrganizer.nomOrganisation,
      };

      authService.storeUser(updatedUser);
      onUserUpdated(updatedUser);
      setFormData((prev) => ({ ...prev, mdp: '' }));
      setMessage({ type: 'success', text: 'Informations mises à jour avec succès.' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Impossible de sauvegarder les modifications.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-festigo/10">
            <Settings className="h-5 w-5 text-festigo" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Paramètres organisateur</h3>
            <p className="text-sm text-gray-500">Modifie les informations de ton compte.</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg border p-4 text-sm ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Adresse mail</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Nom de l’organisation</label>
            <input
              type="text"
              value={formData.nomOrganisation}
              onChange={(e) => handleChange('nomOrganisation', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <input
              type="password"
              value={formData.mdp}
              onChange={(e) => handleChange('mdp', e.target.value)}
              className={inputClass}
              placeholder="Laisser vide pour conserver l’actuel"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors ${
              isSaving ? 'cursor-not-allowed bg-festigo/70' : 'bg-festigo hover:bg-festigo-hover'
            }`}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  );
}
