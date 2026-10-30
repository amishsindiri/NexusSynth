import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axiosClient';

interface SourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSourceUploaded: (source: any) => void;
}

const SAMPLE_SOURCES = [
  {
    label: 'Sample 1: Biodegradable Ester Lipid Study',
    title: 'High-Throughput Profiling of Secondary Ester Cleavage Rates in mRNA LNPs',
    authors: 'Kowalski, J., Weber, F., & Tanaka, R.',
    publication_year: 2025,
    source_type: 'PEER_REVIEWED_PAPER',
    source_url: 'https://doi.org/10.1016/j.jconrel.2025.04.012',
    raw_content: `Title: High-Throughput Profiling of Secondary Ester Cleavage Rates in mRNA LNPs
Authors: Kowalski, J., Weber, F., & Tanaka, R.
Publication Year: 2025
Journal: Molecular Pharmaceutics, Vol. 22, Issue 4, pp. 312-329.

Abstract & Experimental Findings:
Rapid intracellular metabolism of ionizable lipids prevents lipidosis and immunological fatigue in repeated genetic dosing protocols. In this work, we screened 32 synthetic lipid analogues containing varied ester linkage spacings (C2 through C8 spacers) from the tertiary amine core.

Methodology:
In-vitro enzymatic degradation assays were conducted using porcine liver esterase (PLE) at 37°C, quantified by liquid chromatography-mass spectrometry (LC-MS/MS). In-vivo tolerability was tested in Sprague-Dawley rats (n=36) receiving four weekly injections of 0.75 mg/kg human erythropoietin (hEPO) mRNA.

Results:
Lipid variant EST-C4 displayed optimal cleavage kinetics, with 94.2% ester bond hydrolysis within 3.5 hours of cytoplasmic entry. Hydrodynamic diameter remained stable at 71.4 nm (PDI 0.076). Rats exhibited zero observable elevation in serum AST/ALT after the fourth consecutive dose. Most significantly, mRNA translation efficiency was preserved at 91% of standard ALC-0315 levels, while hepatic lipid accumulation was completely cleared within 48 hours post-dose.

Limitations & Critical Discussion:
The study evaluated rodent esterases, which are known to possess higher catalytic velocity than human carboxylesterases (CES1/CES2). Clinical translation may require calibration of the alkyl chain steric hindrance to match human metabolic rates.`,
  },
  {
    label: 'Sample 2: Low N/P Cryo-EM Characterization',
    title: 'Cryogenic Electron Microscopy of Core-Shell Packing Density at N/P Ratio 3.2',
    authors: 'Patterson, D., & Gupta, S.',
    publication_year: 2025,
    source_type: 'TECHNICAL_REPORT',
    source_url: 'https://openreview.net/forum?id=cryo-lnp-2025',
    raw_content: `Title: Cryogenic Electron Microscopy of Core-Shell Packing Density at N/P Ratio 3.2
Authors: Patterson, D., & Gupta, S.
Publication Year: 2025
Affiliation: Institute for Nano-Biophysical Systems

Executive Summary:
Controlling internal mRNA lamellar spacing inside ionizable lipid particles dictates both encapsulation payload and thermodynamic stability upon serum incubation. We utilized 300 kV Cryo-TEM tomography to resolve the nanostructure of nanoparticles formulated at low nitrogen-to-phosphate (N/P) ratios.

Methodology & Experimental Design:
LNPs were vitrified in liquid ethane and imaged on a Titan Krios G4 with a K3 direct electron detector. Contrast transfer function fitting and sub-tomogram averaging yielded a 6.8 Å resolution map of the internal lipid-mRNA lattice.

Key Empirical Observations:
Formulations prepared at N/P 3.2:1 showed complete electron-dense core condensation, with less than 2.8% uncomplexed free nucleic acid detected by RiboGreen fluorescence. The outer lipid monolayer thickness was measured at 2.4 nm. Serum stability tests in 50% human plasma demonstrated that N/P 3.2 formulations maintained 96% structural integrity over 48 hours at 37°C, outperforming standard N/P 6.0 LNPs which exhibited 18% premature micellar dissociation due to excess cationic surface repulsion.

Identified Constraints:
Low N/P formulations exhibit heightened sensitivity to ionic strength variations in reconstitution buffers. Saline concentration fluctuations above 165 mM provoked measurable particle aggregation.`,
  },
  {
    label: 'Sample 3: Clinical Immunogenicity Cohort',
    title: 'Longitudinal Serum Cytokine and Anti-PEG Antibody Profiling in Repeat mRNA Cohorts',
    authors: 'Venkatesh, A., Holbrook, M., & Zhao, L.',
    publication_year: 2026,
    source_type: 'PEER_REVIEWED_PAPER',
    source_url: 'https://doi.org/10.1038/s41587-026-00441-x',
    raw_content: `Title: Longitudinal Serum Cytokine and Anti-PEG Antibody Profiling in Repeat mRNA Cohorts
Authors: Venkatesh, A., Holbrook, M., & Zhao, L.
Publication Year: 2026
Journal: Nature Biotechnology, Vol. 44, pp. 188-204.

Abstract:
Systemic reactogenicity to repeated nanoparticle administrations frequently limits the therapeutic window of mRNA platforms in non-vaccine indications such as enzyme replacement and oncology. We conducted a longitudinal study across 56 clinical participants receiving multi-dose mRNA-LNP therapy.

Clinical Methodology:
Blood draws were taken pre-infusion and at 2, 6, 24, and 72 hours across six administration cycles. Systemic cytokines (IL-1beta, IL-6, TNF, IFN-alpha) were quantified via multiplex bead arrays. Anti-PEG IgG and IgM titers were measured by high-sensitivity ELISA.

Empirical Findings:
1. Anti-PEG IgM antibodies emerged in 52% of subjects following the second infusion, peaking at day 28.
2. In subjects with elevated anti-PEG IgM (> 1:800 titer), circulation half-life of subsequent doses decreased by 62%, leading to a 38% reduction in target protein expression.
3. Interestingly, switching to cleavable polysarcosine (pSar) lipid conjugates eliminated antibody-mediated accelerated blood clearance, restoring full translational output.
4. Acute cytokine induction (IL-6 > 50 pg/mL) was primarily triggered by high cationic charge density rather than the lipid clearance half-life.

Study Limitations:
Cohort was drawn from adult subjects (aged 28–64) and excluded pediatric patients or individuals with pre-existing autoimmune conditions. Long-term follow-up beyond 12 months is ongoing.`,
  },
];

