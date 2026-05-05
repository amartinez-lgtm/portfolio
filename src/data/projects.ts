export interface Project {
  id: string
  name: string
  tagline: string
  description: string
  loc: string
  tags: string[]
  url?: string
  highlight?: string
  aiNote?: string
}

export interface SideHustle {
  id: string
  name: string
  tagline: string
  description: string
  tags: string[]
  status: 'active' | 'in-progress' | 'planned'
}

export interface CareerStory {
  id: string
  title: string
  hook: string
  body: string
  tags: string[]
}

export const projects: Project[] = [
  {
    id: 'qms',
    name: 'QMS',
    tagline: 'AI-powered AS9100D quality lifecycle system',
    description:
      'End-to-end quality management system for an AS9100-certified aerospace machine shop. AI reads incoming purchase orders, extracts contractual quality clauses, and scans customer flow-down requirements — flagging gaps before production starts. Covers the full lifecycle: NCRs, CARs, document control, supplier management, internal audits, and management review. Replaced a patchwork of spreadsheets and paper forms with a single system that actually enforces compliance.',
    loc: '70K LOC',
    tags: ['TypeScript', 'React', 'AS9100D', 'PostgreSQL', 'OpenAI'],
    url: 'https://qms.ffmfg.com',
    aiNote: 'AI reads purchase orders and customer contracts, extracts quality clauses, and scans flow-down requirements automatically — the kind of free-text parsing that deterministic code can\'t handle reliably.',
  },
  {
    id: 'inspectai',
    name: 'InspectAI',
    tagline: 'FAI, PPAP, FMEA, and control plan automation — seconds, not days',
    description:
      'Automates the most time-consuming documentation in aerospace manufacturing. InspectAI reads engineering drawings, pulls inspection data, and generates complete First Article Inspection packages, PPAPs, FMEAs, and control plans — standards-compliant deliverables in seconds instead of days. AI analyzes drawing annotations and maps dimensional callouts to inspection results. The auto-balloon engine was benchmarked against GPT-4V (~70% accuracy on callout detection), then replaced with a deterministic geometry parser that hits 100% in production — AI for the unstructured work, deterministic code for what has to be exact.',
    loc: '38K LOC',
    tags: ['TypeScript', 'React', 'PDF Processing', 'Computer Vision', 'PPAP', 'FMEA'],
    url: 'https://inspectai.ffmfg.com',
    highlight: 'ai-wrong-tool',
    aiNote: 'AI handles drawing annotation analysis and unstructured data extraction. The balloon detection feature evaluated GPT-4V (70%) before switching to a deterministic geometry parser (100%). Right tool, right job.',
  },
  {
    id: 'autodatapack',
    name: 'AutoDataPack',
    tagline: 'AS9102 data packages in 10 minutes — used to take hours',
    description:
      'Eliminates the manual grind of AS9102 First Article Inspection data package assembly. AutoDataPack automatically populates the required AS9102 forms, pulls in inspection results, and compiles a complete, submission-ready data package — all in under 10 minutes. A process that previously took a quality engineer several hours of copying, formatting, and checking is now a single button press. Distributed as a standalone Windows .exe so it runs on any shop floor machine with no setup.',
    loc: '35K LOC',
    tags: ['TypeScript', 'Electron', 'AS9102', 'PDF Generation'],
  },
  {
    id: 'quality-release',
    name: 'Quality Release Queue',
    tagline: 'ERP dashboard — whiteboard to production in one day',
    description:
      'Real-time production release dashboard integrated with the shop ERP. Built in a single day from whiteboard sketch to live production URL — giving the quality team instant visibility into part status across the floor.',
    loc: '9K LOC',
    tags: ['TypeScript', 'React', 'ERP Integration', 'Real-time'],
    highlight: 'one-day',
  },
  {
    id: 'pledgepact',
    name: 'PledgePact',
    tagline: 'AI-powered social commitment platform',
    description:
      'Social app where users make public commitments and hold each other accountable using AI-assisted tracking and nudges. Built with real-time socket connections for live accountability feeds.',
    loc: '6K LOC',
    tags: ['Node.js', 'Express', 'Socket.io', 'Supabase', 'OpenAI'],
    aiNote: 'Uses OpenAI to generate personalized accountability nudges and surface commitment patterns — a case where unstructured language generation is the right fit.',
  },
  {
    id: 'xyz-shopify',
    name: 'XYZ Shopify Store',
    tagline: 'Digital product e-commerce with 3D model pipeline',
    description:
      'Backend for a digital-product Shopify store. Handles webhook-triggered automated delivery of downloadable 3D print files, with a FastAPI service that processes and validates models using trimesh before fulfillment.',
    loc: '2.7K LOC',
    tags: ['Python', 'FastAPI', 'Shopify', 'trimesh', '3D Models'],
  },
]

