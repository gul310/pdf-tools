# PDF Tools Pro — 100% Client-Side Web PDF Suite

A modern, high-performance, browser-side PDF utility suite delivering **20 essential document processing tools** with complete user privacy. Engineered with **React 19, TypeScript, Vite, Tailwind CSS v4, and WebAssembly (WASM)**, every document operation executes entirely within local browser tab memory—zero bytes and zero files are ever transmitted to any remote server or third-party cloud.

---

## 🛠️ Complete Suite of 20 PDF Tools

| # | Tool | Route | Description |
|---|---|---|---|
| 1 | **Merge PDF** | `/merge-pdf` | Combine multiple PDF files into a single consolidated document with drag-and-drop reordering. |
| 2 | **Split PDF** | `/split-pdf` | Extract custom page ranges or decompose documents into individual pages packaged as a `.zip`. |
| 3 | **Compress PDF** | `/compress-pdf` | Optimize document file size via QPDF WebAssembly stream linearization and object stream deduplication. |
| 4 | **Image to PDF** | `/image-to-pdf` | Convert PNG, JPG, and WebP images into standardized A4 PDF pages with automated aspect-ratio fitting. |
| 5 | **PDF to Image** | `/pdf-to-image` | Render PDF pages to high-resolution PNG or JPEG raster images with multi-page ZIP export. |
| 6 | **Rotate PDF** | `/rotate-pdf` | Rotate pages permanently in 90°, 180°, or 270° increments with live thumbnail previews. |
| 7 | **Delete PDF Pages** | `/delete-pdf-pages` | Visually select and permanently discard unwanted pages with zero-page deletion safeguards. |
| 8 | **Protect PDF** | `/protect-pdf` | Encrypt PDF documents using industry-standard 256-bit AES encryption with user and owner passwords. |
| 9 | **Unlock PDF** | `/unlock-pdf` | Authenticate with valid master credentials to decrypt documents and strip security restrictions. |
| 10 | **Add Watermark** | `/add-watermark-pdf` | Inject customizable text watermarks with control over font size, opacity, rotation angle, and layer depth. |
| 11 | **PDF to Word** | `/pdf-to-word` | Extract coordinate text streams and typography into standards-compliant OpenXML `.docx` documents. |
| 12 | **Word to PDF** | `/word-to-pdf` | Parse `.docx` OpenXML elements (headings, text, tables) and compile directly into standard A4 PDF pages. |
| 13 | **PDF to Excel** | `/pdf-to-excel` | Analyze coordinate grids and tabular structures to export data into native `.xlsx` spreadsheet workbooks. |
| 14 | **Excel to PDF** | `/excel-to-pdf` | Convert spreadsheet tables and evaluated formulas into styled PDF pages with automatic landscape switching. |
| 15 | **PDF to PowerPoint** | `/pdf-to-ppt` | Convert PDF pages into 16:9 `.pptx` presentations supporting High-Fidelity Slides and Editable Text modes. |
| 16 | **PowerPoint to PDF** | `/ppt-to-pdf` | Unpack `.pptx` slide layouts, themes, text runs, and background fills into universal widescreen PDF files. |
| 17 | **Sign PDF** | `/sign-pdf` | Draw or upload visual electronic signatures and stamp them onto any document page with scaling controls. |
| 18 | **Edit PDF** | `/edit-pdf` | Overlay text annotations, callout highlight boxes, and visual content cover blocks directly on pages. |
| 19 | **Add Page Numbers** | `/add-page-numbers` | Stamp customizable page number markers with formatting presets (Page X, Page X of Y, numeric) and positioning. |
| 20 | **Crop PDF** | `/crop-pdf` | Visually trim excess page margins and adjust visible viewports with live interactive dimension controls. |

---

## 🔒 Privacy & Security Architecture

1. **100% In-Browser Execution:**
   - Document operations run locally in browser RAM using compiled WebAssembly binaries (QPDF WASM) and client-side JavaScript.
   - You can disconnect your network connection after loading the application and all tools continue functioning offline.
2. **Zero Network Transmission:**
   - Files are never uploaded, staged, or cached on remote servers or third-party cloud buckets.
3. **Automatic Memory Cleanup:**
   - Temporary file buffers and `Blob` object URLs are revoked and purged when tabs are closed or tasks reset.
4. **Verifiable Privacy:**
   - Network activity can be verified in browser Developer Tools (`Network` tab): zero POST, PUT, or upload requests are made during processing.