export const SourceUploadModal: React.FC<SourceUploadModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  onSourceUploaded,
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publicationYear, setPublicationYear] = useState<number | ''>(2025);
  const [sourceType, setSourceType] = useState('PEER_REVIEWED_PAPER');
  const [sourceUrl, setSourceUrl] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplySample = (sample: typeof SAMPLE_SOURCES[0]) => {
    setInputMode('text');
    setTitle(sample.title);
    setAuthors(sample.authors);
    setPublicationYear(sample.publication_year);
    setSourceType(sample.source_type);
    setSourceUrl(sample.source_url);
    setRawContent(sample.raw_content);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file (.pdf).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('PDF file size must not exceed 10MB.');
        return;
      }
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.pdf$/i, ''));
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (inputMode === 'file' && !selectedFile) {
      setError('Please choose a PDF document to upload.');
      return;
    }
    if (inputMode === 'text' && (!rawContent || rawContent.trim().length < 50)) {
      setError('Please provide at least 50 characters of research text.');
      return;
    }

    try {
      setIsUploading(true);
      setProgressStep('Extracting research payload & metadata...');

      let response;
      if (inputMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title || selectedFile.name.replace(/\.pdf$/i, ''));
        if (authors) formData.append('authors', authors);
        if (publicationYear) formData.append('publication_year', String(publicationYear));
        formData.append('source_type', sourceType);
        if (sourceUrl) formData.append('source_url', sourceUrl);

        setProgressStep('Parsing PDF & calling Gemini Source Deconstruction Engine...');
        response = await api.post(`/workspaces/${workspaceId}/sources`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        setProgressStep('Invoking Gemini 2.5 Flash for Claim Extraction & Methodology Rating...');
        response = await api.post(`/workspaces/${workspaceId}/sources`, {
          title: title.trim(),
          authors: authors.trim() || 'Unknown Author',
          publication_year: publicationYear ? Number(publicationYear) : null,
          source_type: sourceType,
          source_url: sourceUrl.trim() || undefined,
          raw_content: rawContent.trim(),
        });
      }

      setProgressStep('Finalizing source index and empirical ratings...');
      onSourceUploaded(response.data);
      onClose();
      // Reset
      setTitle('');
      setAuthors('');
      setRawContent('');
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error uploading and analyzing document.');
    } finally {
      setIsUploading(false);
      setProgressStep(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Ingest Research Source</h2>
              <p className="text-xs text-slate-400">Upload PDF documents or paste raw literature for automated Gemini deconstruction.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1-Click Sample Research Paper Injector */}
        <div className="my-4 rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Reviewer Fast-Path (1-Click Sample Research Sources):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SOURCES.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplySample(s)}
                className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-300"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isUploading && progressStep && (
          <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <div>
                <p className="text-xs font-semibold text-white">{progressStep}</p>
                <p className="text-[11px] text-slate-400">Gemini is extracting empirical claims, methodology notes, and key metrics...</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Mode Toggle */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                inputMode === 'text'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paste Text / Abstract
            </button>
            <button
              type="button"
              onClick={() => setInputMode('file')}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                inputMode === 'file'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload PDF File (Max 10MB)
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Document Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cryogenic Electron Microscopy of Core-Shell mRNA LNPs"
              required
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Authors & Year & Source Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Authors</label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="e.g., Chen et al."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
              <input
                type="number"
                min={1900}
                max={2030}
                value={publicationYear}
                onChange={(e) => setPublicationYear(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="2025"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Source Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="PEER_REVIEWED_PAPER">Peer-Reviewed Paper</option>
                <option value="TECHNICAL_REPORT">Technical Report</option>
                <option value="POLICY_BRIEF">Policy Brief</option>
                <option value="MARKET_ANALYSIS">Market Analysis</option>
                <option value="RAW_FIELD_NOTES">Raw Field Notes</option>
                <option value="WEB_ARTICLE_TRANSCRIPT">Web Article / Transcript</option>
              </select>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Source URL / DOI (Optional)</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://doi.org/... or https://arxiv.org/abs/..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Mode Body: PDF upload vs Raw Content */}
          {inputMode === 'file' ? (
            <div className="rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/60 p-6 text-center hover:border-slate-700">
              <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <label className="cursor-pointer text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                <span>Select a PDF document</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="mt-1 text-[11px] text-slate-500">PDF up to 10MB will be parsed via pdf-parse</p>
              {selectedFile && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Raw Research Text / Abstract <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="Paste full text, abstract, methodology details, or quantitative findings here (min 50 chars)..."
                rows={7}
                required
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                <span>Minimum 50 characters</span>
                <span>{rawContent.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing & Indexing...</span>
                </>
              ) : (
                <span>Ingest & Deconstruct Document</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