export const sideHustles: SideHustle[] = [
  {
    id: '3d-printing',
    name: '3D Printing — Physical Products',
    tagline: 'Designing and selling household products',
    description:
      'Running a Bambu X1C to design and print household products — candle holders, dispensers, organizers. From CAD to finished product.',
    tags: ['Bambu X1C', 'FDM', 'CAD', 'Product Design'],
    status: 'active',
  },
  {
    id: '3d-files',
    name: 'Digital 3D Model Files',
    tagline: 'Downloadable files sold via Shopify',
    description:
      'Selling downloadable 3D print files through a Shopify storefront with automated delivery — no manual fulfillment, files land in the buyer\'s inbox the moment payment clears.',
    tags: ['Shopify', 'Digital Products', 'FastAPI', 'Automation'],
    status: 'active',
  },
  {
    id: 'lidar',
    name: 'UAV / LiDAR Mapping',
    tagline: 'Handheld scanning, photogrammetry, terrain modeling',
    description:
      'Handheld LiDAR scanning and drone photogrammetry missions. Processing point clouds and aerial imagery into terrain models and deliverables using Pix4D and Drone2Map.',
    tags: ['LiDAR', 'Photogrammetry', 'Pix4D', 'Drone2Map', 'GIS'],
    status: 'active',
  },
  {
    id: 'golf-irons',
    name: 'Golf Irons Manufacturing',
    tagline: 'Custom irons project with a manufacturing partner',
    description:
      'Applying aerospace manufacturing knowledge to a custom golf iron project — from material selection and tolerances to production process design.',
    tags: ['Manufacturing', 'CNC', 'Product Development'],
    status: 'in-progress',
  },
  {
    id: 'hydroponics',
    name: 'Hydroponic Garden',
    tagline: 'Indoor growing system build',
    description:
      'Designing and building an indoor hydroponic system. Because if you can control a CNC machine, you can control nutrient flow.',
    tags: ['Hardware', 'Automation', 'IoT'],
    status: 'in-progress',
  },
  {
    id: 'qr-tracking',
    name: 'QR Tool Tracking SaaS',
    tagline: 'Planned — shop floor tool management',
    description:
      'QR-code-based tool tracking SaaS for machine shops. Scan to check out, scan to return — real-time visibility into where every tool is and when it was last calibrated.',
    tags: ['SaaS', 'Manufacturing', 'QR', 'Planned'],
    status: 'planned',
  },
]

export const careerStories: CareerStory[] = [
  {
    id: 'one-day',
    title: 'Plan to live in one day',
    hook: 'Whiteboard sketch to production URL before the shift ended.',
    body: 'The quality team needed a way to see real-time part release status from the ERP without pulling up spreadsheets or asking the floor. I whiteboarded the concept in the morning, built the ERP integration and React dashboard through the day, and pushed it to a live production URL before end of shift. Quality Release Queue has been in daily use since.',
    tags: ['Quality Release Queue', 'ERP', 'React', 'Speed'],
  },
  {
    id: 'ai-wrong-tool',
    title: 'AI is the wrong tool here',
    hook: 'GPT-4V got 70% accuracy on drawing balloons. I built a deterministic engine that gets 100%.',
    body: 'For InspectAI\'s auto-balloon feature, I benchmarked GPT-4V on the task of identifying and numbering inspection callouts on engineering drawings. It topped out around 70% — not good enough for an AS9100 shop where every callout has to be documented. I scrapped the AI approach and built a deterministic parser that reads the drawing geometry directly. It\'s been 100% accurate in production. Sometimes the right answer is less magic, not more.',
    tags: ['InspectAI', 'AI/ML', 'Engineering', 'Decision-making'],
  },
  {
    id: 'zero-audit',
    title: '0-finding audit',
    hook: 'First zero-finding internal audit in company history.',
    body: 'After building and rolling out the full QMS, we ran our next internal audit cycle with the system fully in place. Zero findings — the first time in Final Frontier Manufacturing\'s history. Not because we hid problems, but because the system actually worked: corrective actions were closed on time, documents were controlled, records were current. The audit confirmed the software was doing its job.',
    tags: ['QMS', 'AS9100D', 'Quality', 'Impact'],
  },
]
