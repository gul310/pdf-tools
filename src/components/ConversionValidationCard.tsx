import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  RotateCcw,
  Copy,
  Check,
  Layers
} from 'lucide-react';
import type { ValidationResult } from '../utils/conversionValidator';
import type { FileIntegrityRecord } from '../utils/fileIntegrity';
import { downloadOriginalFile } from '../utils/fileIntegrity';

interface ConversionValidationCardProps {
  validationResult: ValidationResult | null;
  integrityRecord: FileIntegrityRecord | null;
  originalFile: File | null;
  outputFilename: string;
  onDownloadConverted: () => void;
  onReset: () => void;
}

export const ConversionValidationCard: React.FC<ConversionValidationCardProps> = ({
  validationResult,
  integrityRecord,
  originalFile,
  outputFilename,
  onDownloadConverted,
  onReset
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    if (!integrityRecord) return;
    navigator.clipboard.writeText(integrityRecord.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const status = validationResult?.status || 'High Fidelity';

  const statusConfig = {
    'High Fidelity': {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badgeBg: 'bg-emerald-600',
      icon: CheckCircle2,
      label: 'High Fidelity'
    },
    'Partial Fidelity': {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badgeBg: 'bg-amber-600',
      icon: AlertTriangle,
      label: 'Partial Fidelity'
    },
    'Visual Only': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      badgeBg: 'bg-blue-600',
      icon: Layers,
      label: 'Exact Visual'
    },
    'Conversion Warning': {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badgeBg: 'bg-red-600',
      icon: AlertTriangle,
      label: 'Conversion Warning'
    }
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quality Status Header */}
      <div className={`p-6 rounded-2xl border ${statusConfig.bg} ${statusConfig.border} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ${statusConfig.badgeBg}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusConfig.label}</span>
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {validationResult?.summary || 'Output binary successfully validated.'}
            </span>
          </div>

          {validationResult?.details.outputSizeBytes && (
            <span className="text-xs text-slate-500 font-medium">
              Output: {(validationResult.details.outputSizeBytes / 1024).toFixed(1)} KB
            </span>
          )}
        </div>

        {/* Structural Metrics */}
        {validationResult?.details.outputCount !== undefined && (
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="font-semibold text-slate-900">Structure Verified:</span>
            <span>
              {validationResult.details.outputCount} {validationResult.details.countLabel || 'elements'}
              {validationResult.details.sourceCount !== undefined &&
                ` (Source: ${validationResult.details.sourceCount})`}
            </span>
          </div>
        )}

        {/* Disclosures & Warnings */}
        {validationResult?.details.disclosures && validationResult.details.disclosures.length > 0 && (
          <div className="space-y-1 pt-1">
            {validationResult.details.disclosures.map((disc, idx) => (
              <p key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>{disc}</span>
              </p>
            ))}
          </div>
        )}

        {validationResult?.details.warnings && validationResult.details.warnings.length > 0 && (
          <div className="space-y-1 pt-1">
            {validationResult.details.warnings.map((warn, idx) => (
              <p key={idx} className="text-xs text-amber-700 flex items-start gap-1.5 leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{warn}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Original File Integrity Vault Badge */}
      {integrityRecord && (
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Original File Cryptographically Intact</p>
              <p className="text-slate-500 font-mono text-[11px]">
                SHA-256: {integrityRecord.shortHash}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyHash}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
            title="Copy full SHA-256 hash"
          >
            {copiedHash ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Checksum</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Dual Download Actions */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onDownloadConverted}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-base"
        >
          <Download className="w-5 h-5" />
          <span>Download Converted File ({outputFilename})</span>
        </button>

        <div className="flex items-center justify-between gap-3">
          {originalFile && (
            <button
              type="button"
              onClick={() => downloadOriginalFile(originalFile)}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download Verified Original ({originalFile.name})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 transition flex items-center gap-1.5 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Convert Another File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
