import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Trash2, ArrowLeft, Shield, User, Bell, BellRing } from 'lucide-react';
import { deleteAccount } from '../lib/auth';

export const Settings = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(false);

  const handleDelete = async () => {
    if (confirmText.trim().toLowerCase() !== 'obrisi') return;
    setDeleting(true);
    const res = await deleteAccount();
    setDeleting(false);
    if (res.success) {
      setResult({ success: true, message: 'Vaši podaci su trajno obrisani. Preusmjeravam...' });
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    } else {
      setResult({ success: false, message: res.error || 'Brisanje nije uspjelo.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-light uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Natrag
      </Link>

      <h1 className="text-xl font-light uppercase tracking-[0.2em] text-white mb-8">Postavke</h1>

      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-white/40" strokeWidth={1.5} />
            <h2 className="text-xs font-light uppercase tracking-[0.15em] text-white">Profil</h2>
          </div>
          <p className="text-sm font-light text-white/40 leading-relaxed">
            Upravljanje profilom dolazi uskoro. Trenutno možete zatražiti brisanje svih Vaših podataka u skladu s GDPR-om.
          </p>
        </div>

        {/* Notification Settings Card */}
        <div className="border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-white/40" strokeWidth={1.5} />
            <h2 className="text-xs font-light uppercase tracking-[0.15em] text-white">Obavijesti</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                <span className="text-sm font-light text-white/60">Email obavijesti o novim oglasima</span>
              </div>
              <button
                onClick={() => setEmailNotifications((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 border border-white/10 ${emailNotifications ? 'bg-primary' : 'bg-white/5'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform duration-300 ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                <span className="text-sm font-light text-white/60">In-app obavijesti o promjeni cijene</span>
              </div>
              <button
                onClick={() => setPriceAlerts((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 border border-white/10 ${priceAlerts ? 'bg-primary' : 'bg-white/5'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform duration-300 ${priceAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & GDPR Card */}
        <div className="border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-white/40" strokeWidth={1.5} />
            <h2 className="text-xs font-light uppercase tracking-[0.15em] text-white">Privatnost i sigurnost</h2>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-[10px] font-light uppercase tracking-[0.2em] text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
              Brisanje računa (GDPR — pravo na zaborav)
            </h3>
            <p className="text-sm font-light text-white/40 mb-6 leading-relaxed">
              Brisanjem računa uklanjamo sve Vaše oglase, slike, analitiku i osobne podatke. Ova radnja je
              <span className="text-white/60"> nepovratna</span>.
            </p>

            {!confirmOpen ? (
              <button
                onClick={() => setConfirmOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-transparent text-red-400 font-light uppercase tracking-[0.15em] text-[10px] border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                Obriši moje podatke
              </button>
            ) : (
              <div className="border border-red-500/20 bg-red-500/5 p-5">
                {result ? (
                  <p className={`text-sm font-light ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.message}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-light text-white/60 mb-4">
                      Za potvrdu, upišite <span className="text-white font-light">"obrisi"</span> u polje ispod:
                    </p>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm font-light text-white placeholder-white/20 focus:border-red-500/30 focus:outline-none mb-4"
                      placeholder="obrisi"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDelete}
                        disabled={confirmText.trim().toLowerCase() !== 'obrisi' || deleting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 font-light uppercase tracking-[0.15em] text-[10px] border border-red-500/30 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {deleting ? 'Brisanje...' : 'Potvrdi brisanje'}
                      </button>
                      <button
                        onClick={() => { setConfirmOpen(false); setConfirmText(''); }}
                        className="px-5 py-2.5 text-white/40 font-light uppercase tracking-[0.15em] text-[10px] border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
                      >
                        Odustani
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
