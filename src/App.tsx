import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Loader2 } from 'lucide-react';

// Route-level Code Splitting for Performance
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const MergePDF = lazy(() => import('./pages/tools/MergePDF').then(m => ({ default: m.MergePDF })));
const SplitPDF = lazy(() => import('./pages/tools/SplitPDF').then(m => ({ default: m.SplitPDF })));
const CompressPDF = lazy(() => import('./pages/tools/CompressPDF').then(m => ({ default: m.CompressPDF })));
const ImageToPDF = lazy(() => import('./pages/tools/ImageToPDF').then(m => ({ default: m.ImageToPDF })));
const PDFToImage = lazy(() => import('./pages/tools/PDFToImage').then(m => ({ default: m.PDFToImage })));
const RotatePDF = lazy(() => import('./pages/tools/RotatePDF').then(m => ({ default: m.RotatePDF })));
const DeletePDFPages = lazy(() => import('./pages/tools/DeletePDFPages').then(m => ({ default: m.DeletePDFPages })));
const ProtectPDF = lazy(() => import('./pages/tools/ProtectPDF').then(m => ({ default: m.ProtectPDF })));
const UnlockPDF = lazy(() => import('./pages/tools/UnlockPDF').then(m => ({ default: m.UnlockPDF })));
const AddWatermarkPDF = lazy(() => import('./pages/tools/AddWatermarkPDF').then(m => ({ default: m.AddWatermarkPDF })));

// 10 Extended Tools
const PDFToWord = lazy(() => import('./pages/tools/PDFToWord').then(m => ({ default: m.PDFToWord })));
const WordToPDF = lazy(() => import('./pages/tools/WordToPDF').then(m => ({ default: m.WordToPDF })));
const PDFToExcel = lazy(() => import('./pages/tools/PDFToExcel').then(m => ({ default: m.PDFToExcel })));
const ExcelToPDF = lazy(() => import('./pages/tools/ExcelToPDF').then(m => ({ default: m.ExcelToPDF })));
const PDFToPPT = lazy(() => import('./pages/tools/PDFToPPT').then(m => ({ default: m.PDFToPPT })));
const PPTToPDF = lazy(() => import('./pages/tools/PPTToPDF').then(m => ({ default: m.PPTToPDF })));
const SignPDF = lazy(() => import('./pages/tools/SignPDF').then(m => ({ default: m.SignPDF })));
const EditPDF = lazy(() => import('./pages/tools/EditPDF').then(m => ({ default: m.EditPDF })));
const AddPageNumbers = lazy(() => import('./pages/tools/AddPageNumbers').then(m => ({ default: m.AddPageNumbers })));
const CropPDF = lazy(() => import('./pages/tools/CropPDF').then(m => ({ default: m.CropPDF })));

// Institutional & Compliance Pages
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

const RouteLoading: React.FC = () => (
  <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-3 text-slate-500">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    <span className="text-sm font-medium">Loading PDF Tool...</span>
  </div>
);

export function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1 min-h-[85vh]">
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                {/* 20 PDF Tool Routes */}
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

                {/* 10 Extended Tool Routes */}
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

                {/* Institutional, Compliance & Editorial Routes */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/blog" element={<Blog />} />

                {/* Backwards Compatibility Permanent Redirects */}
                <Route path="/delete-pages" element={<Navigate to="/delete-pdf-pages" replace />} />
                <Route path="/add-watermark" element={<Navigate to="/add-watermark-pdf" replace />} />
                <Route path="/page-numbers" element={<Navigate to="/add-page-numbers" replace />} />
                <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
