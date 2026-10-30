import Link from "next/link";
import { hotelPartners } from "@/src/data/mockData";

export default function HotelPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-stone-900">Daftar Mitra Hotel</h1>
      <p className="text-stone-600 text-sm">
        Pilih mitra hotel untuk melihat buku besar stok dan konsinyasi:
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {hotelPartners.map((hotel) => (
          <Link
            key={hotel.id}
            href={`/hotel/${hotel.id}`}
            className="p-4 bg-white border border-stone-200 rounded-lg shadow-sm hover:border-emerald-600 transition-colors block"
          >
            <h2 className="font-semibold text-stone-800">{hotel.name}</h2>
            <p className="text-xs text-stone-500 mt-1">{hotel.location}</p>
            <span className="text-xs text-emerald-700 underline mt-2 inline-block">
              Lihat Detail &rarr;
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}