import React, { useState, type FormEvent } from 'react';
import { Mail, Lock, User, ArrowRight, Quote, Building2 } from 'lucide-react';
import { authService } from '../services/authService';
import { Role } from '../services/userService';

const affiche1Url = new URL('../../images/login-branding.jpg', import.meta.url).href;

interface SignupFestiveProps {
  onNavigateToLogin?: () => void;
  onLoginAsUser?: () => void;
  onLoginAsOrganizer?: () => void;
}

const fieldInputClass =
  'w-full px-4 pt-6 pb-3 border border-gray-200 rounded-xl bg-white text-slate-900 shadow-sm focus:outline-none focus:border-festigo focus:ring-2 focus:ring-festigo/25 transition-all duration-200 peer';

export function SignupFestive({ onNavigateToLogin, onLoginAsUser, onLoginAsOrganizer }: SignupFestiveProps) {
  const [accountType, setAccountType] = useState<'Fan' | 'Organizer'>('Fan');
  const isOrganizer = accountType === 'Organizer';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [organisationName, setOrganisationName] = useState('');

  // États pour l'UX
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [organisationNameFocused, setOrganisationNameFocused] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOrganisationNameActive = organisationNameFocused || organisationName.length > 0;
  const isFullNameActive = fullNameFocused || fullName.length > 0;
  const isEmailActive = emailFocused || email.length > 0;
  const isPasswordActive = passwordFocused || password.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Appel à l'API d'inscription
      const newUser = await authService.register({
        nom: fullName,
        email: email,
        mdp: password,
        role: isOrganizer ? Role.Organizer : Role.Fan,
        ...(isOrganizer ? { nomOrganisation: organisationName } : {})
      });

      // 2. Si l'inscription réussit, on redirige vers la page de login
      if (onNavigateToLogin) {
        onNavigateToLogin();
      }

    } catch (err: any) {
      console.error("Erreur d'inscription", err);
      // Personnalisation de l'erreur selon le statut (ex: conflit email)
      if (err.message.includes('409')) {
        setError("Cet email est déjà utilisé. Veuillez vous connecter.");
      } else if (err.message.includes('400')) {
        setError("Veuillez remplir correctement tous les champs.");
      } else {
        setError("Une erreur s'est produite lors de l'inscription.");
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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased lg:h-screen lg:flex-row lg:overflow-hidden">
      <div className="bg-[#125484] px-6 py-5 text-white lg:hidden">
        <p className="text-lg font-bold tracking-tight">
          FestiGo<span className="text-white/90">.</span>
        </p>
        <p className="mt-0.5 text-sm text-white/80">Rejoins la communauté en quelques secondes.</p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:order-2 lg:h-full lg:w-[44%] lg:max-w-none lg:justify-start lg:overflow-y-auto lg:px-12 xl:px-16">
        <div className="festigo-auth-fade-in mx-auto w-full max-w-md">
          <div className="mb-8 lg:mb-10">
            <p className="text-lg font-bold tracking-tight text-slate-900 lg:text-xl">
              FestiGo<span className="text-festigo">.</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">Ton passeport pour les concerts</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Créer un compte</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Rejoins des milliers d'amateurs de musique aujourd'hui
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-xl border border-gray-200 bg-slate-100/80 p-1.5">
            <button
              type="button"
              onClick={() => setAccountType('Fan')}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                !isOrganizer
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Je suis fan
            </button>

            <button
              type="button"
              onClick={() => setAccountType('Organizer')}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                isOrganizer
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Je suis organisateur
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isOrganizer && (
              <div className="relative">
                <input
                  type="text"
                  id="organisationName"
                  required={isOrganizer}
                  value={organisationName}
                  onChange={(e) => setOrganisationName(e.target.value)}
                  onFocus={() => setOrganisationNameFocused(true)}
                  onBlur={() => setOrganisationNameFocused(false)}
                  className={fieldInputClass}
                  placeholder=" "
                />
                <label htmlFor="organisationName" className={labelFloating(isOrganisationNameActive)}>
                  Nom de l'organisation
                </label>
                <Building2
                  className={`pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
                    organisationNameFocused ? 'text-festigo' : 'text-slate-400'
                  }`}
                />
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onFocus={() => setFullNameFocused(true)}
                onBlur={() => setFullNameFocused(false)}
                className={fieldInputClass}
                placeholder=" "
              />
              <label htmlFor="fullName" className={labelFloating(isFullNameActive)}>
                Nom complet
              </label>
              <User
                className={`pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
                  fullNameFocused ? 'text-festigo' : 'text-slate-400'
                }`}
              />
            </div>

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
                minLength={6}
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

            <label className="flex cursor-pointer items-start gap-3">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-5 w-5 cursor-pointer rounded-md border-gray-300 text-festigo focus:ring-2 focus:ring-festigo/30"
                />
              </div>
              <span className="text-sm leading-relaxed text-slate-600">
                J'accepte les{' '}
                <a href="#" className="font-medium text-festigo hover:text-festigo-hover">
                  Conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="#" className="font-medium text-festigo hover:text-festigo-hover">
                  Politique de confidentialité
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={!agreedToTerms || isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-festigo py-3.5 font-semibold text-white shadow-lg shadow-festigo/25 transition-all duration-200 hover:bg-festigo-hover hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:hover:translate-y-0"
            >
              <span>{isLoading ? 'Création en cours...' : 'Créer un compte'}</span>
              {!isLoading && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider text-slate-400">
                <span className="bg-slate-50 px-4">ou créer un compte avec</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo/30"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
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
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo/30"
              >
                <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Déjà un compte ?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-semibold text-festigo transition-colors hover:text-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 rounded"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>

      {/* Desktop: branding panel */}
      <div className="relative hidden min-h-0 flex-1 flex-col justify-between overflow-hidden bg-[#125484] p-12 text-white lg:order-1 lg:flex xl:p-16">
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
            La billetterie pensée pour les équipes qui font vivre la scène.
          </p>
        </div>
        <div className="relative mt-auto max-w-lg rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur-sm">
          <Quote className="mb-4 h-8 w-8 text-white/70" aria-hidden />
          <blockquote className="text-lg font-medium leading-relaxed text-white/95">
            « Sans musique, la vie serait une erreur. »
          </blockquote>
          <p className="mt-4 text-sm text-white/70">— Friedrich Nietzsche</p>
        </div>
      </div>
    </div>
  );
}
