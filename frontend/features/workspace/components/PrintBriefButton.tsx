"use client";

import { FileDown } from "lucide-react";


export function PrintBriefButton() {
  return (
    <button className="brief-print-button" onClick={() => window.print()} type="button">
      <FileDown aria-hidden="true" />
      Imprimer / enregistrer en PDF
    </button>
  );
}
