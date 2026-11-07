import KolomCatatan from "../../components/KolomCatatan";

export default function TemplateHotel({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 border border-blue-500 my-2">
      {/* Panggil komponen ini */}
      <KolomCatatan label="Catatan di template" />
      <div className="mt-4">{children}</div>
    </div>
  );
}