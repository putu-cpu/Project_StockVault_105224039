"use client";


import { useId, useState } from "react";


export default function KolomCatatan({ label }: { label: string }) {
  const id = useId();
  const [catatan, setCatatan] = useState("");

  return (
    <div className="rounded border border-dashed p-3 text-sm">
      <label htmlFor={id} className="font-medium">{label}</label>
      <input id={id} value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        className="mt-1 block w-full rounded border px-2 py-1" />
    </div>
  );
}