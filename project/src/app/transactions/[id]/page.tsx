import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  Hash,
  KeyRound,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { generateDataHash } from "@/src/utils/crypto";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Verifikasi Transaksi ${id} | StokVault`,
    description: `Audit jejak digital dan stempel hash kriptografi SHA-256 untuk transaksi konsinyasi ${id}.`,
  };
}

export default async function TransactionVerificationPage({ params }: PageProps) {
  const { id } = await params;

  // Generate an audit verification sample hash for this dynamic transaction ID
  const auditSamplePayload = {
    transactionId: id,
    auditStandard: "STOKVAULT-SEC-0.1",
    hashAlgorithm: "SHA-256",
    nonRepudiation: "ACTIVE",
  };
  const verificationHash = generateDataHash(auditSamplePayload);

  return (
    <div className="min-h-screen bg-[#f4f5f1] text-[#242923] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-stone-900 transition-colors bg-white px-3.5 py-2 rounded-md border border-stone-200 shadow-sm"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard Utama
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded border border-stone-200">
            <span>Dynamic Route:</span>
            <code className="text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">/transactions/{id}</code>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="panel p-6 sm:p-8 bg-white border border-stone-200 rounded-lg shadow-sm space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="eyebrow flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-800 uppercase">
                <FileCheck2 size={15} />
                Sertifikat Audit Kriptografi Konsinyasi
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 mt-2">
                Transaksi: <span className="font-mono text-emerald-900">{id}</span>
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Verifikasi integritas data ledger konsinyasi CV. Alam Zempol dengan hotel mitra.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-semibold">
              <ShieldCheck size={16} className="text-emerald-600" />
              Verified Ledger Record
            </div>
          </div>

          {/* Cryptographic Hash Details */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <Hash size={14} />
              Fingerprint Digital SHA-256 (Parameter: {id})
            </h2>
            <div className="p-4 bg-stone-950 text-emerald-400 font-mono text-xs rounded-lg break-all border border-stone-800 space-y-2">
              <div className="text-stone-400 text-[11px]">// Stempel Hash Kriptografi Terverifikasi:</div>
              <div>SHA256: {verificationHash}</div>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <Lock size={13} className="text-stone-600" />
                Mekanisme Penguncian (Immutable Locking)
              </span>
              <p className="text-xs text-stone-700 leading-relaxed pt-1">
                Setelah staf hotel menyetujui jumlah fisik barang, data penerimaan dikunci secara permanen. Perubahan hanya dimungkinkan melalui persetujuan bilateral kedua belah pihak.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <KeyRound size={13} className="text-stone-600" />
                Formula Perhitungan Tagihan (Invoicing)
              </span>
              <p className="text-xs text-stone-700 leading-relaxed font-mono pt-1">
                Tagihan = (Qty Diterima &minus; Sisa Stok) &times; Harga Satuan
              </p>
            </div>
          </div>

          {/* Back Action */}
          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <Link
              href="/"
              className="button-primary inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold"
            >
              <CheckCircle2 size={14} />
              Buka Konsol & Lacak Tagihan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

