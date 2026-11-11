import { getCanonicalUrl } from '../config/site.ts';

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface ToolData {
  id: string;
  title: string;
  name: string;
  path: string;
  iconName: string;
  shortDescription: string;
  badge?: string;
  accentColor: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  directAnswer: string;
  articleContent: {
    heading: string;
    sections: {
      subheading: string;
      content: string;
    }[];
  };
  howToSteps: HowToStep[];
  faqs: ToolFAQ[];
  relatedToolIds: string[];
}

export const TOOLS_DATA: Record<string, ToolData> = {
  'merge-pdf': {
    id: 'merge-pdf',
    name: 'Merge PDF',
    title: 'Merge PDF Files Online — 100% Free & Private',
    path: '/merge-pdf',
    iconName: 'Files',
    shortDescription: 'Combine multiple PDF documents into a single organized file directly in your browser with zero server uploads.',
    badge: 'Popular',
    accentColor: 'blue',
    seoTitle: 'Merge PDF Files Online Free - Combine PDF Documents Client-Side',
    metaDescription: 'Quickly merge multiple PDF files into one clean document right in your browser. Fast, free, completely private, and processed 100% locally with no uploads.',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'merge pdf online', 'free pdf joiner'],
    canonicalUrl: getCanonicalUrl('/merge-pdf'),
    directAnswer: 'To merge PDF files, upload two or more documents to the tool, drag to reorder the pages or files into your desired reading sequence, and click "Merge PDF". The unified document compiles instantly in your browser without uploading to any server.',
    howToSteps: [
      { name: 'Upload PDF Files', text: 'Select and drop two or more PDF documents into the dropzone.' },
      { name: 'Arrange Order', text: 'Drag and reorder file cards or use arrow buttons to arrange documents in the exact order you want them merged.' },
      { name: 'Click Merge PDF', text: 'Click the "Merge PDF" button to trigger instant client-side assembly using WebAssembly.' },
      { name: 'Download Combined PDF', text: 'Save the unified PDF file directly to your device with one click.' }
    ],
    faqs: [
      { question: 'Is my data secure when merging PDFs on this site?', answer: 'Yes, 100%. All PDF processing runs locally in your web browser using client-side JavaScript and WebAssembly. Your files are never transmitted to any external server or stored in the cloud.' },
      { question: 'Is there a limit on how many PDFs I can combine?', answer: 'There is no artificial limit imposed by our software. You can combine dozens of files smoothly, limited only by your computer memory.' },
      { question: 'Will the bookmarks, links, and formatting be preserved?', answer: 'Yes, standard text formatting, vector graphics, embedded fonts, and page structures are faithfully preserved into the final merged document.' },
      { question: 'Can I reorder individual pages from different documents before merging?', answer: 'Yes, you can rearrange file items in the queue to control the exact sequence in which documents appear in the combined output.' },
      { question: 'Do I need to install plugins or software?', answer: 'No software, browser extensions, or account sign-ups are required. It operates natively in any modern browser on Windows, Mac, Linux, iOS, or Android.' }
    ],
    relatedToolIds: ['split-pdf', 'compress-pdf', 'rotate-pdf', 'delete-pdf-pages'],
    articleContent: {
      heading: 'The Secure Way to Combine and Merge PDF Documents',
      sections: [
        {
          subheading: 'Why Client-Side PDF Merging Matters',
          content: 'Merging sensitive contracts, financial statements, medical records, or academic transcripts often forces users to entrust their confidential paperwork to unknown third-party servers. Our client-side PDF merger operates entirely within the sandbox of your browser using WebAssembly. This means the bytes representing your documents never leave your local device memory, guaranteeing zero risk of data interception or unauthorized cloud retention.'
        },
        {
          subheading: 'Streamlined Document Management',
          content: 'Whether assembling monthly invoice packets, compiling multi-chapter research papers, or organizing application forms, having an intuitive drag-and-drop tool makes document preparation effortless. You can add files incrementally, view file sizes and page counts, and reorder items until the layout matches your exact specifications.'
        },
        {
          subheading: 'Engineered for High Performance',
          content: 'Built on top of industry-standard standards compliant PDF engines, the assembly engine executes zero-copy byte stream operations whenever possible. This results in blazing fast processing times—merging large documents in a fraction of a second without heating up your CPU or draining mobile batteries.'
        }
      ]
    }
  },

  'split-pdf': {
    id: 'split-pdf',
    name: 'Split PDF',
    title: 'Split PDF Pages & Extract Ranges — Fast & Free',
    path: '/split-pdf',
    iconName: 'Scissors',
    shortDescription: 'Extract specific pages or break a large document into individual PDF files with precise page range control.',
    badge: 'Essential',
    accentColor: 'indigo',
    seoTitle: 'Split PDF Online Free - Extract Pages and Ranges Privately',
    metaDescription: 'Extract select pages or separate your PDF into multiple standalone documents. Flexible range selection, zero server uploads, and instant ZIP downloads.',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf', 'divide pdf', 'pdf splitter online'],
    canonicalUrl: getCanonicalUrl('/split-pdf'),
    directAnswer: 'To split a PDF, upload your document, select whether to extract custom page ranges (e.g., 1-3, 5) or break every page into separate files, then click "Split PDF". Download the extracted pages immediately as individual files or a ZIP archive.',
    howToSteps: [
      { name: 'Upload Source Document', text: 'Drag and drop your PDF file into the split tool.' },
      { name: 'Select Split Mode', text: 'Choose between "Extract Selected Pages" (or custom range) and "Split into Single Page Files".' },
      { name: 'Specify Ranges', text: 'Enter page ranges like "1-3, 5" or click interactive page thumbnails to select pages.' },
      { name: 'Process & Download', text: 'Click "Split PDF" and download the resulting PDF or ZIP archive immediately.' }
    ],
    faqs: [
      { question: 'Can I extract non-consecutive pages from a PDF?', answer: 'Yes! You can specify non-consecutive pages such as "1, 4, 7-10" or click thumbnails directly to cherry-pick exactly the pages you need.' },
      { question: 'How are multiple split files delivered?', answer: 'When splitting into multiple separate files, they are automatically bundled into a convenient, uncompressed or compressed ZIP archive for single-click downloading.' },
      { question: 'Does splitting a PDF degrade its text or image quality?', answer: 'Not at all. Page streams, fonts, vectors, and embedded images are extracted losslessly without re-encoding.' },
      { question: 'Can I split password-protected PDFs?', answer: 'If a PDF has an open password, use our "Unlock PDF" tool first to remove the password, then split it freely.' },
      { question: 'Is my document private when splitting?', answer: 'Yes, your document is processed entirely inside your browser tab memory. No data is sent over the Internet.' }
    ],
    relatedToolIds: ['merge-pdf', 'delete-pdf-pages', 'rotate-pdf', 'pdf-to-image'],
    articleContent: {
      heading: 'Precision PDF Splitting and Page Extraction',
      sections: [
        {
          subheading: 'Extract Only What You Need',
          content: 'Large PDF documents frequently contain extraneous chapters, blank separator sheets, or confidential appendices that should not be shared. Our browser-based PDF splitter gives you surgical precision over your document hierarchy, allowing you to isolate vital pages into a compact, shareable file in seconds.'
        },
        {
          subheading: 'Two Flexible Splitting Modes',
          content: 'Choose between custom page extraction—where specific ranges such as pages 1-4 and 8-12 are merged into a brand new cohesive PDF—or full file decomposition, which slices each page into its own individual PDF document packaged neatly inside a ZIP file.'
        },
        {
          subheading: 'Local Execution for Total Confidentiality',
          content: 'Law firms, accountants, and everyday users rely on client-side splitting because uploading sensitive files to external servers carries data exposure risks. With in-browser processing, your documents never traverse public networks.'
        }
      ]
    }
  },

  'compress-pdf': {
    id: 'compress-pdf',
    name: 'Compress PDF',
    title: 'Compress PDF Online — Reduce File Size Privately',
    path: '/compress-pdf',
    iconName: 'Minimize2',
    shortDescription: 'Shrink large PDF files for easy email attachments and web publishing without sacrificing document clarity.',
    badge: 'Popular',
    accentColor: 'emerald',
    seoTitle: 'Compress PDF Online Free - Reduce PDF File Size in Browser',
    metaDescription: 'Reduce PDF file size online without uploading files to a server. Lossless stream packing and smart optimization keep documents sharp and lightweight.',
    keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf compressor', 'compress pdf online free'],
    canonicalUrl: getCanonicalUrl('/compress-pdf'),
    directAnswer: 'To compress a PDF, drop your document into the uploader, choose your desired compression level (Recommended, Extreme, or Light), and click "Compress PDF". Your document is optimized client-side and ready to download with reduced file size.',
    howToSteps: [
      { name: 'Select PDF', text: 'Choose or drag the PDF file you wish to optimize.' },
      { name: 'Choose Compression Strength', text: 'Select between Low (maximum visual quality), Medium (recommended balance), or High (maximum size reduction).' },
      { name: 'Compress Document', text: 'Click "Compress PDF" to execute structural stream compression and object optimization.' },
      { name: 'Inspect & Download', text: 'Review the before and after file size comparison, then download your optimized file.' }
    ],
    faqs: [
      { question: 'How does client-side PDF compression work?', answer: 'Our engine cleans unreferenced objects, packs loose PDF objects into compact object streams, and applies modern Flate/Deflate compression algorithms directly in WebAssembly.' },
      { question: 'Will my text become blurry after compression?', answer: 'No. Vector text, font glyphs, and mathematical paths remain completely crisp because vector graphics scale independently of compression.' },
      { question: 'Can I compress scanned PDF documents?', answer: 'Yes. While scanned PDFs contain raster images that benefit most from structural stream compression, our tool reduces stream overhead across all PDF types.' },
      { question: 'Is there a file size limit for compression?', answer: 'Because compression takes place inside your browser, documents up to hundreds of megabytes can be processed efficiently based on your device hardware.' },
      { question: 'Are my confidential documents uploaded to a remote server?', answer: 'Never. Every byte is parsed and compressed in your browser memory. Nothing touches a remote server.' }
    ],
    relatedToolIds: ['merge-pdf', 'split-pdf', 'pdf-to-image', 'protect-pdf'],
    articleContent: {
      heading: 'Smart, Secure In-Browser PDF Compression',
      sections: [
        {
          subheading: 'Solve Email and Portal Upload Limits',
          content: 'Government portals, academic submission systems, and email providers routinely reject PDF attachments exceeding 10MB or 25MB limits. Our PDF compressor strips redundant metadata, deduplicates embedded resources, and packs structural objects into stream containers to dramatically reduce footprint without compromising readability.'
        },
        {
          subheading: 'Lossless Structural Optimization',
          content: 'Unlike crude converters that indiscriminately downsample images into pixelated artifacts, our optimization engine focuses on PDF syntax cleanliness, font deduplication, cross-reference stream restructuring, and maximum zlib stream compression for balanced visual integrity.'
        },
        {
          subheading: 'Zero Bandwidth Waste',
          content: 'Uploading and re-downloading large multi-megabyte PDFs over cellular or slow Wi-Fi connections wastes valuable time and mobile data. Because our tool runs natively in your browser via WebAssembly, large files process locally at the full speed of your CPU.'
        }
      ]
    }
  },

  'image-to-pdf': {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    title: 'Convert Images to PDF — JPG, PNG, WebP to PDF',
    path: '/image-to-pdf',
    iconName: 'Image',
    shortDescription: 'Turn JPG, PNG, and WebP images into a single professional PDF with custom page orientation, sizes, and margins.',
    accentColor: 'amber',
    seoTitle: 'Convert Image to PDF Online Free - JPG, PNG, WebP to PDF',
    metaDescription: 'Convert JPG, PNG, and WebP photos into clean PDF documents. Customize page margins, orientation, and A4 sizing with instant private conversion.',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert photo to pdf', 'webp to pdf'],
    canonicalUrl: getCanonicalUrl('/image-to-pdf'),
    directAnswer: 'To convert images to a PDF, upload your JPG, PNG, or WebP pictures, arrange their sequence, choose page layout (Fit to Page, A4 Portrait, or Landscape) and margins, then click "Convert to PDF" to generate your document.',
    howToSteps: [
      { name: 'Upload Images', text: 'Select or drag your JPG, PNG, or WebP files into the uploader.' },
      { name: 'Reorder Pictures', text: 'Drag photos to arrange the exact page sequence in your final document.' },
      { name: 'Configure Layout', text: 'Set page size (A4, Letter, or Fit to Image), orientation, and border margins.' },
      { name: 'Convert & Download', text: 'Click "Convert to PDF" to generate and download your assembled document.' }
    ],
    faqs: [
      { question: 'What image formats can I convert to PDF?', answer: 'You can convert JPEG/JPG, PNG, and modern WebP image formats seamlessly.' },
      { question: 'Can I combine multiple pictures into one PDF?', answer: 'Yes, you can add dozens of photos and compile them into a unified multi-page PDF document.' },
      { question: 'Can I choose between Portrait and Landscape orientation?', answer: 'Yes! You can lock all pages to Portrait, Landscape, or Auto (which aligns each page to match the photo’s natural aspect ratio).' },
      { question: 'Are my images stored or analyzed?', answer: 'No. The conversion is performed exclusively inside your web browser. Your photos never leave your device.' },
      { question: 'Will the image quality be preserved?', answer: 'Yes. Images are embedded directly into the PDF container without unwanted lossy re-compression, retaining full clarity.' }
    ],
    relatedToolIds: ['pdf-to-image', 'merge-pdf', 'rotate-pdf', 'add-watermark-pdf'],
    articleContent: {
      heading: 'Transform Photos and Scans into Pristine PDF Documents',
      sections: [
        {
          subheading: 'Professional Document Creation from Photos',
          content: 'Whether digitizing paper receipts, compiling photo identification for verification, or preparing an artistic portfolio, converting images to a standardized PDF is essential. Our tool standardizes varying image dimensions into uniform pages with configurable padding and margins.'
        },
        {
          subheading: 'Rich Customization Options',
          content: 'Take control of page presentation with options for international A4 dimensions, US Letter, or original aspect ratio preserving canvas sizes. Choose border margins to ensure printable margins when sending documents to standard desktop or commercial printers.'
        },
        {
          subheading: 'Private and Safe Processing',
          content: 'Personal photographs and identity documents require strict privacy guarantees. By converting photos directly within your client browser environment, you ensure that personal metadata, EXIF details, and photo pixels remain strictly in your control.'
        }
      ]
    }
  },

  'pdf-to-image': {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    title: 'Convert PDF to Images — High-Resolution PNG & JPG',
    path: '/pdf-to-image',
    iconName: 'FileImage',
    shortDescription: 'Render PDF pages into crystal-clear PNG or JPG pictures with customizable resolution and batch ZIP download.',
    accentColor: 'rose',
    seoTitle: 'Convert PDF to Image Online Free - PDF to JPG and PNG',
    metaDescription: 'Convert PDF pages into high-resolution JPG or PNG images directly in your browser. Select specific pages, adjust DPI scale, and download as ZIP.',
    keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'extract images from pdf', 'pdf to picture'],
    canonicalUrl: getCanonicalUrl('/pdf-to-image'),
    directAnswer: 'To convert a PDF into images, upload your file, choose the desired image format (PNG or JPG), select the resolution scale (1x, 2x, or 3x High-DPI), choose which pages to convert, and click "Convert to Images". Download individual images or all pages in a ZIP archive.',
    howToSteps: [
      { name: 'Upload PDF', text: 'Drop your PDF document into the conversion area.' },
      { name: 'Select Image Format', text: 'Choose between lossless PNG (best for diagrams and sharp text) or lightweight JPG.' },
      { name: 'Pick Resolution', text: 'Select rendering fidelity from Standard (1x), High (2x), or Ultra-Crisp (3x / 300 DPI equivalent).' },
      { name: 'Convert & Download', text: 'Click "Convert to Images" to render pages and download as single images or a ZIP package.' }
    ],
    faqs: [
      { question: 'Which format should I choose: PNG or JPG?', answer: 'Choose PNG if your PDF contains fine text, charts, line art, or screenshots that require razor-sharp contrast. Choose JPG for scanned photography or to minimize image file sizes.' },
      { question: 'Can I convert only a few specific pages?', answer: 'Yes, you can toggle individual pages or specify a range to convert only the exact pages you need.' },
      { question: 'What rendering resolution is used?', answer: 'You can choose between 1x (web preview), 2x (retina high quality), and 3x (print-ready 300 DPI equivalent) scales.' },
      { question: 'Is my browser memory safely managed?', answer: 'Yes. Our rendering pipeline utilizes hardware-accelerated HTML5 canvases and explicitly frees canvas memory buffers after export to prevent memory leaks.' },
      { question: 'Do I need any server or account to convert?', answer: 'No accounts, credit cards, or server transmissions are involved. Everything runs 100% locally.' }
    ],
    relatedToolIds: ['image-to-pdf', 'split-pdf', 'rotate-pdf', 'compress-pdf'],
    articleContent: {
      heading: 'Render PDF Pages into Crystal-Clear Images',
      sections: [
        {
          subheading: 'High-Fidelity PDF Canvas Rendering',
          content: 'Powered by Mozilla’s PDF.js WebAssembly engine, our PDF to Image converter interprets complex vector instructions, embedded fonts, and CMYK color spaces with exceptional accuracy. The resulting PNG and JPG files mirror your original document faithfully down to the sub-pixel level.'
        },
        {
          subheading: 'Perfect for Presentations and Social Media',
          content: 'Sharing PDF pages on LinkedIn, PowerPoint presentations, or blog articles often requires raster graphic formats. With flexible DPI scaling up to 3x, your exported slides and infographic pages look stunningly sharp on 4K monitors and high-density mobile screens.'
        },
        {
          subheading: 'Fast Batch Downloads',
          content: 'Exporting multi-page manuals or catalogs is painless. All rendered pages are automatically categorized, sequentially numbered, and packaged into a neat ZIP archive that saves to your disk in one click.'
        }
      ]
    }
  },

  'rotate-pdf': {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    title: 'Rotate PDF Pages Online — Fix Orientation Privately',
    path: '/rotate-pdf',
    iconName: 'RotateCw',
    shortDescription: 'Rotate individual pages or entire documents 90°, 180°, or 270° clockwise to fix upside-down or sideways scans.',
    accentColor: 'cyan',
    seoTitle: 'Rotate PDF Online Free - Permanently Change PDF Orientation',
    metaDescription: 'Easily rotate upside-down or sideways PDF pages by 90, 180, or 270 degrees. Rotate individual pages or all pages at once with private client-side processing.',
    keywords: ['rotate pdf', 'turn pdf', 'rotate pdf pages', 'fix pdf orientation', 'rotate pdf 90 degrees'],
    canonicalUrl: getCanonicalUrl('/rotate-pdf'),
    directAnswer: 'To rotate PDF pages, upload your document, click the rotation buttons to turn individual pages or apply a global rotation (90°, 180°, or 270° clockwise) to all pages, then click "Save Rotated PDF" to download your corrected document.',
    howToSteps: [
      { name: 'Upload Document', text: 'Select or drag your PDF file into the rotation viewer.' },
      { name: 'Preview Page Layout', text: 'Browse the interactive thumbnail grid showing current page orientations.' },
      { name: 'Rotate Pages', text: 'Click rotate controls on individual page tiles or use the "Rotate All Pages" toolbar button.' },
      { name: 'Save & Download', text: 'Click "Save & Download" to write permanent rotation metadata into your PDF.' }
    ],
    faqs: [
      { question: 'Is the page rotation permanent?', answer: 'Yes. The rotation modifies the intrinsic PDF /Rotate dictionary property, ensuring the document displays upright in all PDF viewers, printers, and mobile devices.' },
      { question: 'Can I rotate only one page that was scanned sideways?', answer: 'Yes! You can rotate individual pages independently without altering the rest of your document.' },
      { question: 'Does rotating degrade page quality?', answer: 'No. Rotating a PDF simply updates the display transformation matrix. The underlying text, vector shapes, and images remain completely untouched and lossless.' },
      { question: 'What rotation angles are supported?', answer: 'You can rotate pages by 90°, 180° (upside down), or 270° clockwise.' },
      { question: 'Is my file processed securely?', answer: 'Yes, your file is manipulated entirely inside your browser sandbox and is never sent across the web.' }
    ],
    relatedToolIds: ['split-pdf', 'merge-pdf', 'delete-pdf-pages', 'add-watermark-pdf'],
    articleContent: {
      heading: 'Permanently Fix Sideways and Upside-Down PDF Pages',
      sections: [
        {
          subheading: 'Why Scanned Documents End Up Inverted',
          content: 'Automatic document feeders and flatbed scanners often register portrait pages in landscape or upside-down depending on how paper sheets were inserted into the scanner tray. Viewing these misaligned pages forces readers to crane their necks or fumble with viewer controls.'
        },
        {
          subheading: 'True Metadata-Level Rotation',
          content: 'Our browser tool writes the official standard rotation angle (0, 90, 180, or 270 degrees) directly into each page object dictionary. When you distribute your rotated PDF to clients, colleagues, or court filers, it renders right-side up everywhere automatically.'
        },
        {
          subheading: 'Interactive Visual Thumbnail Grid',
          content: 'Quickly scan your entire document with our visual page grid. Rotate odd pages, even pages, or specific misoriented sheets with immediate visual confirmation before downloading.'
        }
      ]
    }
  },

  'delete-pdf-pages': {
    id: 'delete-pdf-pages',
    name: 'Delete PDF Pages',
    title: 'Delete PDF Pages Online — Remove Unwanted Sheets',
    path: '/delete-pdf-pages',
    iconName: 'Trash2',
    shortDescription: 'Remove unwanted, blank, or sensitive pages from your PDF file with an intuitive visual selection grid.',
    accentColor: 'red',
    seoTitle: 'Delete PDF Pages Online Free - Remove Pages from PDF Privately',
    metaDescription: 'Quickly remove unwanted or blank pages from your PDF documents. Select pages visually, keep vital content, and download your clean PDF with zero uploads.',
    keywords: ['delete pdf pages', 'remove pages from pdf', 'delete pages online', 'pdf page remover'],
    canonicalUrl: getCanonicalUrl('/delete-pdf-pages'),
    directAnswer: 'To delete pages from a PDF, upload your file, click the pages you want to remove on the thumbnail grid or enter page numbers to delete, and click "Remove Selected Pages". Your streamlined document is generated immediately.',
    howToSteps: [
      { name: 'Upload PDF', text: 'Select or drag your PDF document into the page deletion tool.' },
      { name: 'Select Pages to Remove', text: 'Click thumbnails of pages you want to delete or type page numbers (e.g. 2, 4-6).' },
      { name: 'Review Selection', text: 'Verify remaining page count—the tool safeguards against accidental deletion of all pages.' },
      { name: 'Save Updated PDF', text: 'Click "Remove Pages & Save" to download your cleaned document.' }
    ],
    faqs: [
      { question: 'What happens if I accidentally select all pages?', answer: 'The tool has a built-in safeguard preventing you from deleting every single page, ensuring your resulting document always contains valid content.' },
      { question: 'Can I delete multiple ranges at once?', answer: 'Yes, you can click multiple thumbnails or enter comma-separated numbers and ranges like "1, 3, 5-8".' },
      { question: 'Does removing pages reduce the overall PDF file size?', answer: 'Yes! Removing unused pages discards associated text streams, embedded images, and annotations, making your file lighter.' },
      { question: 'Are deleted pages recoverable from the exported file?', answer: 'No. The newly exported PDF is constructed from scratch containing only the preserved pages. Removed content is completely purged.' },
      { question: 'Is my data secure?', answer: 'Yes. Processing happens purely in your browser memory without ever touching any external server.' }
    ],
    relatedToolIds: ['split-pdf', 'rotate-pdf', 'merge-pdf', 'compress-pdf'],
    articleContent: {
      heading: 'Clean and Streamline Documents by Removing Unwanted Pages',
      sections: [
        {
          subheading: 'Purge Blank Pages and Irrelevant Content',
          content: 'Whether cleaning up accidental blank scanner pages, stripping internal cover letters before client delivery, or trimming unnecessary terms of service sheets, deleting surplus pages produces clean, professional documents.'
        },
        {
          subheading: 'Visual Point-and-Click Interface',
          content: 'No need to guess page numbers from memory. Our interactive visual thumbnail gallery renders page previews so you can confidently click and flag exactly the pages you wish to eliminate.'
        },
        {
          subheading: 'Irreversible Sanitization for Sharing',
          content: 'When you delete pages using our client-side engine, the omitted pages are never written to the output file structure. This ensures confidential draft pages or sensitive client appendixes cannot be retrieved by inspecting raw PDF streams.'
        }
      ]
    }
  },

  'protect-pdf': {
    id: 'protect-pdf',
    name: 'Protect PDF',
    title: 'Protect PDF with Password — Industry-Standard AES-256',
    path: '/protect-pdf',
    iconName: 'Lock',
    shortDescription: 'Encrypt your PDF with strong 256-bit AES encryption and set user and owner passwords to restrict unauthorized access.',
    badge: 'Security',
    accentColor: 'violet',
    seoTitle: 'Protect PDF with Password Online Free - Strong AES-256 Encryption',
    metaDescription: 'Encrypt PDF files online with real 256-bit AES protection. Set open passwords and permissions right in your browser without uploading confidential files.',
    keywords: ['protect pdf', 'encrypt pdf', 'password protect pdf', 'lock pdf', 'secure pdf online'],
    canonicalUrl: getCanonicalUrl('/protect-pdf'),
    directAnswer: 'To password protect a PDF, upload your document, enter a secure user password (and optional owner password), confirm your password, and click "Protect PDF". The document is encrypted with industry-standard 256-bit AES directly in your browser.',
    howToSteps: [
      { name: 'Upload PDF Document', text: 'Select or drag your PDF file into the encryption workspace.' },
      { name: 'Enter Password', text: 'Type a strong password to require upon opening the document.' },
      { name: 'Confirm Password', text: 'Re-enter your password to prevent lockout typos.' },
      { name: 'Encrypt & Download', text: 'Click "Protect PDF" to apply real 256-bit AES encryption via QPDF WebAssembly and download the secured file.' }
    ],
    faqs: [
      { question: 'Is this real PDF encryption or just a simulated restriction?', answer: 'This applies real, industry-standard 256-bit AES encryption compliant with Adobe PDF standards via QPDF WebAssembly. Standard PDF readers will strictly require the password to open the file.' },
      { question: 'Why is client-side encryption safer than online tools?', answer: 'Traditional cloud tools require you to upload your unencrypted document and your secret password to their servers over the internet. Our tool encrypts your file entirely in your local browser memory—neither your file nor your password ever leaves your computer.' },
      { question: 'What encryption standard is used?', answer: 'We use modern 256-bit AES (Advanced Encryption Standard), the gold standard endorsed by cybersecurity experts worldwide.' },
      { question: 'Can I set an owner password to restrict printing or editing?', answer: 'Yes, you can configure both a user password (required to view the file) and an owner password (which grants administrative permission to modify or decrypt).' },
      { question: 'What happens if I forget the password?', answer: 'Because AES-256 is cryptographically unbreakable without the key, please store your password safely. We cannot recover lost passwords.' }
    ],
    relatedToolIds: ['unlock-pdf', 'compress-pdf', 'merge-pdf', 'split-pdf'],
    articleContent: {
      heading: 'Industry-Standard 256-Bit AES Client-Side PDF Encryption',
      sections: [
        {
          subheading: 'Why Sending Passwords to Web Servers is Dangerous',
          content: 'Most popular online PDF tools require you to upload your sensitive tax documents, medical forms, or business contracts alongside the plaintext password you intend to protect it with. This exposes both your private data and your credentials to potential server logs, breaches, or insider threats. Our tool executes QPDF WebAssembly locally: your password encrypts your data right in browser RAM.'
        },
        {
          subheading: 'Standard-Compliant 256-Bit AES Security',
          content: 'We adhere strictly to ISO 32000-2 (PDF 2.0) and Adobe PDF encryption standards. When you open a protected document in Adobe Acrobat, Apple Preview, Google Chrome, or Microsoft Edge, the viewer prompts for the password before rendering any content.'
        },
        {
          subheading: 'Granular Permissions and Owner Passwords',
          content: 'In addition to open passwords, you can configure owner permissions to disallow unauthorized printing, text copying, or content alterations while allowing authorized recipients to review the content.'
        }
      ]
    }
  },

  'unlock-pdf': {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    title: 'Unlock PDF Online — Remove Password & Restrictions',
    path: '/unlock-pdf',
    iconName: 'Unlock',
    shortDescription: 'Remove password security and usage restrictions from your encrypted PDF documents by verifying the authorized password.',
    accentColor: 'teal',
    seoTitle: 'Unlock PDF Online Free - Remove PDF Password Client-Side',
    metaDescription: 'Decrypt password-protected PDFs and remove printing and copying restrictions. Enter your valid password for instant in-browser decryption with zero uploads.',
    keywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf', 'pdf password remover', 'unlock pdf online'],
    canonicalUrl: getCanonicalUrl('/unlock-pdf'),
    directAnswer: 'To unlock a PDF, upload the password-protected document, enter its existing password to authenticate decryption, and click "Unlock PDF". The security wrapper is decrypted using WebAssembly, producing an unrestricted PDF ready for download.',
    howToSteps: [
      { name: 'Upload Protected PDF', text: 'Drop your encrypted PDF into the unlock tool.' },
      { name: 'Enter Current Password', text: 'Type the valid user or owner password for the document.' },
      { name: 'Decrypt File', text: 'Click "Unlock PDF" to verify the key and strip the encryption wrapper.' },
      { name: 'Download Unlocked File', text: 'Download your permanently unlocked, restriction-free document.' }
    ],
    faqs: [
      { question: 'Does this tool bypass passwords without knowing them?', answer: 'No. To ensure ethical compliance and true cryptographic integrity, you must supply the legitimate user or owner password. Our engine verifies the password and produces a decrypted version without restrictions.' },
      { question: 'What happens if I enter the wrong password?', answer: 'The tool provides a clear, honest error message notifying you that the password was incorrect, without corrupting your file.' },
      { question: 'Will the unlocked PDF still require a password in other viewers?', answer: 'No. Once unlocked, the encryption dictionary is stripped entirely. The new file can be opened by anyone in any PDF viewer without password prompts.' },
      { question: 'Does unlocking remove print and copy restrictions?', answer: 'Yes. Decrypting the PDF eliminates all restriction flags, allowing full printing, copying, and modification.' },
      { question: 'Are my decrypted documents safe?', answer: 'Yes! The decryption takes place 100% inside your browser tab memory using WebAssembly. Your files and passwords are never transmitted anywhere.' }
    ],
    relatedToolIds: ['protect-pdf', 'compress-pdf', 'merge-pdf', 'split-pdf'],
    articleContent: {
      heading: 'Legitimate, Secure Client-Side PDF Decryption',
      sections: [
        {
          subheading: 'Streamline Your Document Archive',
          content: 'Password-protected bank statements, utility bills, and paystubs are great for initial email delivery, but keeping passwords memorized across years of archived records creates friction. Once you verify ownership by supplying the password, our unlock tool creates a clean, unencrypted archive copy.'
        },
        {
          subheading: 'Ethical and Compliant Cryptographic Standards',
          content: 'Modern AES-256 encryption cannot be brute-forced or bypassed by honest software. Our tool validates your password through standard cryptographic key derivation, decrypts the object streams, and outputs a compliant unencrypted PDF format.'
        },
        {
          subheading: 'Total Privacy Guarantee',
          content: 'Never upload your personal passwords or decrypted financial records to unknown cloud converters. By performing the decryption in your local browser sandbox, your documents remain private to your device.'
        }
      ]
    }
  },

  'add-watermark-pdf': {
    id: 'add-watermark-pdf',
    name: 'Add Watermark',
    title: 'Add Watermark to PDF — Custom Text & Confidential Stamps',
    path: '/add-watermark-pdf',
    iconName: 'Stamp',
    shortDescription: 'Stamp custom text, copyright notices, or "CONFIDENTIAL" watermarks across your PDF with full control over style and placement.',
    accentColor: 'purple',
    seoTitle: 'Add Watermark to PDF Online Free - Custom Text & Stamp Watermarks',
    metaDescription: 'Add text watermarks to your PDF online. Customize text, font size, color, opacity, angle, and position. 100% client-side privacy with instant preview.',
    keywords: ['add watermark to pdf', 'watermark pdf', 'pdf text stamp', 'confidential watermark', 'stamp pdf online'],
    canonicalUrl: getCanonicalUrl('/add-watermark-pdf'),
    directAnswer: 'To add a watermark to your PDF, upload your document, enter your watermark text (e.g., CONFIDENTIAL, DRAFT), adjust font size, color, opacity, and rotation angle, then click "Apply Watermark". Download your stamped PDF instantly.',
    howToSteps: [
      { name: 'Upload PDF', text: 'Select or drop your PDF document into the watermark tool.' },
      { name: 'Enter Text', text: 'Type your custom watermark text (e.g. "CONFIDENTIAL", "SAMPLE", or your name/brand).' },
      { name: 'Customize Appearance', text: 'Fine-tune font size, color, opacity transparency (e.g. 30%), angle (-45° diagonal), and position.' },
      { name: 'Apply & Download', text: 'Click "Apply Watermark" to embed the stamp across all or selected pages and download.' }
    ],
    faqs: [
      { question: 'Can I adjust watermark transparency so text remains readable?', answer: 'Yes! You can adjust opacity from 10% (subtle background watermark) up to 100% (bold foreground stamp).' },
      { question: 'What positions and angles are available?', answer: 'You can position watermarks in the Center, Top, Bottom, or Corners, and angle them diagonally (-45°, 45°) or horizontally (0°).' },
      { question: 'Can I apply the watermark to specific pages only?', answer: 'Yes, you can choose to stamp all pages, only the first page, or custom page ranges.' },
      { question: 'Will the watermark be permanent when shared?', answer: 'Yes, the watermark text is embedded into the vector graphic layer of the PDF pages, making it visible in any PDF reader and on printed copies.' },
      { question: 'Are my documents uploaded to a server?', answer: 'No. The stamping process executes completely inside your browser client memory.' }
    ],
    relatedToolIds: ['protect-pdf', 'rotate-pdf', 'merge-pdf', 'image-to-pdf'],
    articleContent: {
      heading: 'Protect Intellectual Property with Custom PDF Watermarks',
      sections: [
        {
          subheading: 'Safeguard Drafts, Proposals, and Confidential Documents',
          content: 'Before sharing preliminary designs, business proposals, financial reports, or legal drafts, stamping them with "CONFIDENTIAL", "DRAFT", or a copyright notice prevents unauthorized redistribution and sets clear expectations with recipients.'
        },
        {
          subheading: 'Granular Visual Customization',
          content: 'Every document requires a different aesthetic balance. Our watermark tool provides sliders for opacity, font scale, color picker, position presets, and angle rotation, ensuring your watermark is authoritative without obscuring underlying data.'
        },
        {
          subheading: 'High-Precision Vector Stamping',
          content: 'Watermarks are drawn as scalable vector text elements using standard typography metrics. Whether your document is viewed on a smartphone or printed on commercial paper, the watermark renders with pristine edge clarity.'
        }
      ]
    }
  }
};

