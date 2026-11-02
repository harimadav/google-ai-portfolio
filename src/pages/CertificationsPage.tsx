import React, { useState } from 'react';
import { FileCheck2, ExternalLink, Eye, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { CertificationItem } from '../types/portfolio.ts';

export const CertificationsPage: React.FC = () => {
  const { data, theme } = usePortfolio();
  const isDark = theme === 'dark';
  const upperName = (data.profile.name || 'S HARI SHANKAR').toUpperCase();
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-mono uppercase tracking-wider text-orange-500 dark:text-amber-400">
          {upperName} · Verified Credentials
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-display font-bold tracking-tight text-balance">
          Certifications & Specialized Training
        </h1>
        <p
          className={`mt-4 text-base sm:text-lg leading-[1.8] ${
            isDark ? 'text-stone-300' : 'text-stone-600'
          }`}
        >
          Professional and academic certifications completed across Robotic Process
          Automation, Geospatial Image Analysis, Algorithms, and Database Systems.
        </p>
      </div>

      {/* Certifications Grid (Unnumbered) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.certifications.map((cert) => (
          <article
            key={cert.id}
            className={`p-8 rounded-3xl border flex flex-col justify-between ${
              isDark
                ? 'bg-[#111A15]/90 border-emerald-900/60'
                : 'bg-white border-stone-200 shadow-sm'
            }`}
          >
            <div>
              <div
                className={`flex items-center justify-between gap-2 text-xs font-mono border-b pb-4 ${
                  isDark ? 'border-emerald-950/80 text-stone-400' : 'border-stone-200 text-stone-500'
                }`}
              >
                <span className="text-emerald-500 dark:text-emerald-400 font-semibold">
                  {cert.issuer}
                </span>
                <span className="tabular-nums">{cert.completionDate}</span>
              </div>

              {cert.thumbnailStoragePath && (
                <div className="mt-4 h-44 rounded-2xl overflow-hidden border border-emerald-900/50 bg-stone-950">
                  <img
                    src={cert.thumbnailStoragePath}
                    alt={cert.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h2 className="mt-5 text-xl sm:text-2xl font-display font-bold">
                {cert.title}
              </h2>

              <p
                className={`mt-3 text-base leading-[1.8] ${
                  isDark ? 'text-stone-300' : 'text-stone-600'
                }`}
              >
                {cert.description}
              </p>
            </div>

            <div
              className={`mt-8 pt-4 border-t flex flex-wrap items-center justify-between gap-4 ${
                isDark ? 'border-emerald-950/70' : 'border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {cert.credentialId
                    ? `Credential ID: ${cert.credentialId}`
                    : 'Verified Completion'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCert(cert)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Document</span>
                </button>

                <a
                  href={cert.fileStoragePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
                    isDark
                      ? 'border-emerald-900 text-stone-300 hover:text-white hover:border-emerald-600'
                      : 'border-stone-300 text-stone-700 hover:text-stone-950'
                  }`}
                >
                  <span>Open File</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Accessible Certificate Viewer Modal */}
      {selectedCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Certificate Viewer: ${selectedCert.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            className={`w-full max-w-4xl h-[82vh] rounded-2xl border flex flex-col overflow-hidden ${
              isDark ? 'bg-[#111A15] border-emerald-900' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-950/60">
              <div>
                <h3 className="text-base font-display font-bold">
                  {selectedCert.title}
                </h3>
                <p className="text-xs text-stone-400">
                  {selectedCert.issuer} · {selectedCert.completionDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={selectedCert.fileStoragePath}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                >
                  Download Copy
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  aria-label="Close certificate viewer"
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-stone-950">
              {selectedCert.fileStoragePath.match(/\.(png|jpg|jpeg|webp)$/i) ? (
                <div className="w-full h-full flex items-center justify-center p-6">
                  <img
                    src={selectedCert.fileStoragePath}
                    alt={selectedCert.title}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain rounded"
                  />
                </div>
              ) : (
                <iframe
                  src={selectedCert.fileStoragePath}
                  title={selectedCert.title}
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
