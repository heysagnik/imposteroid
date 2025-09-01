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

  const consensus = useMemo(() => {
    const d: any = parsed;
    return {
      score: null,
      confidence: d?.trust?.confidence || d?.ai_insights?.confidence || '-',
      weights: null,
      methodScores: null,
    };
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
          <div className="report-header" aria-hidden="true">
            <div className="report-brand">
              <div className="report-title">Security Analysis Report</div>
              <div className="report-subtitle">Android Application Assessment</div>
            </div>
            <div className="report-meta">
              <div><span>Job ID:</span> {(parsed as any)?.job_id || '-'}</div>
              <div><span>Generated:</span> {(parsed as any)?.timestamp || new Date().toISOString()}</div>
            </div>
          </div>

          <div className="report-section">
            <h2>Executive Summary</h2>
            <div className="two-col">
              <div>
                <div className="kv"><span>Final Verdict</span><strong>{(parsed as any)?.final_synthesis?.verdict || (parsed as any)?.analysis_summary?.final_verdict || identity?.verdict || '-'}</strong></div>
                <div className="kv"><span>Risk Level</span><strong>{(parsed as any)?.analysis_summary?.risk_level || (parsed as any)?.risk_assessment?.risk_level || '-'}</strong></div>
                <div className="kv"><span>Confidence</span><strong>{(parsed as any)?.analysis_summary?.confidence || (parsed as any)?.risk_assessment?.confidence || consensus.confidence || '-'}</strong></div>
                <div className="kv"><span>Consensus Score</span><strong>{consensus?.score != null ? `${Math.round((consensus.score as number) * 100)}%` : '-'}</strong></div>
              </div>
              <div>
                <div className="kv"><span>App Name</span><strong>{identity?.appName}</strong></div>
                <div className="kv"><span>Package</span><strong>{identity?.packageName}</strong></div>
                <div className="kv"><span>Version</span><strong>{identity?.versionName} ({identity?.versionCode})</strong></div>
                <div className="kv"><span>Category</span><strong>{identity?.category}</strong></div>
              </div>
            </div>
            <p className="note">This report summarizes static and behavioral indicators with trust verification and consensus analysis to support official decision-making.</p>
          </div>

          <div className="report-section">
            <h2>Identity & Trust Verification</h2>
            <div className="kv"><span>Trust Verdict</span><strong>{(parsed as any)?.trust_verification?.verdict || '-'}</strong></div>
            <div className="kv"><span>Trusted</span><strong>{(parsed as any)?.trust_verification?.is_trusted === true ? 'Yes' : (parsed as any)?.trust_verification?.is_trusted === false ? 'No' : '-'}</strong></div>
            <div className="kv"><span>Certificate SHA-256</span><strong>{identity?.certificateSha256}</strong></div>
            <div className="kv"><span>APK SHA-256</span><strong>{identity?.apkHash}</strong></div>
            <div className="small">Details: {(parsed as any)?.trust_verification?.description || '-'}</div>
          </div>

          <div className="report-section">
            <h2>Permissions Overview</h2>
            <div className="kv"><span>Total Permissions</span><strong>{permissionsData.all.length}</strong></div>
            <div className="kv"><span>Suspicious Permissions</span><strong>{(parsed as any)?.static_analysis?.metadata?.suspicious_permissions?.length ?? 0}</strong></div>
            {(parsed as any)?.static_analysis?.metadata?.suspicious_permissions?.length ? (
              <ul className="list">
                {(parsed as any)?.static_analysis?.metadata?.suspicious_permissions.map((p: string) => (
                  <li key={`rp-${p}`}>{p}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="report-section">
            <h2>Behavioral Analysis</h2>
            <div className="kv"><span>Behavioral Score</span><strong>-</strong></div>
            <div className="kv"><span>Intent Anomalies</span><strong>{topFindings.intents?.length ?? '-'}</strong></div>
            <h3 className="mt-3">Key Findings</h3>
            <ul className="list">
              {topFindings.attackVectors?.map((f: any, idx: number) => (
                <li key={`bf-${idx}`}>{f?.value}: {f?.description}</li>
              ))}
            </ul>
          </div>

          <div className="report-section">
            <h2>Consensus Analysis</h2>
            <table className="table">
              <thead><tr><th>Method</th><th>Score</th></tr></thead>
              <tbody>
                <tr><td>Static</td><td>{(parsed as any)?.consensus_analysis?.method_scores?.static != null ? `${Math.round((parsed as any).consensus_analysis.method_scores.static * 100)}%` : '-'}</td></tr>
                <tr><td>Behavioral</td><td>{(parsed as any)?.consensus_analysis?.method_scores?.behavioral != null ? `${Math.round((parsed as any).consensus_analysis.method_scores.behavioral * 100)}%` : '-'}</td></tr>
                <tr><td>Trust</td><td>{(parsed as any)?.consensus_analysis?.method_scores?.trust != null ? `${Math.round((parsed as any).consensus_analysis.method_scores.trust * 100)}%` : '-'}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h2>Static Analysis Summary</h2>
            <div className="kv"><span>Total Activities</span><strong>{(parsed as any)?.static_analysis?.metadata?.total_activities ?? activities.length}</strong></div>
            <div className="kv"><span>Total Services</span><strong>{(parsed as any)?.static_analysis?.metadata?.total_services ?? '-'}</strong></div>
            <div className="kv"><span>Total Receivers</span><strong>{(parsed as any)?.static_analysis?.metadata?.total_receivers ?? '-'}</strong></div>
            <div className="kv"><span>Total Certificates</span><strong>{(parsed as any)?.static_analysis?.metadata?.total_certificates ?? '-'}</strong></div>
          </div>

          <div className="report-section">
            <h2>Final Recommendation</h2>
            <p>{(parsed as any)?.recommendations?.immediate_action || (parsed as any)?.final_synthesis?.action || 'No recommendation available'}</p>
            <div className="small">Reasoning: {((parsed as any)?.final_synthesis?.reasons || []).join(', ') || '-'}</div>
          </div>

          <div className="report-footer" aria-hidden="true">
            <div>Prepared by Imposteroid Automated Analysis</div>
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
  .report-section h2 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; }
  .report-section h3 { font-size: 12px; font-weight: 700; color: #0f172a; }
  .two-col { display:flex; gap: 24px; }
  .two-col > div { flex:1; }
  .kv { display:flex; justify-content:space-between; gap: 16px; font-size: 12px; padding: 4px 0; border-bottom: 1px dotted #e5e7eb; }
  .kv span { color:#64748b; }
  .kv strong { color:#0f172a; }
  .list { margin: 6px 0 0 16px; font-size: 12px; color: #0f172a; }
  .table { width:100%; border-collapse: collapse; font-size: 12px; }
  .table th, .table td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align:left; }
  .small { font-size: 11px; color:#475569; margin-top: 4px; }
  .report-footer { position: fixed; bottom: 8mm; left: 16mm; right: 16mm; display:flex; justify-content:space-between; font-size: 11px; color:#475569; }
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </main>
  );
}


