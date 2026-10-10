import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const OPS_ROLE_INSTRUCTIONS: Record<string, string> = {
  concierge: `You are "Ops", the California Client Concierge for AUREL CLEANING CO. ("Exceptional Spaces. Impeccable Standards.").
Your role is to assist affluent homeowners, estate managers, real estate advisors, and commercial studio directors across California (Beverly Hills, Bel Air, Malibu, Pacific Palisades, Montecito, Santa Barbara, Newport Beach, La Jolla, San Francisco Pacific Heights, Palo Alto / Atherton, and Napa Valley).
Key brand facts:
- Services: 1) Luxury Residential Cleaning, 2) Deep Cleaning, 3) Move-In & Move-Out Cleaning, 4) Commercial Cleaning, 5) Post-Construction Cleaning, 6) Recurring Maintenance Cleaning.
- Service Plan Tiers: Essential Care (regular upkeep), Signature Clean (comprehensive architectural detailing), and Bespoke Property Care (custom protocols for estates, penthouses, and multi-property portfolios).
- Pricing policy: Never invent flat dollar prices. Explain that quotes are tailored to square footage, architectural materials, condition, and frequency via the 4-step Book Now page.
- Team & Equipment: Coordinated uniformed specialists in midnight-navy collared shirts, scratch-free slate linen aprons, indoor soft-sole shoes, and detailing gloves, equipped with commercial stainless HEPA H14 vacuums, solid brass squeegees, horsehair brushes, and pH-neutral stone/wood formulations.
Keep responses poised, warm, concise (2-4 sentences or clean bullet points), and hospitality-driven.`,

  surfaces: `You are "Ops (Surface & Material Specialist)", the Architectural Surface Care Advisor for AUREL CLEANING CO. in California.
Your role is to advise clients on how Aurel protects and details delicate luxury materials:
- Natural Stone (honed Calacatta/Carrara marble, travertine, limestone): Strictly pH-neutral, non-acidic formulations and two-stage dry microfiber buffing—never vinegar, lemon, bleach, or abrasive pads.
- Wide-Plank European Oak & Custom Millwork (walnut, cedar soffits): Moisture-controlled conditioning and soft natural horsehair/boar-bristle brush dusting along architectural reveals.
- Coastal & Architectural Glass (Malibu oceanfront glass, motorized pocket sliders, Starphire steam showers): Deionized water, medical-grade rubber solid brass squeegees, and recessed track extraction.
- Post-Construction Fine Dust: 3-phase commercial HEPA H14 filtration inside cabinetry, lighting coves, and air diffusers.
Keep answers authoritative, precise, and concise (2-4 sentences).`,

  operations: `You are "Ops (Estate & Commercial Operations)", the Operations & Scheduling Coordinator for AUREL CLEANING CO. across California.
Your role is to help estate managers, real estate agents, and corporate/studio directors plan logistics:
- Multi-specialist uniformed team deployments, NDA/discreet access protocols, and coordination with household staff or interior designers.
- Commercial after-hours, early-morning, or daytime porter schedules for executive boardrooms, architectural ateliers, art galleries, and family offices.
- Turnkey Move-In/Move-Out and Post-Construction handover timelines.
Keep responses structured, practical, and concise (2-4 sentences), inviting them to log their property specifications on the Book Now page.`,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');

export interface QuoteSubmission {
  id: string;
  referenceCode: string;
  createdAt: string;
  status: 'received_by_server' | 'forwarded_to_crm';
  crmConfigured: boolean;
  serviceType: string;
  planTier: string;
  propertyType: string;
  propertySize: string;
  bedrooms: string;
  bathrooms: string;
  frequency: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  californiaRegion?: string;
  additionalRequirements: string;
  fullName: string;
  email: string;
  phone: string;
  additionalMessage: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(QUOTES_FILE)) {
    fs.writeFileSync(QUOTES_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readQuotes(): QuoteSubmission[] {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(QUOTES_FILE, 'utf-8');
    return JSON.parse(raw) as QuoteSubmission[];
  } catch {
    return [];
  }
}

function saveQuote(submission: QuoteSubmission): void {
  try {
    ensureDataDir();
    const existing = readQuotes();
    existing.unshift(submission);
    fs.writeFileSync(QUOTES_FILE, JSON.stringify(existing.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist quote to disk:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Health & CRM status endpoint
  app.get('/api/status', (_req, res) => {
    res.json({
      ok: true,
      crmWebhookConfigured: Boolean(process.env.CRM_WEBHOOK_URL),
      serviceRegion: 'California',
    });
  });

  // Get recent bookings/quotes
  app.get('/api/quotes', (_req, res) => {
    const quotes = readQuotes();
    res.json({ quotes });
  });

  // Submit a quote or Book Now request
  app.post('/api/quotes', async (req, res) => {
    try {
      const body = req.body || {};

      // Spam honeypot check
      if (body.websiteUrlHoneypot && String(body.websiteUrlHoneypot).trim() !== '') {
        return res.status(400).json({
          error: 'Automated submission detected.',
        });
      }

      const requiredFields = [
        'serviceType',
        'propertyType',
        'propertySize',
        'frequency',
        'preferredDate',
        'preferredTime',
        'location',
        'fullName',
        'email',
        'phone',
      ];

      for (const field of requiredFields) {
        if (!body[field] || String(body[field]).trim() === '') {
          return res.status(400).json({
            error: `Missing required field: ${field}`,
          });
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(body.email).trim())) {
        return res.status(400).json({
          error: 'Please provide a valid email address.',
        });
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      const referenceCode = `AUR-CA-${year}-${randomSuffix}`;
      const crmWebhookUrl = process.env.CRM_WEBHOOK_URL;
      let status: 'received_by_server' | 'forwarded_to_crm' = 'received_by_server';

      const submission: QuoteSubmission = {
        id: `${Date.now()}-${randomSuffix}`,
        referenceCode,
        createdAt: new Date().toISOString(),
        status,
        crmConfigured: Boolean(crmWebhookUrl),
        serviceType: String(body.serviceType).trim(),
        planTier: String(body.planTier || 'Signature Clean').trim(),
        propertyType: String(body.propertyType).trim(),
        propertySize: String(body.propertySize).trim(),
        bedrooms: String(body.bedrooms || 'Not applicable').trim(),
        bathrooms: String(body.bathrooms || 'Not applicable').trim(),
        frequency: String(body.frequency).trim(),
        preferredDate: String(body.preferredDate).trim(),
        preferredTime: String(body.preferredTime).trim(),
        location: String(body.location).trim(),
        californiaRegion: String(body.californiaRegion || 'California').trim(),
        additionalRequirements: String(body.additionalRequirements || '').trim(),
        fullName: String(body.fullName).trim(),
        email: String(body.email).trim(),
        phone: String(body.phone).trim(),
        additionalMessage: String(body.additionalMessage || '').trim(),
      };

      if (crmWebhookUrl) {
        try {
          const webhookRes = await fetch(crmWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission),
          });
          if (webhookRes.ok) {
            submission.status = 'forwarded_to_crm';
          }
        } catch (webhookErr) {
          console.error('CRM webhook forwarding error:', webhookErr);
        }
      }

      saveQuote(submission);

      return res.status(201).json({
        success: true,
        submission,
        note: crmWebhookUrl
          ? 'Your request has been logged and forwarded to our California Concierge CRM.'
          : 'Your request has been saved to the local Aurel server datastore. Configure CRM_WEBHOOK_URL in .env to forward submissions to an external production CRM.',
      });
    } catch (error) {
      console.error('Quote submission error:', error);
      return res.status(500).json({
        error: 'Unable to process your booking request at this moment. Please try again.',
      });
    }
  });

  // Ops — Multi-Turn Gemini AI Concierge Chat endpoint
  app.post('/api/concierge', async (req, res) => {
    const { message, history, persona = 'concierge', speedMode = 'standard', currentRegion } =
      req.body || {};
    const userText = String(message || '').trim();

    if (!userText) {
      return res.status(400).json({ error: 'Please enter a message for Ops.' });
    }

    const lower = userText.toLowerCase();
    let suggestedAction:
      | 'open_book_page'
      | 'view_map'
      | 'view_services'
      | 'view_properties'
      | null = 'open_book_page';

    if (
      lower.includes('map') ||
      lower.includes('area') ||
      lower.includes('california') ||
      lower.includes('beverly') ||
      lower.includes('malibu') ||
      lower.includes('francisco') ||
      lower.includes('montecito')
    ) {
      suggestedAction = 'view_map';
    } else if (lower.includes('propert') || lower.includes('estate') || lower.includes('villa') || lower.includes('penthouse')) {
      suggestedAction = 'view_properties';
    } else if (lower.includes('service') || lower.includes('commercial') || lower.includes('office')) {
      suggestedAction = 'view_services';
    }

    // Select model based on speedMode ('gemini-3.1-flash-lite' for fast, 'gemini-3.8-flash' for general)
    const selectedModel =
      speedMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    const baseInstruction =
      OPS_ROLE_INSTRUCTIONS[String(persona)] || OPS_ROLE_INSTRUCTIONS.concierge;
    const systemInstruction = currentRegion
      ? `${baseInstruction}\nThe client is currently viewing or inquiring from: ${currentRegion}.`
      : baseInstruction;

    // Build multi-turn contents array from prior conversation history + new user turn
    const safeHistory = Array.isArray(history) ? history.slice(-16) : [];
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const turn of safeHistory) {
      if (!turn || typeof turn.text !== 'string' || !turn.text.trim()) continue;
      const role: 'user' | 'model' = turn.role === 'model' ? 'model' : 'user';
      // Ensure alternating or valid role sequence starting with 'user'
      if (contents.length === 0 && role === 'model') continue;
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n${turn.text.trim()}`;
      } else {
        contents.push({
          role,
          parts: [{ text: turn.text.trim() }],
        });
      }
    }

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n${userText}`;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: userText }],
      });
    }

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.65,
        },
      });

      const replyText =
        response.text?.trim() ||
        'Thank you for reaching out to Ops at Aurel Cleaning Co. Would you like to request a tailored quote on our Book Now page?';

      return res.json({
        reply: replyText,
        suggestedAction,
        modelUsed: selectedModel,
        personaUsed: persona,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: unknown) {
      console.error('Gemini API error in /api/concierge:', err);
      const errMessage = err instanceof Error ? err.message : String(err);

      if (
        errMessage.includes('API_KEY_INVALID') ||
        errMessage.includes('PERMISSION_DENIED') ||
        errMessage.includes('403') ||
        errMessage.includes('400')
      ) {
        return res.status(502).json({
          error:
            'Unable to reach Ops AI right now. Please check that your GEMINI_API_KEY is configured in the Settings > Secrets panel.',
        });
      }

      if (errMessage.includes('RESOURCE_EXHAUSTED') || errMessage.includes('429')) {
        return res.status(429).json({
          error:
            'Ops AI rate limit reached. Upgrading to a billing-enabled API key in Settings > Secrets increases quota.',
        });
      }

      return res.status(500).json({
        error: 'Ops encountered a temporary connection issue. Please try sending your message again.',
      });
    }
  });

  // Newsletter signup endpoint
  app.post('/api/newsletter', (req, res) => {
    const { email } = req.body || {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    return res.json({
      success: true,
      message: 'Subscribed to Aurel Private Client Advisories.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aurel Cleaning Co. server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