// Aliases for backwards compatibility with previous paths
TOOLS_DATA['delete-pages'] = TOOLS_DATA['delete-pdf-pages'];
TOOLS_DATA['add-watermark'] = TOOLS_DATA['add-watermark-pdf'];

// Merge the 10 extended tools
import { EXTENDED_TOOLS_DATA } from './extendedToolsData.ts';
Object.assign(TOOLS_DATA, EXTENDED_TOOLS_DATA);

export const ALL_TOOLS_LIST: ToolData[] = [
  // 1-10 Core Tools
  TOOLS_DATA['merge-pdf'],
  TOOLS_DATA['split-pdf'],
  TOOLS_DATA['compress-pdf'],
  TOOLS_DATA['image-to-pdf'],
  TOOLS_DATA['pdf-to-image'],
  TOOLS_DATA['rotate-pdf'],
  TOOLS_DATA['delete-pdf-pages'],
  TOOLS_DATA['protect-pdf'],
  TOOLS_DATA['unlock-pdf'],
  TOOLS_DATA['add-watermark-pdf'],

  // 11-20 Extended Tools
  TOOLS_DATA['pdf-to-word'],
  TOOLS_DATA['word-to-pdf'],
  TOOLS_DATA['pdf-to-excel'],
  TOOLS_DATA['excel-to-pdf'],
  TOOLS_DATA['pdf-to-ppt'],
  TOOLS_DATA['ppt-to-pdf'],
  TOOLS_DATA['sign-pdf'],
  TOOLS_DATA['edit-pdf'],
  TOOLS_DATA['add-page-numbers'],
  TOOLS_DATA['crop-pdf']
];
