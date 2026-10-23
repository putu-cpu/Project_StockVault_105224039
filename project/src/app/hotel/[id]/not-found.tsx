import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function HotelNotFound() {
  return (
    <div className="min-h-screen bg-[#f4f5f1] text-[#242923] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg border border-stone-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h1 className="font-serif text-2xl font-medium text-stone-900">
          Hotel Partner Tidak Ditemukan
        </h1>
        <p className="text-sm text-stone-600">
          Parameter ID hotel yang dimasukkan tidak terdaftar dalam direktori mitra resmi CV. Alam Zempol.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold bg-[#255d45] hover:bg-[#194c36] text-white px-4 py-2.5 rounded-md transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard Utama
          </Link>
        </div>
      </div>
    </div>
  );
}

