import React, { useState } from 'react';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('bhavya.agarwal.career@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      // fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setIsSubmitting(true);
    setFeedback('Writing note... ✎');

    setTimeout(() => {
      setFeedback(`Note recorded! Thanks, ${formState.name}. Opening mail draft... ✓`);

      const mailtoUrl = `mailto:bhavya.agarwal.career@gmail.com?subject=${encodeURIComponent(
        formState.subject || 'Portfolio Inquiry'
      )}&body=${encodeURIComponent(
        `Hi Bhavya,\n\n${formState.message}\n\nFrom: ${formState.name} (${formState.email})`
      )}`;

      window.location.href = mailtoUrl;

      setFormState({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);

      setTimeout(() => setFeedback(''), 6000);
    }, 700);
  };

  return (
    <section id="contact" className="pt-14 pb-12 scroll-mt-20">
      {/* Section Title */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-dashed border-ink-blue/25 pb-2 mb-8">
        <h2 className="font-typewriter text-3xl md:text-4xl text-ink-blue tracking-wide">
          <span className="text-ink-red text-2xl md:text-3xl mr-2">04 //</span>
          GET IN TOUCH
        </h2>
        <span className="font-handwritten text-xl text-ink-muted -rotate-1">
          "my inbox is always open" 📬
        </span>
      </div>

      {/* Notebook Memo Sheet */}
      <div className="relative bg-white border border-ink-blue/25 rounded-[3px] p-7 md:p-10 shadow-lg">
        {/* Washi tape at top-right */}
        <div 
          className="absolute -top-2.5 right-10 w-24 h-6 bg-washi opacity-90 rotate-2 pointer-events-none"
          style={{ clipPath: 'polygon(2% 0%, 98% 2%, 96% 98%, 0% 95%)' }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Info */}
          <div>
            <h3 className="font-typewriter text-2xl text-ink-blue mb-3 leading-snug">
              Let's build something impactful together.
            </h3>
            <p className="font-mono text-sm leading-relaxed text-ink-muted mb-7">
              Whether you have an internship opportunity, an open-source collaboration, 
              a project in mind, or just want to chat about AI and software engineering — shoot me a message!
            </p>

            <div className="flex flex-col gap-3 font-mono text-sm mb-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-ink-blue w-20">EMAIL:</span>
                <a 
                  href="mailto:bhavya.agarwal.career@gmail.com"
                  className="font-semibold underline decoration-ink-blue/30 hover:decoration-ink-blue hover:text-ink-blue transition-colors"
                >
                  bhavya.agarwal.career@gmail.com
                </a>
                <button
                  onClick={copyEmail}
                  className="text-xs text-ink-blue border border-ink-blue/30 px-1.5 py-0.5 rounded-[2px] hover:bg-ink-blue hover:text-white transition-all ml-1"
                >
                  {copied ? '[copied! ✓]' : '[copy]'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-ink-blue w-20">LOCATION:</span>
                <span className="text-ink-dark">Patiala, Punjab, India</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-ink-blue w-20">STATUS:</span>
                <span className="text-emerald-700 font-bold">Open to SDE &amp; AI/ML Roles</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
              <span className="font-bold text-ink-muted">NETWORKS:</span>
              <a href="https://github.com/bhavyagarwall" target="_blank" rel="noopener noreferrer" className="font-bold text-ink-blue hover:text-ink-red transition-colors">[GitHub]</a>
              <a href="https://www.linkedin.com/in/bhavyaagarwal24/" target="_blank" rel="noopener noreferrer" className="font-bold text-ink-blue hover:text-ink-red transition-colors">[LinkedIn]</a>
              <a href="https://leetcode.com/u/bhavyaagarwall" target="_blank" rel="noopener noreferrer" className="font-bold text-ink-blue hover:text-ink-red transition-colors">[LeetCode]</a>
            </div>
          </div>

          {/* Right: Note Sheet Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-typewriter text-xs font-bold text-ink-blue tracking-wide">
                [ YOUR NAME ]
              </label>
              <input
                id="name"
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g. Alan Turing"
                className="font-mono text-sm p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px] text-ink-dark focus:border-ink-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-ink-blue/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-typewriter text-xs font-bold text-ink-blue tracking-wide">
                [ YOUR EMAIL ]
              </label>
              <input
                id="email"
                type="email"
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="e.g. alan@turing.org"
                className="font-mono text-sm p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px] text-ink-dark focus:border-ink-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-ink-blue/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="subject" className="font-typewriter text-xs font-bold text-ink-blue tracking-wide">
                [ SUBJECT ]
              </label>
              <input
                id="subject"
                type="text"
                required
                value={formState.subject}
                onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                placeholder="Project collaboration / Internship inquiry"
                className="font-mono text-sm p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px] text-ink-dark focus:border-ink-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-ink-blue/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="message" className="font-typewriter text-xs font-bold text-ink-blue tracking-wide">
                [ MESSAGE / NOTE ]
              </label>
              <textarea
                id="message"
                rows={4}
                required
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                placeholder="Write your message here..."
                className="font-mono text-sm p-2.5 bg-[#fafbfc] border border-ink-blue/30 rounded-[2px] text-ink-dark focus:border-ink-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-ink-blue/20 transition-all resize-y"
              />
            </div>

            <div className="flex items-center gap-4 mt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 font-mono text-sm font-bold px-6 py-2.5 bg-ink-blue text-white border-2 border-ink-blue shadow-btn-ink hover:bg-ink-dark hover:border-ink-dark hover:shadow-btn-ink-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
              >
                <span>Send Note</span>
                <span>&rarr;</span>
              </button>
              {feedback && (
                <span className="font-handwritten text-lg text-ink-blue">
                  {feedback}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

