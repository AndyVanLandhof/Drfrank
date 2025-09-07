import React, { useCallback, useMemo, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

type HoleOCR = {
  number: number;
  par?: number;
  strokeIndex?: number;
  yardage?: number;
};

export interface ScorecardScannerProps {
  onCancel: () => void;
  onConfirm: (data: {
    clubName: string;
    courseName: string;
    holes: HoleOCR[];
  }) => void;
}

export default function ScorecardScanner({ onCancel, onConfirm }: ScorecardScannerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clubName, setClubName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [holes, setHoles] = useState<HoleOCR[]>(Array.from({ length: 18 }, (_, i) => ({ number: i + 1 })));

  const handlePick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(String(reader.result));
    reader.readAsDataURL(f);
  }, []);

  const runOCR = useCallback(async () => {
    if (!imageSrc) return;
    setProcessing(true);
    setError(null);
    try {
      const { data } = await Tesseract.recognize(imageSrc, 'eng', {
        tessedit_char_blacklist: 'abcdefghijklmnopqrstuvwxyz',
      } as any);
      const text = data.text || '';
      // Simple heuristic extraction: look for lines with hole numbers and nearby par/SI digits
      const nextHoles: HoleOCR[] = Array.from({ length: 18 }, (_, i) => ({ number: i + 1 }));
      const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        for (let i = 1; i <= 18; i++) {
          if (new RegExp(`(^|\s)${i}(\s|$)`).test(line)) {
            const nums = (line.match(/\d+/g) || []).map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n));
            // Try to map: first occurrence is the hole number; the rest might include par/SI/yardage
            const idx = nums.indexOf(i);
            const tail = nums.filter((_, j) => j !== idx);
            if (tail.length) {
              // naive: smallest likely par (3-6); another digit for SI (1-18); largest as yardage
              const par = tail.find(n => n >= 3 && n <= 6);
              const si = tail.find(n => n >= 1 && n <= 18);
              const yard = tail.filter(n => n > 50).sort((a, b) => b - a)[0];
              nextHoles[i - 1] = {
                number: i,
                par: par ?? nextHoles[i - 1].par,
                strokeIndex: si ?? nextHoles[i - 1].strokeIndex,
                yardage: yard ?? nextHoles[i - 1].yardage,
              };
            }
          }
        }
      }
      setHoles(nextHoles);
    } catch (e: any) {
      setError(e?.message || 'Failed to OCR image');
    } finally {
      setProcessing(false);
    }
  }, [imageSrc]);

  const canConfirm = useMemo(() => clubName.trim() && courseName.trim(), [clubName, courseName]);

  return (
    <div className="p-4">
      <h3 className="text-xl font-playfair text-augusta-yellow mb-3">Scan scorecard (beta)</h3>
      {!imageSrc ? (
        <div className="space-y-3">
          <p className="text-augusta-yellow-dark">Take a photo of an official scorecard. Ensure the grid is clear and well-lit.</p>
          <div className="flex gap-2">
            <button onClick={handlePick} className="px-4 py-2 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10">Choose Photo</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*;capture=camera" className="hidden" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="space-y-4">
          <img src={imageSrc} alt="scorecard" className="max-h-64 w-auto mx-auto rounded-xl border-2 border-augusta-yellow" />
          <div className="flex gap-2">
            <button onClick={() => setImageSrc(null)} className="px-3 py-2 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10">Retake</button>
            <button onClick={runOCR} disabled={processing} className="px-3 py-2 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10 disabled:opacity-50">{processing ? 'Reading…' : 'Read scorecard'}</button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
      )}

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-augusta-yellow-dark mb-1">Club name</label>
          <input value={clubName} onChange={e => setClubName(e.target.value)} className="w-full px-3 py-2 rounded-xl border-2 border-augusta-yellow bg-transparent text-augusta-yellow" />
        </div>
        <div>
          <label className="block text-sm text-augusta-yellow-dark mb-1">Course name</label>
          <input value={courseName} onChange={e => setCourseName(e.target.value)} className="w-full px-3 py-2 rounded-xl border-2 border-augusta-yellow bg-transparent text-augusta-yellow" />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-lg text-augusta-yellow mb-2">Review detected holes</h4>
        <div className="grid grid-cols-3 gap-2">
          {holes.map(h => (
            <div key={h.number} className="p-2 rounded-xl border-2 border-augusta-yellow/40">
              <div className="text-augusta-yellow">Hole {h.number}</div>
              <div className="flex gap-2 mt-1 text-sm">
                <label className="text-augusta-yellow-dark">Par</label>
                <input type="number" value={h.par ?? ''} onChange={e => setHoles(prev => prev.map(x => x.number===h.number?{...x, par: e.target.value?parseInt(e.target.value,10):undefined}:x))} className="w-16 px-2 py-1 rounded-lg border border-augusta-yellow bg-transparent text-augusta-yellow" />
                <label className="text-augusta-yellow-dark">S.I.</label>
                <input type="number" value={h.strokeIndex ?? ''} onChange={e => setHoles(prev => prev.map(x => x.number===h.number?{...x, strokeIndex: e.target.value?parseInt(e.target.value,10):undefined}:x))} className="w-16 px-2 py-1 rounded-lg border border-augusta-yellow bg-transparent text-augusta-yellow" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10">Cancel</button>
        <button disabled={!canConfirm} onClick={() => onConfirm({ clubName: clubName.trim(), courseName: courseName.trim(), holes })} className="px-4 py-2 rounded-2xl border-2 border-augusta-yellow text-augusta-yellow hover:bg-augusta-yellow/10 disabled:opacity-50">Save to My Courses</button>
      </div>
    </div>
  );
}


