import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Direct synchronous imports for SSR to avoid Suspense fallback rendering
import { Home } from './pages/Home';
import { MergePDF } from './pages/tools/MergePDF';
import { SplitPDF } from './pages/tools/SplitPDF';
import { CompressPDF } from './pages/tools/CompressPDF';
import { ImageToPDF } from './pages/tools/ImageToPDF';
import { PDFToImage } from './pages/tools/PDFToImage';
import { RotatePDF } from './pages/tools/RotatePDF';
import { DeletePDFPages } from './pages/tools/DeletePDFPages';
import { ProtectPDF } from './pages/tools/ProtectPDF';
import { UnlockPDF } from './pages/tools/UnlockPDF';
import { AddWatermarkPDF } from './pages/tools/AddWatermarkPDF';

import { PDFToWord } from './pages/tools/PDFToWord';
import { WordToPDF } from './pages/tools/WordToPDF';
import { PDFToExcel } from './pages/tools/PDFToExcel';
import { ExcelToPDF } from './pages/tools/ExcelToPDF';
import { PDFToPPT } from './pages/tools/PDFToPPT';
import { PPTToPDF } from './pages/tools/PPTToPDF';
import { SignPDF } from './pages/tools/SignPDF';
import { EditPDF } from './pages/tools/EditPDF';
import { AddPageNumbers } from './pages/tools/AddPageNumbers';
import { CropPDF } from './pages/tools/CropPDF';

import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { Blog } from './pages/Blog';
import { NotFound } from './pages/NotFound';

function ServerApp() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1 min-h-[85vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge-pdf" element={<MergePDF />} />
          <Route path="/split-pdf" element={<SplitPDF />} />
          <Route path="/compress-pdf" element={<CompressPDF />} />
          <Route path="/image-to-pdf" element={<ImageToPDF />} />
          <Route path="/pdf-to-image" element={<PDFToImage />} />
          <Route path="/rotate-pdf" element={<RotatePDF />} />
          <Route path="/delete-pdf-pages" element={<DeletePDFPages />} />
          <Route path="/protect-pdf" element={<ProtectPDF />} />
          <Route path="/unlock-pdf" element={<UnlockPDF />} />
          <Route path="/add-watermark-pdf" element={<AddWatermarkPDF />} />

          <Route path="/pdf-to-word" element={<PDFToWord />} />
          <Route path="/word-to-pdf" element={<WordToPDF />} />
          <Route path="/pdf-to-excel" element={<PDFToExcel />} />
          <Route path="/excel-to-pdf" element={<ExcelToPDF />} />
          <Route path="/pdf-to-ppt" element={<PDFToPPT />} />
          <Route path="/ppt-to-pdf" element={<PPTToPDF />} />
          <Route path="/sign-pdf" element={<SignPDF />} />
          <Route path="/edit-pdf" element={<EditPDF />} />
          <Route path="/add-page-numbers" element={<AddPageNumbers />} />
          <Route path="/crop-pdf" element={<CropPDF />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />

          <Route path="/delete-pages" element={<Navigate to="/delete-pdf-pages" replace />} />
          <Route path="/add-watermark" element={<Navigate to="/add-watermark-pdf" replace />} />
          <Route path="/page-numbers" element={<Navigate to="/add-page-numbers" replace />} />
          <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export function render(url: string) {
  const helmetContext: { helmet?: any } = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter initialEntries={[url]}>
        <ServerApp />
      </MemoryRouter>
    </HelmetProvider>
  );

  return {
    html,
    helmet: helmetContext.helmet
  };
}
