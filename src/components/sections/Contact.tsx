import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  MapPin,
  ArrowUpRight,
  FileText,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa6';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { Reveal } from '../common/Reveal';
import { Magnetic } from '../common/Magnetic';
import { SpotlightHeading } from '../common/SpotlightHeading';

export const Contact: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setErrorMessage('Please fill in all fields before sending.');
      return;
    }

    // RFC-compliant email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
    if (!accessKey) {
      setErrorMessage(
        'Submission failed: Contact service access key is not configured. Please contact me directly via email.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
          subject: `Portfolio inquiry from ${trimmedName}`,
          from_name: trimmedName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setErrorMessage('');
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        const errorMsg =
          data?.message ||
          'Failed to send message. Please try again or reach out directly via email.';
        setErrorMessage(errorMsg);
      }
    } catch {
      setErrorMessage(
        'Network error: Unable to reach the server. Please check your connection or email me directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative overflow-hidden section-content-visibility">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-primary/10 blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-content mx-auto px-6 md:px-10">
        {/* Section tag */}
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs md:text-sm text-primary tracking-widest font-semibold uppercase">
              06 — CONTACT
            </span>
            <div className="h-[1px] w-12 bg-primary/40" />
          </div>
        </Reveal>

        {/* Huge Heading: LET'S BUILD / TOGETHER with SpotlightHeading */}
        <div className="mb-16 select-none flex flex-col gap-2">
          <SpotlightHeading
            text="LET'S BUILD"
            as="h2"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none"
            spotlightRadius={180}
          />
          <SpotlightHeading
            text="TOGETHER"
            as="h2"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none"
            spotlightRadius={180}
          />
        </div>

        {/* Two Columns: Form on Left, Contact info on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Contact Form */}
          <div className="lg:col-span-7">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="p-6 sm:p-8 rounded-card bg-surface border border-border/80 shadow-[0_16px_36px_rgba(0,0,0,0.25)] space-y-6"
            >
              {/* Name Field */}
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  disabled={isSubmitting}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-background border border-border text-text text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="name"
                  className="absolute left-4 top-2 font-mono text-xs text-secondary pointer-events-none transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-secondary/70 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
                >
                  Your name
                </label>
              </div>

              {/* Email Field */}
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  disabled={isSubmitting}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-background border border-border text-text text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-2 font-mono text-xs text-secondary pointer-events-none transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-secondary/70 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
                >
                  Your email
                </label>
              </div>

              {/* Message Field */}
              <div className="relative group">
                <textarea
                  id="message"
                  name="message"
                  required
                  disabled={isSubmitting}
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 rounded-xl bg-background border border-border text-text text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-200 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="message"
                  className="absolute left-4 top-2 font-mono text-xs text-secondary pointer-events-none transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-secondary/70 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
                >
                  Tell me about your project or role
                </label>
              </div>

              {/* Success Alert Banner */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-2.5"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Thank you! Your message has been sent successfully. I'll get back to you soon.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Alert Banner */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono text-xs flex items-center gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Magnetic Submit Button with Morph */}
              <div className="pt-2">
                <Magnetic maxDistance={10}>
                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-pill font-heading font-semibold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 ${
                      isSuccess
                        ? 'bg-[#10B981] text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
                        : 'bg-primary text-white dark:text-[#0F1117] shadow-[0_4px_24px_rgba(183,156,255,0.35)] hover:shadow-[0_6px_32px_rgba(183,156,255,0.5)] hover:brightness-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {isSuccess ? (
                        <motion.span
                          key="success"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          <span>Message Sent!</span>
                        </motion.span>
                      ) : isSubmitting ? (
                        <motion.span
                          key="submitting"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          <span>Sending...</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <span>Send message</span>
                          <span className="text-lg">→</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </Magnetic>
              </div>
            </motion.form>
          </div>

          {/* Right: Reach Me & Social & CV */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
            {/* REACH ME column */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-4 font-semibold">
                REACH ME
              </h3>
              <div className="space-y-4">
                <a
                  href={`mailto:${PERSONAL_INFO.email}`}
                  className="flex items-center gap-3 text-secondary hover:text-text transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary group-hover:border-primary transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-secondary/70 block">Email</span>
                    <span className="font-mono text-sm text-text group-hover:text-primary transition-colors">
                      {PERSONAL_INFO.email}
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-3 text-secondary">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-secondary/70 block">Location</span>
                    <span className="font-sans text-sm text-text">{PERSONAL_INFO.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SOCIAL column */}
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-4 font-semibold">
                SOCIAL
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: 'GitHub',
                    url: PERSONAL_INFO.github,
                    icon: <SiGithub className="w-4 h-4" />,
                  },
                  {
                    name: 'LinkedIn',
                    url: PERSONAL_INFO.linkedin,
                    icon: <FaLinkedin className="w-4 h-4" />,
                  },
                  {
                    name: 'Email Directly',
                    url: `mailto:${PERSONAL_INFO.email}`,
                    icon: <Mail className="w-4 h-4" />,
                  },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-mono text-sm text-secondary hover:text-text relative py-1"
                  >
                    <span>{s.icon}</span>
                    <span>{s.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-secondary group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    {/* Hover drawing underline */}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300" />
                  </a>
                ))}
              </div>
            </div>

            {/* Download CV Link */}
            <div className="pt-4 border-t border-border/60">
              <Magnetic maxDistance={8}>
                <a
                  href={PERSONAL_INFO.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="Ziad_Gamal_CV.pdf"
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-pill border border-border bg-surface/50 hover:border-primary text-text font-mono text-xs tracking-wider transition-all duration-200"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Download Curriculum Vitae</span>
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
