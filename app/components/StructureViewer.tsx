"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize } from "lucide-react";

export function StructureViewer({
  uniprotId,
  pdbId,
}: {
  uniprotId?: string;
  pdbId?: string;
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [afUrl, setAfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Add CSS
    if (!document.getElementById("pdbe-molstar-css")) {
      const link = document.createElement("link");
      link.id = "pdbe-molstar-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/pdbe-molstar@3.2.0/build/pdbe-molstar-light.css";
      document.head.appendChild(link);
    }

    // Add JS
    if (!document.getElementById("pdbe-molstar-js")) {
      const script = document.createElement("script");
      script.id = "pdbe-molstar-js";
      script.src = "https://cdn.jsdelivr.net/npm/pdbe-molstar@3.2.0/build/pdbe-molstar-plugin.js";
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.body.appendChild(script);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).PDBeMolstarPlugin) {
        setTimeout(() => setIsLoaded(true), 0);
      } else {
        const script = document.getElementById("pdbe-molstar-js") as HTMLScriptElement;
        script.addEventListener("load", () => setIsLoaded(true));
      }
    }
  }, []);

  useEffect(() => {
    if (uniprotId && !pdbId) {
      fetch(`https://alphafold.ebi.ac.uk/api/prediction/${uniprotId}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.length > 0) {
            setAfUrl(data[0].cifUrl);
          }
        })
        .catch(console.error);
    }
  }, [uniprotId, pdbId]);

  useEffect(() => {
    if (!isLoaded || !viewerRef.current) return;
    if (uniprotId && !pdbId && !afUrl) return; // Wait until afUrl is fetched
    
    // Clear previous viewer if any
    viewerRef.current.innerHTML = "";
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viewerInstance = new (window as any).PDBeMolstarPlugin();
    const options = {
      moleculeId: pdbId ? pdbId.toLowerCase() : undefined,
      customData: afUrl ? {
        url: afUrl,
        format: "cif",
      } : undefined,
      alphafoldView: uniprotId && !pdbId ? true : false,
      bgColor: { r: 10, g: 10, b: 10 },
      hideControls: true,
      hideCanvasControls: ["selection", "animation", "controlToggle", "controlInfo"],
    };

    viewerInstance.render(viewerRef.current, options);
  }, [isLoaded, uniprotId, pdbId, afUrl, isExpanded]);

  if (!uniprotId && !pdbId) return null;

  return (
    <div
      className={`structure-viewer-container ${
        isExpanded 
          ? "fixed inset-0 z-50 bg-[#0a0a0a] p-8 flex flex-col" 
          : "relative h-64 mt-4 rounded-lg overflow-hidden border border-white/10 bg-[#0a0a0a]"
      }`}
    >
      <div className="flex justify-between items-center bg-[#18181b] px-3 py-2 absolute top-0 left-0 right-0 z-10 border-b border-white/5">
        <span className="text-xs text-[#a1a1aa] font-medium uppercase tracking-wider">
          {pdbId ? `Crystal Structure (${pdbId})` : "AlphaFold Prediction"}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#a1a1aa] hover:text-white transition-colors"
          title={isExpanded ? "Minimize" : "Full Screen"}
        >
          {isExpanded ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>
      <div 
        ref={viewerRef} 
        className={isExpanded ? "flex-1 mt-8 relative" : "h-[calc(100%-2.25rem)] w-full mt-9 relative"} 
        style={{ position: 'relative' }}
      />
    </div>
  );
}
