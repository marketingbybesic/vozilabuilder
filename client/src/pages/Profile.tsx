import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Building2, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export const UserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<Partial<Profile>>({
    user_type: 'private',
    company_name: '',
    vat_id: '',
    office_address: '',
    business_phone: '',
    whatsapp_number: '',
  });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data as Profile);
        setForm({
          user_type: data.user_type || 'private',
          company_name: data.company_name || '',
          vat_id: data.vat_id || '',
          office_address: data.office_address || '',
          business_phone: data.business_phone || '',
          whatsapp_number: data.whatsapp_number || '',
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    setSaving(true);
    const payload: Record<string, unknown> = {};
    if (form.user_type) payload.user_type = form.user_type;
    if (form.whatsapp_number !== undefined) payload.whatsapp_number = form.whatsapp_number || null;
    if (form.user_type === 'business') {
      payload.company_name = form.company_name || null;
      payload.vat_id = form.vat_id || null;
      payload.office_address = form.office_address || null;
      payload.business_phone = form.business_phone || null;
    } else {
      payload.company_name = null;
      payload.vat_id = null;
      payload.office_address = null;
      payload.business_phone = null;
    }
    await supabase.from('users').update(payload).eq('id', session.user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-none w-48" />
          <div className="h-12 bg-muted rounded-none" />
          <div className="h-12 bg-muted rounded-none" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <User className="w-10 h-10 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="text-xl font-light uppercase tracking-widest text-foreground mb-2">Profil</h1>
        <p className="text-sm font-light text-muted-foreground">Prijavite se za upravljanje profilom.</p>
      </div>
    );
  }

  const isBusiness = form.user_type === 'business';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-light uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Natrag
      </Link>

      <h1 className="text-xl font-light uppercase tracking-widest text-foreground mb-8">Profil</h1>

      <div className="flex flex-col gap-6">
        {/* Type Selector */}
        <div className="border border-border bg-background p-6">
          <label className="block text-[10px] font-light uppercase tracking-widest text-muted-foreground mb-3">Vrsta korisnika</label>
          <div className="flex gap-0">
            <button
              onClick={() => setForm((f) => ({ ...f, user_type: 'private' }))}
              className={`flex-1 py-3 px-4 text-xs font-light uppercase tracking-widest border border-border transition-all duration-300 hover:bg-gradient-to-t hover:from-white/5 hover:to-transparent ${form.user_type === 'private' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
            >
              Privatni
            </button>
            <button
              onClick={() => setForm((f) => ({ ...f, user_type: 'business' }))}
              className={`flex-1 py-3 px-4 text-xs font-light uppercase tracking-widest border border-border transition-all duration-300 hover:bg-gradient-to-t hover:from-white/5 hover:to-transparent ${form.user_type === 'business' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
            >
              Poslovni
            </button>
          </div>
        </div>

        {/* Common Fields */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="text-xs font-light uppercase tracking-widest text-foreground">Kontakt podaci</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-light uppercase tracking-widest text-muted-foreground mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-muted border border-border px-4 py-3 text-sm font-light text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-light uppercase tracking-widest text-muted-foreground mb-2">Broj telefona / WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp_number || ''}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
                className="w-full bg-background border border-border px-4 py-3 text-sm font-light text-foreground placeholder-muted-foreground focus:border-foreground/30 focus:outline-none transition-colors"
                placeholder="+385 91 234 5678"
              />
            </div>
          </div>
        </div>

        {/* Business Fields (conditional) */}
        {isBusiness && (
          <div className="border border-border bg-background p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <h2 className="text-xs font-light uppercase tracking-widest text-foreground">Poslovni podaci</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-light uppercase tracking-widest text-muted-foreground mb-2">Naziv tvrtke</label>
                <input
                  type="text"
                  value={form.company_name || ''}
                  onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                  className="w-full bg-background border border-border px-4 py-3 text-sm font-light text-foreground placeholder-muted-foreground focus:border-foreground/30 focus:outline-none transition-colors"
                  placeholder="Primjer d.o.o."
                />
              </div>
              <div>
                <label className="block text-[10px] font-light uppercase tracking-widest text-muted-foreground mb-2">OIB (VAT ID)</label>
                <input
                  type="text"
                  maxLength={11}
                  value={form.vat_id || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setForm((f) => ({ ...f, vat_id: val }));
                  }}
                  className="w-full bg-background border border-border px-4 py-3 text-sm font-light text-foreground placeholder-muted-foreground focus:border-foreground/30 focus:outline-none transition-colors"
                  placeholder="12345678901"
                />
                {form.vat_id && form.vat_id.length !== 11 && (
                  <p className="text-[10px] text-red-400 mt-1 font-light">OIB mora imati točno 11 znamenki.</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-light uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" strokeWidth={1.5} /> Adresa ureda
                </label>
                <input
                  type="text"
                  value={form.office_address || ''}
                  onChange={(e) => setForm((f) => ({ ...f, office_address: e.target.value }))}
                  className="w-full bg-background border border-border px-4 py-3 text-sm font-light text-foreground placeholder-muted-foreground focus:border-foreground/30 focus:outline-none transition-colors"
                  placeholder="Ulica i broj, Grad"
                />
              </div>
              <div>
                <label className="block text-[10px] font-light uppercase tracking-widest text-muted-foreground mb-2">Poslovni telefon</label>
                <input
                  type="tel"
                  value={form.business_phone || ''}
                  onChange={(e) => setForm((f) => ({ ...f, business_phone: e.target.value }))}
                  className="w-full bg-background border border-border px-4 py-3 text-sm font-light text-foreground placeholder-muted-foreground focus:border-foreground/30 focus:outline-none transition-colors"
                  placeholder="+385 1 234 5678"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-light uppercase tracking-widest text-xs border border-border transition-all duration-300 hover:bg-gradient-to-t hover:from-white/5 hover:to-transparent disabled:opacity-50"
        >
          {saved ? <CheckCircle className="w-4 h-4" strokeWidth={1.5} /> : <Mail className="w-4 h-4" strokeWidth={1.5} />}
          {saving ? 'Spremanje...' : saved ? 'Spremljeno' : 'Spremi promjene'}
        </button>
      </div>
    </div>
  );
};
