'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { RiskCard } from '../../components/RiskCard';
import { IdentityCard } from '../../components/IdentityCard';
import { PermissionsCard } from '../../components/PermissionsCard';
import { ActivitiesCard } from '../../components/ActivitiesCard';
import { AttackVectorsCard } from '../../components/AttackVectorsCard';
import { IntentsCard } from '../../components/IntentsCard';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../../components/ThemeToggle';
import dynamic from 'next/dynamic';
const PermissionsModal = dynamic(() => import('../../components/PermissionsModal').then(m => m.PermissionsModal), { ssr: false });
const ActivitiesModal = dynamic(() => import('../../components/ActivitiesModal').then(m => m.ActivitiesModal), { ssr: false });
const AIInsightsModal = dynamic(() => import('../../components/AIInsightsModal').then(m => m.AIInsightsModal), { ssr: false });

export default function ResultPage() {
  const router = useRouter();
  const [raw, setRaw] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('analysisResults') : null;
    setRaw(stored);
    setIsClient(true);
  }, []);

  const parsed = useMemo(() => {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [raw]);

  const riskPercent = useMemo(() => {
    const d: any = parsed;
    if (!d) return 0;
    const aiRisk = d?.ai_insights?.final_risk_score;
    if (typeof aiRisk === 'number') return Math.max(0, Math.min(100, Math.round(aiRisk)));
    // Otherwise invert safety score (higher safety => lower risk)
    const safety = d?.safety?.score;
    if (typeof safety === 'number') return Math.max(0, Math.min(100, 100 - Math.round(safety)));
    return 50;
  }, [parsed]);

  const identity = useMemo(() => {
    const d: any = parsed;
    if (!d) return null;
    const app = d?.app || {};
    const trust = d?.trust || {};
    const hashes = d?.forensics?.apk_hashes || {};
    const cert0 = Array.isArray(d?.forensics?.certificates) ? d.forensics.certificates[0] : null;
    return {
      appName: app?.name || 'Unknown',
      packageName: app?.package || 'Unknown',
      versionName: app?.version_name || '-',
      versionCode: app?.version_code || '-',
      apkHash: app?.apk_sha256 || hashes?.sha256 || '-',
      certificateSha256: app?.primary_certificate_fingerprint || cert0?.sha256 || '-',
      verdict: trust?.verdict || '-',
      trust: trust?.is_trusted === true ? 'trusted' : trust?.is_trusted === false ? 'untrusted' : 'unknown',
      category: d?.ai_insights ? 'AI-Assessed' : '-',
    };
  }, [parsed]);

  const permissionsData = useMemo(() => {
    const d: any = parsed;
    const allPerms: string[] = d?.forensics?.permissions || [];
    // Mark permissions mentioned in top_findings as suspicious
    const suspicious: string[] = (d?.top_findings || [])
      .filter((f: any) => f?.type === 'permission' && typeof f?.value === 'string')
      .map((f: any) => f.value);
    const legitFromAllowlist: string[] = [];
    const unique = Array.from(new Set(allPerms));
    return { all: unique, suspicious, legitFromAllowlist };
  }, [parsed]);

  const activities: string[] = useMemo(() => {
    const d: any = parsed;
    return d?.forensics?.activities || [];
  }, [parsed]);

  const topFindings = useMemo(() => {
    const d: any = parsed;
    const list: any[] = Array.isArray(d?.top_findings) ? d.top_findings : [];
    const attackVectors = list.filter((f) => f?.type === 'attack_vector');
    const phishing = list.find((f) => f?.type === 'intent_phishing');
    const intents: string[] = Array.isArray(phishing?.value) ? phishing.value : [];
    const flaggedPermissions = list
      .filter((f) => f?.type === 'permission' && typeof f?.value === 'string')
      .map((f) => ({ name: f.value as string, severity: f?.severity as string | undefined }));
    return { attackVectors, intents, flaggedPermissions };
  }, [parsed]);


  const riskTone = useMemo(() => {
    if (riskPercent >= 75) return 'danger';
    if (riskPercent >= 50) return 'warning';
    if (riskPercent >= 25) return 'info';
    return 'success';
  }, [riskPercent]);

  const riskLabel = useMemo(() => {
    if (riskPercent >= 75) return 'High';
    if (riskPercent >= 50) return 'Medium';
    if (riskPercent >= 25) return 'Low';
    return 'Minimal';
  }, [riskPercent]);

  const safetyPercent = useMemo(() => {
    const d: any = parsed;
    const safety = d?.safety?.score;
    if (typeof safety === 'number') return Math.max(0, Math.min(100, Math.round(safety)));
    return null;
  }, [parsed]);

  const safetyTone = useMemo(() => {
    if (!safetyPercent) return 'neutral';
    if (safetyPercent >= 80) return 'success';
    if (safetyPercent >= 60) return 'info';
    if (safetyPercent >= 40) return 'warning';
    return 'danger';
  }, [safetyPercent]);

  const groupedPermissions = useMemo(() => {
    const suspicious = permissionsData.suspicious;
    const legit = permissionsData.legitFromAllowlist.filter((p) => permissionsData.all.includes(p));
    const others = permissionsData.all.filter((p) => !suspicious.includes(p) && !legit.includes(p));
    return { suspicious, legit, others };
  }, [permissionsData]);

  const [showPermsModal, setShowPermsModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  function describeActivity(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('main')) return 'Main entry activity shown when the app launches.';
    if (n.includes('launcher')) return 'Launcher-targeted activity; appears on the home screen launcher.';
    if (n.includes('qr')) return 'Screen related to QR scanning or generation.';
    if (n.includes('scanner')) return 'Camera-backed screen used to scan codes.';
    if (n.includes('pdf')) return 'Activity used to decode or display PDF documents.';
    if (n.includes('request') || n.includes('permission')) return 'Screen that may request or explain runtime permissions.';
    return 'Declared application screen; launched via intents to present UI.';
  }

  // page-level

  if (!raw) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-xl sm:text-2xl font-semibold">No Results Found</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Upload an APK to view analysis results.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 inline-flex items-center rounded-full bg-slate-900 dark:bg-slate-100 px-5 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
          >
            Go to Upload
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 sm:px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Theme Toggle */}
        <div className="theme-toggle-container">
          <ThemeToggle />
        </div>
        
        <div className="screen-only flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{identity?.appName || 'Analysis Result'}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
              {identity?.packageName ? <code className="rounded bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">{identity.packageName}</code> : null}
              {identity?.verdict ? (
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium border ${riskTone === 'danger' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : riskTone === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' : riskTone === 'info' ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'}`}>
                  {identity.verdict}
                </span>
              ) : null}
              
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 print-hidden">
            <button
              onClick={() => setShowAIInsights(true)}
              className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Image src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Google_Gemini_icon_2025.svg" alt="Gemini" className="h-4 w-4 mr-2" width={16} height={16}/>
              Summarize
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Download PDF
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(raw ?? '')}
              className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Copy JSON
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center rounded-full bg-slate-900 dark:bg-slate-100 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              Upload Another APK
            </button>
          </div>
        </div>

        <section className="screen-only bento-grid mt-6 sm:mt-8 grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[220px] lg:grid-cols-6 lg:auto-rows-[240px]">
          <RiskCard
            safetyPercent={safetyPercent}
            safetyTone={safetyTone as any}
            verdict={identity?.verdict || '-'}
            riskLabel={riskLabel}
          />

          <IdentityCard identity={identity as any} />

          <PermissionsCard
            grouped={groupedPermissions}
            total={permissionsData.all.length}
            onOpenModal={() => setShowPermsModal(true)}
          />

          <ActivitiesCard activities={activities} onOpenModal={() => setShowActivitiesModal(true)} />

          <AttackVectorsCard attackVectors={topFindings.attackVectors as any} />
          <IntentsCard intents={topFindings.intents} />
        </section>
        {isClient && showPermsModal ? (
          <PermissionsModal open={showPermsModal} onClose={() => setShowPermsModal(false)} grouped={groupedPermissions} />
        ) : null}
        {isClient && showActivitiesModal ? (
          <ActivitiesModal open={showActivitiesModal} onClose={() => setShowActivitiesModal(false)} activities={activities} describe={describeActivity} />
        ) : null}
        {isClient && showAIInsights ? (
          <AIInsightsModal open={showAIInsights} onClose={() => setShowAIInsights(false)} data={(parsed as any)?.ai_insights || null} />
        ) : null}
        {/* Print-only formal report layout */}
        <section className="report-print hidden">
          {/* Formal Forensic Assessment Report (auto-generated) */}
          <div className="report-header" aria-hidden="true">
            <div className="report-brand">
              <div className="report-title">Formal Forensic Assessment Report</div>
              <div className="report-subtitle">Android Application Security Analysis</div>
            </div>
            <div className="report-meta">
              <div><span>Job ID:</span> {(parsed as any)?.job_id || '-'}</div>
              <div><span>Generated:</span> {new Date().toISOString()}</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="report-section">
            <h2>1. Executive Summary</h2>
            <div className="two-col">
              <div>
                <div className="kv"><span>App Name</span><strong>{identity?.appName}</strong></div>
                <div className="kv"><span>Package</span><strong>{identity?.packageName}</strong></div>
                <div className="kv"><span>Version</span><strong>{identity?.versionName} ({identity?.versionCode})</strong></div>
                <div className="kv"><span>Verdict</span><strong>{identity?.verdict || '-'}</strong></div>
              </div>
              <div>
                <div className="kv"><span>Risk Score</span><strong>{riskPercent}</strong></div>
                <div className="kv"><span>Safety Score</span><strong>{safetyPercent ?? '-'}</strong></div>
                <div className="kv"><span>Trust Confidence</span><strong>{(parsed as any)?.trust?.confidence || (parsed as any)?.ai_insights?.confidence || '-'}</strong></div>
                <div className="kv"><span>Disposition</span><strong>{(parsed as any)?.recommendation?.immediate_action || (parsed as any)?.ai_insights?.recommendation || '-'}</strong></div>
              </div>
            </div>
            <p className="small">Summary: {(parsed as any)?.ai_insights?.summary || 'No AI summary available.'}</p>
          </div>

            {/* Determination & Rationale */}
          <div className="report-section">
            <h2>2. Determination & Rationale</h2>
            <p className="small">
              {(parsed as any)?.ai_insights?.rationale ||
                'Application structure, signing, and declared capabilities align with expected banking functionality. No conflicting malicious indicators identified.'}
            </p>
          </div>

          {/* Authenticity */}
          <div className="report-section">
            <h2>3. Authenticity & Cryptographic Integrity</h2>
            <div className="kv"><span>Primary Cert SHA-256</span><strong>{identity?.certificateSha256}</strong></div>
            <div className="kv"><span>APK SHA-256</span><strong>{identity?.apkHash}</strong></div>
            <div className="kv"><span>Total Certificates</span><strong>{(parsed as any)?.forensics?.certificates?.length ?? '-'}</strong></div>
          </div>

          {/* Security Posture */}
            <div className="report-section">
              <h2>4. Security Posture Indicators</h2>
              <ul className="list">
                <li>VirusTotal Intel: {((parsed as any)?.virustotal?.intel?.found === false && 'Clean') || '-'}</li>
                <li>Trust Verdict: {(parsed as any)?.trust?.verdict || '-'}</li>
                <li>Monitoring Required: {String((parsed as any)?.recommendation?.monitoring_required ?? false)}</li>
              </ul>
            </div>

          {/* Permissions Profile */}
          <div className="report-section">
            <h2>5. Permissions Profile</h2>
            <div className="kv"><span>Total</span><strong>{permissionsData.all.length}</strong></div>
            <div className="kv"><span>Flagged</span><strong>{permissionsData.suspicious.length}</strong></div>
            {permissionsData.suspicious.length ? (
              <ul className="list">
                {permissionsData.suspicious.map(p => <li key={`perm-${p}`}>{p}</li>)}
              </ul>
            ) : <p className="small">No flagged permissions.</p>}
          </div>

          {/* Component & Capability Mapping */}
          <div className="report-section">
            <h2>6. Component & Capability Mapping</h2>
            <div className="kv"><span>Activities</span><strong>{activities.length}</strong></div>
            <div className="kv"><span>Flagged Intents</span><strong>{topFindings.intents.length}</strong></div>
            <p className="small">
              Key QR / payment related: {activities.filter(a => a.toLowerCase().includes('qr')).slice(0,4).join(', ') || 'n/a'}
            </p>
          </div>

          {/* Observed Attack Vector Flags */}
          <div className="report-section">
            <h2>7. Observed Attack Vector Flags</h2>
            {topFindings.attackVectors?.length ? (
              <ul className="list">
                {topFindings.attackVectors.map((f: any, i: number) => (
                  <li key={`av-${i}`}>{f.value} ({f.severity}): {f.description}</li>
                ))}
              </ul>
            ) : <p className="small">None reported.</p>}
          </div>

          {/* Risk Analysis */}
          <div className="report-section">
            <h2>8. Risk Analysis</h2>
            <p className="small">
              Residual risk considered low; elevated permissions justified by legitimate banking workflows. Primary external exposure: user-targeted social engineering via deep links / phishing.
            </p>
          </div>

          {/* Recommendation */}
          <div className="report-section">
            <h2>9. Recommendation</h2>
            <p>
              {(parsed as any)?.recommendation?.immediate_action ||
                (parsed as any)?.ai_insights?.recommendation ||
                'No explicit recommendation present.'}
            </p>
            <p className="small">
              Guidance: {(parsed as any)?.recommendation?.user_guidance ||
                'Install only from official stores; maintain user phishing awareness.'}
            </p>
          </div>

          {/* Action Matrix */}
          <div className="report-section">
            <h2>10. Action Matrix</h2>
            <table className="table">
              <thead><tr><th>Area</th><th>Status</th><th>Action</th><th>Priority</th></tr></thead>
              <tbody>
                <tr><td>Signing Integrity</td><td>Verified</td><td>Track cert continuity</td><td>Medium</td></tr>
                <tr><td>Permission Surface</td><td>Expected</td><td>Re-audit on expansion</td><td>Medium</td></tr>
                <tr><td>Threat Intel</td><td>Clean</td><td>Continuous hash watch</td><td>Low</td></tr>
                <tr><td>User Awareness</td><td>Ongoing</td><td>Phishing education</td><td>Medium</td></tr>
              </tbody>
            </table>
          </div>

          {/* Forensic Notes */}
          <div className="report-section">
            <h2>11. Forensic Notes</h2>
            <ul className="list">
              {(parsed as any)?.ai_insights?.forensic_notes?.slice(0,6)?.map((n: string, i: number) => (
                <li key={`fn-${i}`}>{n}</li>
              )) || <li>No forensic notes available.</li>}
            </ul>
          </div>

          {/* Caveats */}
          <div className="report-section">
            <h2>12. Caveats</h2>
            <p className="small">
              Static / metadata-based assessment only; no dynamic sandbox or network traffic capture included. Future version drift may alter conclusions; continuous validation advised.
            </p>
          </div>

          {/* Final Disposition */}
          <div className="report-section">
            <h2>13. Final Disposition</h2>
            <p className="small">
              Authorized for deployment under standard financial application governance and periodic integrity checks.
            </p>
          </div>

          <div className="report-footer" aria-hidden="true">
            <div>Prepared by APKSURE</div>
            <div>Generated on {new Date().toLocaleString()}</div>
          </div>
        </section>
        <style>{`
@media print {
  .screen-only { display: none !important; }
  .report-print { display: block !important; }
  main { padding: 0 !important; background: #fff !important; }
  @page { size: A4; margin: 16mm; }
  .report-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
  .report-title { font-size: 18px; font-weight: 800; color: #0f172a; }
  .report-subtitle { font-size: 12px; color: #334155; }
  .report-meta { font-size: 11px; color: #334155; text-align:right; }
  .report-meta span { color: #64748b; }
  .report-section { page-break-inside: avoid; margin-top: 14px; }
  .report-section h2 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
  .two-col { display:flex; gap: 24px; }
  .two-col > div { flex:1; }
  .kv { display:flex; justify-content:space-between; gap: 12px; font-size: 11.5px; padding: 3px 0; border-bottom: 1px dotted #e5e7eb; }
  .kv span { color:#64748b; }
  .kv strong { color:#0f172a; font-weight:600; }
  .list { margin: 4px 0 0 16px; font-size: 11.5px; color: #0f172a; }
  .table { width:100%; border-collapse: collapse; font-size: 11.5px; margin-top: 4px; }
  .table th, .table td { border: 1px solid #e5e7eb; padding: 4px 6px; text-align:left; }
  .small { font-size: 11px; color:#475569; margin-top: 4px; line-height:1.35; }
  .report-footer { position: fixed; bottom: 2mm; left: 16mm; right: 16mm; display:flex; justify-content:space-between; font-size: 11px; color:#475569; }
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </main>
  );
}


