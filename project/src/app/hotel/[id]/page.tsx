import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  KeyRound,
  MapPin,
  Package,
  ShieldCheck,
} from "lucide-react";
import { catalog, formatIDR, hotelPartners } from "@/src/data/mockData";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return hotelPartners.map((hotel) => ({
    id: hotel.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const hotel = hotelPartners.find((entry) => entry.id === id);

  if (!hotel) {
    return {
      title: "Hotel Partner Not Found | StokVault",
    };
  }

  return {
    title: `${hotel.name} — Hotel Partner Ledger | StokVault`,
    description: `Consignment ledger, stock integrity, and verified supply profile for ${hotel.name} (${hotel.location}).`,
  };
}

export default async function HotelPartnerPage({ params }: PageProps) {
  const { id } = await params;
  const hotel = hotelPartners.find((entry) => entry.id === id);

  if (!hotel) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f4f5f1] text-[#242923] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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
            <code className="text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">/hotel/{id}</code>
          </div>
        </div>

        {/* Hero Card */}
        <div className="panel p-6 sm:p-8 space-y-6 bg-white border border-stone-200 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="eyebrow flex items-center gap-2 text-xs font-bold tracking-wider text-stone-500 uppercase">
                <Building2 size={14} className="text-emerald-700" />
                Hotel Partner Profile &middot; StokVault
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium">
                {hotel.name}
              </h1>
              <p className="flex items-center gap-2 text-sm text-stone-600">
                <MapPin size={15} className="text-stone-400" />
                {hotel.location}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck size={14} className="text-emerald-600" />
                SHA-256 Ledger Active
              </span>
              <span className="text-xs text-stone-400 font-mono">Partner Param ID: {id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 block">Workspace Isolation</span>
              <strong className="text-base font-semibold text-stone-800 mt-1 block">Private & Isolated</strong>
              <span className="text-xs text-stone-500 mt-1 block">Folder data khusus mitra</span>
            </div>
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 block">Kemitraan Pemasok</span>
              <strong className="text-base font-semibold text-stone-800 mt-1 block">CV. Alam Zempol</strong>
              <span className="text-xs text-stone-500 mt-1 block">Amenitas & Perawatan Organik</span>
            </div>
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 block">Invoicing Status</span>
              <strong className="text-base font-semibold text-emerald-700 mt-1 block">Automated Opname</strong>
              <span className="text-xs text-stone-500 mt-1 block">Tagihan berbasis sisa stok riil</span>
            </div>
          </div>
        </div>

        {/* Supplied Catalog Panel */}
        <div className="panel overflow-hidden bg-white border border-stone-200 rounded-lg shadow-sm">
          <div className="panel-heading p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-medium text-stone-900">
                Katalog Produk Master yang Dialokasikan
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Produk CV. Alam Zempol yang tersedia untuk pemesanan konsinyasi oleh {hotel.name}.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 rounded text-stone-700">
              {catalog.length} Produk Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs text-stone-600 uppercase">
                <tr>
                  <th scope="col" className="p-3.5 pl-5">Produk</th>
                  <th scope="col" className="p-3.5">Kategori</th>
                  <th scope="col" className="p-3.5">Kemasan</th>
                  <th scope="col" className="p-3.5 pr-5 text-right">Harga Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {catalog.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 pl-5 font-medium text-stone-900 flex items-center gap-2">
                      <Package size={16} className="text-stone-400" />
                      {item.name}
                    </td>
                    <td className="p-3.5 text-stone-600">
                      <span className="inline-block text-[11px] font-medium bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-600">{item.size}</td>
                    <td className="p-3.5 pr-5 text-right font-semibold text-stone-800">
                      {formatIDR(item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security / Cryptography Guarantee Panel */}
        <div className="p-5 bg-emerald-950 text-emerald-100 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <KeyRound size={22} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Immutable Cryptographic Guarantee</h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Setiap penerimaan stok di {hotel.name} diverifikasi dan dikunci dengan hash SHA-256 permanen untuk mencegah sengketa tagihan.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="shrink-0 text-xs font-semibold px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors"
          >
            Masuk ke Konsol
          </Link>
        </div>
      </div>
    </div>
  );
}