---

## ⚙️ Technology Stack

- **Core Framework:** React 19, TypeScript
- **Bundler & Build Tool:** Vite 8 (Rolldown / Oxc architecture)
- **Styling:** Vanilla CSS & Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing & Head Management:** React Router DOM v7, React Helmet Async
- **Icons:** Lucide React
- **PDF Engine & WebAssembly:**
  - `pdf-lib` (Document generation, stream modification, vector stamping)
  - `pdfjs-dist` (PDF rendering, rasterization, text extraction, worker thread)
  - `pdfstudio` / `qpdf.wasm` (Compiled C++ QPDF binary for 256-bit AES encryption and linearization)
- **Document Format Handlers:**
  - `docx` (Client-side OpenXML Word document assembly)
  - `mammoth` (DOCX OpenXML parser)
  - `xlsx` (SheetJS Excel spreadsheet parsing and generation)
  - `pptxgenjs` (Client-side PowerPoint presentation generator)
  - `jszip` (Multi-file archiving and ZIP compilation)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v18.0.0 or later (v20+ or v24 LTS recommended)
- **npm:** v9.0.0 or later

### Installation

Clone the repository and install dependencies:

```bash
# Install required dependencies
npm install
```

### Development Server

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Running Automated QA Tests

Execute the comprehensive test suites covering all 20 PDF operations:

```bash
npm test
```

### Linting

Run Oxlint to check code quality:

```bash
npm run lint
```

---

## 📦 Production Build & Deployment

### Build the Application

Compile TypeScript and build the optimized production bundle:

```bash
npm run build
```

The output will be generated in the `dist/` directory.

### Preview Production Build Locally

```bash
npm run preview
```

### Deployment Configuration

Because PDF Tools Pro is a Single-Page Application (SPA) with client-side routing, configure your web server to redirect all requests to `index.html`.

- **Apache / Shared Hosting (Hostinger, cPanel):**  
  A production-ready `.htaccess` file is pre-configured in `public/.htaccess`:
  ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </IfModule>
  ```
- **Nginx:**
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
- **Vercel / Netlify / Cloudflare Pages:**  
  Standard static SPA build configuration (`dist` as output directory).

---

## ⚠️ Known Technical Limitations

In accordance with our commitment to technical accuracy and transparency:

- **Cover Content (Visual Only):**  
  The Cover Content feature in Edit PDF draws an opaque white vector rectangle overlay. While content is obscured visually in standard viewers and prints, underlying text and images remain in the PDF data stream and are recoverable by PDF parsers. Do not rely on this feature for legal or confidential redaction.
- **Crop PDF Viewport Bounds:**  
  Cropping modifies the PDF display viewport (`CropBox` and `MediaBox`). Content outside the cropped boundary remains physically present in the PDF file stream and is recoverable if the viewport is reset. Cropping does not delete content.
- **Visual Electronic Signatures:**  
  The Sign PDF tool applies a Simple Electronic Signature (SES) mark. It does not provide cryptographic PKI/X.509 digital certificates, hardware tokens, or eIDAS Qualified Electronic Signatures (QES).
- **Document Format Conversions:**  
  - *PDF to Word / Excel:* Multi-column text reflows in reading order; borderless tables or merged cells may align into adjacent cells or single rows.
  - *Word / Excel / PPT to PDF:* Complex proprietary Microsoft Office SmartArt, dynamic macro charts, 3D shapes, and animations are flattened or simplified during browser-side rendering.

---

## 📄 Repository Status & License

This is a **public repository**.

- **No Reuse License Granted:** All rights reserved. The source code of this application is publicly viewable for evaluation and inspection, but no license is granted to copy, distribute, modify, sublicense, or commercially reuse any proprietary project assets or code unless a license is explicitly added in the future.
- **Upstream Open-Source Attributions:** The application incorporates and links against third-party open-source libraries, each governed by its respective license:
  - **pdf-lib:** MIT License
  - **pdfjs-dist:** Apache License 2.0
  - **pdfstudio / QPDF WebAssembly:** Apache License 2.0 / Artistic License 2.0
  - **docx:** MIT License
  - **pptxgenjs:** MIT License
  - **mammoth:** BSD 2-Clause License
  - **xlsx (SheetJS):** Apache License 2.0
  - **jszip:** MIT License / Dual GPLv3
  - **React & React DOM:** MIT License
  - **Tailwind CSS:** MIT License
  - **Lucide Icons:** MIT License
