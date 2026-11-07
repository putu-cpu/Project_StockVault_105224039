import KolomCatatan from "../../components/KolomCatatan";
export default function LayoutHotel({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4">
      {/* Panggil komponen ini */}
      <KolomCatatan label="Catatan di layout" />
      <div className="mt-4">{children}</div>
    </div>
  );
}