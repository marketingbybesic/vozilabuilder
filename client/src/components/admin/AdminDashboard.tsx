import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard, Users, Car, TrendingUp, AlertCircle,
  ShieldCheck, ChevronRight
} from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
}

const KpiCard = ({ label, value, icon: Icon, trend }: KpiCardProps) => (
  <div className="bg-card border border-neutral-800 rounded-none p-6 flex items-start justify-between hover:border-white/10 transition-colors">
    <div>
      <p className="text-[10px] font-light uppercase tracking-widest text-white/40 mb-2">
        {label}
      </p>
      <p className="text-2xl font-light text-white tracking-widest">
        {value}
      </p>
      {trend && (
        <p className="text-[10px] font-light uppercase tracking-widest text-white/30 mt-1">
          {trend}
        </p>
      )}
    </div>
    <div className="w-10 h-10 bg-white/5 border border-neutral-800 rounded-none flex items-center justify-center">
      <Icon className="w-5 h-5 text-white/60" strokeWidth={1.5} />
    </div>
  </div>
);

const PlaceholderTable = ({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: { id: string; cells: React.ReactNode[] }[];
}) => (
  <div className="bg-card border border-neutral-800 rounded-none">
    <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
      <h3 className="text-[10px] font-light uppercase tracking-widest text-white/40">
        {title}
      </h3>
      <ChevronRight className="w-4 h-4 text-white/20" strokeWidth={1.5} />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-800">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left px-6 py-3 text-[10px] font-light uppercase tracking-widest text-white/30"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-neutral-800/50 hover:bg-white/[0.02] transition-colors">
              {row.cells.map((cell, idx) => (
                <td key={idx} className="px-6 py-4 text-sm font-light text-white/70">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={headers.length}
                className="px-6 py-12 text-center text-sm font-light text-white/30"
              >
                Nema podataka
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      setIsAdmin(profile?.role === 'admin');
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-neutral-800 rounded-none flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-white/40" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-light text-white tracking-widest mb-2">
              Pristup odbijen
            </h1>
            <p className="text-sm font-light text-white/40">
              Samo administratori imaju pristup ovoj stranici.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-black text-[11px] font-light uppercase tracking-widest hover:bg-neutral-200 transition-all"
          >
            Natrag na početnu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <LayoutDashboard className="w-5 h-5 text-white/40" strokeWidth={1.5} />
          <h1 className="text-xl font-light text-white tracking-widest">
            Admin Command Center
          </h1>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <KpiCard
            label="Ukupno Oglasa"
            value="—"
            icon={Car}
            trend="Baza podataka"
          />
          <KpiCard
            label="Aktivni Korisnici"
            value="—"
            icon={Users}
            trend="Baza podataka"
          />
          <KpiCard
            label="Aktivne Kampanje"
            value="—"
            icon={TrendingUp}
            trend="Baza podataka"
          />
          <KpiCard
            label="Prihod"
            value="—"
            icon={TrendingUp}
            trend="Baza podataka"
          />
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlaceholderTable
            title="Nedavne Prijave"
            headers={['Korisnik', 'Email', 'Datum', 'Status']}
            rows={[]}
          />
          <PlaceholderTable
            title="Oglasi na Čekanju"
            headers={['Oglas', 'Kategorija', 'Cijena', 'Akcije']}
            rows={[]}
          />
        </div>

        {/* Alert placeholder */}
        <div className="mt-8 bg-white/[0.02] border border-neutral-800 rounded-none p-6 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-light text-white/70 mb-1">
              Admin funkcionalnost u razvoju
            </p>
            <p className="text-xs font-light text-white/40 leading-relaxed">
              Puni KPI podaci, upravljanje korisnicima i moderacija oglasa dolaze u sljedećoj fazi.
              Tabele će se dinamički puniti iz baze podataka nakon implementacije back-end servisa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
