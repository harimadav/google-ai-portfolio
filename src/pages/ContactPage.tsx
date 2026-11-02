import React, { useState } from 'react';
import {
  Mail,
  Phone,
  ExternalLink,
  Send,
  CheckCircle2,
  MapPin,
  Globe,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';

export const ContactPage: React.FC = () => {
  const { data, theme } = usePortfolio();
  const isDark = theme === 'dark';
  const upperName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittedSuccess(false);

    if (name.trim().length < 2) {
      setFormError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (subject.trim().length < 3) {
      setFormError('Please enter a subject (at least 3 characters).');
      return;
    }
    if (message.trim().length < 10) {
      setFormError('Message must be at least 10 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to send message.');
      }
      setSubmittedSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
          {upperName} · Direct Communication
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-display font-bold tracking-tight text-balance">
          Contact & Professional Channels
        </h1>
        <p
          className={`mt-4 text-base sm:text-lg leading-[1.8] ${
            isDark ? 'text-stone-300' : 'text-stone-600'
          }`}
        >
          Reach out to {upperName} directly via email, phone, LinkedIn, GitHub, or
          send a message using the form below.
        </p>
      </div>

      {/* Clean 4-Card Direct Channels Strip (No Duplicate Entries) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <a
          href={`mailto:${data.profile.email}`}
          className={`p-6 rounded-3xl border flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#111A15]/90 border-emerald-900/60 hover:border-emerald-500/60'
              : 'bg-white border-stone-200 hover:border-emerald-600 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
              Email Address
            </span>
            <Mail className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold break-all">{data.profile.email}</p>
            <p className="mt-2 text-xs font-mono text-orange-500 dark:text-amber-400">
              Write an Email →
            </p>
          </div>
        </a>

        <a
          href={`tel:${data.profile.phone}`}
          className={`p-6 rounded-3xl border flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#111A15]/90 border-emerald-900/60 hover:border-orange-500/60'
              : 'bg-white border-stone-200 hover:border-orange-600 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
              Phone / Mobile
            </span>
            <Phone className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-4">
            <p className="text-base font-semibold tabular-nums">
              +91 {data.profile.phone}
            </p>
            <p className="mt-2 text-xs font-mono text-emerald-500 dark:text-emerald-400">
              Call Directly →
            </p>
          </div>
        </a>

        <a
          href={data.profile.linkedinUrl || 'https://linkedin.com/in/harishankar2803'}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-6 rounded-3xl border flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#111A15]/90 border-emerald-900/60 hover:border-emerald-500/60'
              : 'bg-white border-stone-200 hover:border-emerald-600 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
              LinkedIn Profile
            </span>
            <ExternalLink className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold">linkedin.com/in/harishankar2803</p>
            <p className="mt-2 text-xs font-mono text-orange-500 dark:text-amber-400">
              Connect on LinkedIn →
            </p>
          </div>
        </a>

        <a
          href={data.profile.githubUrl || 'https://github.com/harimadav'}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-6 rounded-3xl border flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#111A15]/90 border-emerald-900/60 hover:border-orange-500/60'
              : 'bg-white border-stone-200 hover:border-orange-600 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
              GitHub Profile
            </span>
            <Globe className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold">github.com/harimadav</p>
            <p className="mt-2 text-xs font-mono text-emerald-500 dark:text-emerald-400">
              Explore Code Repositories ↗
            </p>
          </div>
        </a>
      </div>

      {/* Balanced Two-Column Section: Availability Summary + Direct Message Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div
          className={`lg:col-span-4 p-8 rounded-3xl border space-y-6 ${
            isDark
              ? 'bg-[#111A15]/90 border-emerald-900/60'
              : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <h2 className="text-2xl font-display font-bold uppercase tracking-wide">
            {upperName}
          </h2>
          <p
            className={`text-sm leading-[1.8] ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}
          >
            Available for software engineering internships, full-stack web
            development roles, and technical project collaborations.
          </p>

          <div
            className={`pt-4 border-t space-y-3 text-sm ${
              isDark ? 'border-emerald-950/80' : 'border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{data.profile.location || 'Chennai, Tamil Nadu, India'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>B.E. CSE · Rajalakshmi Institute of Technology</span>
            </div>
          </div>
        </div>

        {/* Interactive Database-Backed Contact Form */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            noValidate
            className={`p-8 sm:p-10 rounded-3xl border space-y-6 ${
              isDark
                ? 'bg-[#111A15]/90 border-emerald-900/60'
                : 'bg-white border-stone-200 shadow-sm'
            }`}
          >
            <div>
              <h2 className="text-2xl font-display font-bold">Send a Direct Message</h2>
              <p className="mt-1 text-sm text-stone-400">
                Fill out the form below to send a message directly to {upperName}.
              </p>
            </div>

            {formError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs font-medium text-rose-300"
              >
                {formError}
              </div>
            )}

            {submittedSuccess && (
              <div
                role="status"
                className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center gap-3 text-xs font-medium text-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Your message has been delivered to {upperName}’s inbox.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                >
                  Your Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDark
                      ? 'bg-[#0B110E] border-emerald-900/60 text-white'
                      : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isDark
                      ? 'bg-[#0B110E] border-emerald-900/60 text-white'
                      : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
              >
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Software Engineering Internship / Project Collaboration"
                className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                  isDark
                    ? 'bg-[#0B110E] border-emerald-900/60 text-white'
                    : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                  isDark
                    ? 'bg-[#0B110E] border-emerald-900/60 text-white'
                    : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
