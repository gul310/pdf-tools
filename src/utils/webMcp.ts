/**
 * WebMCP: Emerging Web Model Context Tool Registration
 *
 * Implements navigator.modelContext.registerTool() safely when supported by
 * user-agent environments (e.g. AI-enabled browsers or agent runtimes).
 * Exposes real, useful, client-side tools with accurate schemas and execution callbacks.
 */

import { ALL_TOOLS_LIST, TOOLS_DATA } from '../data/toolsData.ts';
import { EXTENDED_TOOLS_DATA } from '../data/extendedToolsData.ts';

interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
  execute: (params?: any) => Promise<any> | any;
}

export function registerWebMcpTools(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const nav = navigator as any;
  if (!nav || !nav.modelContext || typeof nav.modelContext.registerTool !== 'function') {
    // WebMCP API is not supported in standard browsers
    return false;
  }

  try {
    const tools: ToolSchema[] = [
      {
        name: 'get_pdf_tool_catalog',
        description: 'Returns the catalog of all 20 client-side PDF and office document processing tools available on PDF1998, including routes and categories.',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Optional category filter',
              enum: ['all', 'organize', 'convert-from', 'convert-to', 'security-edit']
            }
          }
        },
        execute: async (params: { category?: string }) => {
          const cat = params.category || 'all';
          const filtered = ALL_TOOLS_LIST.filter(tool => {
            if (cat === 'all') return true;
            if (cat === 'organize') return ['merge-pdf', 'split-pdf', 'rotate-pdf', 'delete-pdf-pages', 'crop-pdf', 'add-page-numbers'].includes(tool.id);
            if (cat === 'convert-from') return ['pdf-to-word', 'pdf-to-excel', 'pdf-to-ppt', 'pdf-to-image'].includes(tool.id);
            if (cat === 'convert-to') return ['word-to-pdf', 'excel-to-pdf', 'ppt-to-pdf', 'image-to-pdf'].includes(tool.id);
            if (cat === 'security-edit') return ['protect-pdf', 'unlock-pdf', 'add-watermark-pdf', 'sign-pdf', 'edit-pdf', 'compress-pdf'].includes(tool.id);
            return true;
          });

          return {
            totalTools: filtered.length,
            tools: filtered.map(t => ({
              id: t.id,
              name: t.name,
              path: `https://pdf1998.com${t.path}`,
              description: t.shortDescription
            }))
          };
        }
      },
      {
        name: 'get_tool_documentation',
        description: 'Returns step-by-step how-to instructions, direct answers, and FAQ guidance for a specific PDF tool.',
        parameters: {
          type: 'object',
          properties: {
            toolId: {
              type: 'string',
              description: 'The tool identifier (e.g. merge-pdf, compress-pdf, protect-pdf, pdf-to-word)'
            }
          },
          required: ['toolId']
        },
        execute: async (params: { toolId: string }) => {
          const tool = TOOLS_DATA[params.toolId] || EXTENDED_TOOLS_DATA[params.toolId];
          if (!tool) {
            return {
              error: `Tool with id '${params.toolId}' not found. Available tool IDs can be found via get_pdf_tool_catalog.`
            };
          }

          return {
            id: tool.id,
            name: tool.name,
            url: tool.canonicalUrl,
            directAnswer: tool.directAnswer,
            steps: tool.howToSteps,
            faqs: tool.faqs,
            relatedTools: tool.relatedToolIds
          };
        }
      },
      {
        name: 'get_privacy_architecture',
        description: 'Returns technical verification details regarding zero-server-upload privacy and WebAssembly client-side execution.',
        parameters: {
          type: 'object',
          properties: {}
        },
        execute: async () => {
          return {
            architecture: '100% Client-Side In-Browser Memory',
            serverUploads: false,
            dataEgress: '0 bytes',
            cryptography: 'Standard 256-Bit AES (QPDF WASM)',
            libraries: ['QPDF WASM', 'pdf-lib', 'pdfjs-dist', 'docx', 'xlsx', 'pptxgenjs'],
            offlineCapable: true
          };
        }
      },
      {
        name: 'navigate_to_pdf_tool',
        description: 'Navigates the user to the specified PDF tool page on PDF1998.',
        parameters: {
          type: 'object',
          properties: {
            toolId: {
              type: 'string',
              description: 'Tool identifier to navigate to'
            }
          },
          required: ['toolId']
        },
        execute: async (params: { toolId: string }) => {
          const tool = TOOLS_DATA[params.toolId] || EXTENDED_TOOLS_DATA[params.toolId];
          if (!tool) {
            return { success: false, message: `Tool '${params.toolId}' not recognized.` };
          }
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = tool.path;
            return { success: true, navigatedTo: tool.path };
          }
          return { success: false, message: 'Window object not available.' };
        }
      }
    ];

    for (const tool of tools) {
      nav.modelContext.registerTool(tool);
    }

    return true;
  } catch (err) {
    console.warn('Failed to register WebMCP tools:', err);
    return false;
  }
}
