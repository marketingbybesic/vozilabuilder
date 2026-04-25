import { useState } from 'react';
import { Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';

export const HelpdeskForm = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:info@vozila.hr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="border border-white/10 bg-white/5 backdrop-blur-md p-8">
        <div className="mb-8 text-center">
          <Mail className="w-8 h-8 text-white/40 mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="text-xl font-light uppercase tracking-[0.2em] text-white mb-2">Kontaktirajte nas</h1>
          <p className="text-[10px] font-light uppercase tracking-[0.15em] text-white/40">info@vozila.hr</p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            <p className="text-sm font-light text-white/60">Poruka je pripremjena. Provjerite Vaš email klijent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/40 mb-2">Naslov</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm font-light text-white placeholder-white/20 focus:border-white/30 focus:outline-none transition-colors"
                placeholder="Upit / prijava greške..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-white/40 mb-2">Poruka</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm font-light text-white placeholder-white/20 focus:border-white/30 focus:outline-none transition-colors resize-none"
                placeholder="Opišite Vaš upit..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-light uppercase tracking-[0.15em] text-xs border border-white/10 hover:bg-black hover:text-white transition-all duration-300"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
              Pošalji upit
            </button>

            <div className="flex items-start gap-2 mt-2">
              <AlertCircle className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[10px] font-light text-white/30 leading-relaxed">
                Otvorit će se Vaš zadani email klijent. Alternativno, pišite direktno na{' '}
                <span className="text-white/50">info@vozila.hr</span>.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
