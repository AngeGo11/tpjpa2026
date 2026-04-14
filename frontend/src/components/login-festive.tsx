import React, { useState, type FormEvent } from 'react';
import { Mail, Lock, ArrowRight, Building2, Quote } from 'lucide-react';
import { authService } from '../services/authService';
import { Role } from '../services/userService';

const affiche1Url = new URL('../../images/login-branding.jpg', import.meta.url).href;

interface LoginFestiveProps {
  onNavigateToSignup?: () => void;
  onLoginAsUser?: () => void;
  onLoginAsOrganizer?: () => void;
}

const fieldInputClass =
  'w-full px-4 pt-6 pb-3 border border-gray-200 rounded-xl bg-white text-slate-900 shadow-sm focus:outline-none focus:border-festigo focus:ring-2 focus:ring-festigo/25 transition-all duration-200 peer';

export function LoginFestive({ onNavigateToSignup, onLoginAsUser, onLoginAsOrganizer }: LoginFestiveProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // États pour l'UX
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailActive = emailFocused || email.length > 0;
  const isPasswordActive = passwordFocused || password.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Appel à notre API Java
      const user = await authService.login({
        email: email,
        mdp: password
      });

      // 2. Si succès, on stocke l'utilisateur
      authService.storeUser(user);

      // 3. Redirection en fonction du rôle renvoyé par la base de données
      if (user.role === Role.Organizer) {
        onLoginAsOrganizer?.();
      } else {
        onLoginAsUser?.();
      }

    } catch (err: any) {
       console.error("Erreur de connexion", err);
       // Personnalisation du message selon le statut HTTP (si possible)
       if (err.message.includes('401')) {
         setError("Email ou mot de passe incorrect.");
       } else {
         setError("Une erreur s'est produite lors de la connexion. Veuillez réessayer.");
       }
    } finally {
      setIsLoading(false);
    }
  };

  const labelFloating = (active: boolean) =>
    `absolute left-4 transition-all duration-200 pointer-events-none ${
      active
        ? 'top-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500'
        : 'top-1/2 -translate-y-1/2 text-base text-slate-400'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased lg:flex-row">
      {/* Mobile: compact brand banner */}
      <div className="bg-[#125484] px-6 py-5 text-white lg:hidden">
        <p className="text-lg font-bold tracking-tight">
          FestiGo<span className="text-white/90">.</span>
        </p>
        <p className="mt-0.5 text-sm text-white/80">Gérez vos événements sans effort.</p>
      </div>

      {/* Form column */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:w-[44%] lg:max-w-none lg:px-12 xl:px-16">
        <div className="festigo-auth-fade-in mx-auto w-full max-w-md">
          <div className="mb-8 lg:mb-10">
            <p className="text-lg font-bold tracking-tight text-slate-900 lg:text-xl">
              FestiGo<span className="text-festigo">.</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">Ton passeport pour les concerts</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Heureux de vous revoir</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Connectez-vous pour accéder à votre compte.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className={fieldInputClass}
                placeholder=" "
              />
              <label htmlFor="email" className={labelFloating(isEmailActive)}>
                Adresse email
              </label>
              <Mail
                className={`pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
                  emailFocused ? 'text-festigo' : 'text-slate-400'
                }`}
              />
            </div>

            <div className="relative">
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className={fieldInputClass}
                placeholder=" "
              />
              <label htmlFor="password" className={labelFloating(isPasswordActive)}>
                Mot de passe
              </label>
              <Lock
                className={`pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
                  passwordFocused ? 'text-festigo' : 'text-slate-400'
                }`}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-festigo focus:ring-2 focus:ring-festigo/30"
                />
                <span className="text-sm text-slate-600">Se souvenir de moi</span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-festigo transition-colors hover:text-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 rounded"
              >
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 ${
                isLoading
                  ? 'bg-festigo/70 cursor-not-allowed'
                  : 'bg-festigo hover:bg-festigo-hover hover:shadow-xl hover:-translate-y-0.5 shadow-festigo/25'
              }`}
            >
              <span>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </span>
              {!isLoading && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />}
            </button>

          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Pas de compte ?{' '}
            <button
              type="button"
              onClick={onNavigateToSignup}
              className="font-semibold text-festigo transition-colors hover:text-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 rounded"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>

      {/* Desktop: branding panel */}
      <div className="relative hidden min-h-0 flex-1 flex-col justify-between overflow-hidden bg-[#125484] p-12 text-white lg:flex xl:p-16">
        {/* Image de fond (côté droit) */}
        <img
          src={affiche1Url}
          alt="Ambiance de concert"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540039155732-68ee14814e4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0fGVufDF8fHx8MTc3MDAyODUyM3ww&ixlib=rb-4.1.0&q=80&w=1080';
          }}
        />
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081b33]/85 via-[#081b33]/35 to-transparent" />

        <div className="relative">
          <p className="text-2xl font-bold tracking-tight xl:text-3xl">
            FestiGo<span className="text-white/90">.</span>
          </p>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-white/80">
            Gérez vos événements sans effort.
          </p>
        </div>
        <div className="relative mt-auto max-w-lg rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur-sm">
          <Quote className="mb-4 h-8 w-8 text-white/70" aria-hidden />
          <blockquote className="text-lg font-medium leading-relaxed text-white/95">
            « Là où les mots s’arrêtent, la musique commence. »
          </blockquote>
          <p className="mt-4 text-sm text-white/70">— Heinrich Heine</p>
        </div>
      </div>
    </div>
  );
}
