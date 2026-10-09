import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

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

  // Live Concierge Chat Desk endpoint
  app.post('/api/concierge', (req, res) => {
    const { message, currentRegion } = req.body || {};
    const text = String(message || '').toLowerCase();

    let reply =
      'Thank you for reaching out to the Aurel California Concierge Desk. Every cleaning plan is tailored to the architecture, surfaces, and schedule of your property. Would you like to book a walk-through or request a personalized quote on our Book Now page?';
    let suggestedAction: 'open_book_page' | 'view_map' | 'view_services' | null = 'open_book_page';

    if (text.includes('price') || text.includes('cost') || text.includes('rate') || text.includes('quote')) {
      reply =
        'Because luxury residences and commercial properties vary in architectural finishes, square footage, and frequency, we do not use arbitrary flat pricing. We offer three tailored care tiers—Essential Care, Signature Clean, and Bespoke Property Care—and provide a custom quote via our Book Now page.';
      suggestedAction = 'open_book_page';
    } else if (
      text.includes('california') ||
      text.includes('area') ||
      text.includes('location') ||
      text.includes('beverly') ||
      text.includes('san francisco') ||
      text.includes('malibu') ||
      text.includes('palo alto') ||
      text.includes('newport') ||
      text.includes('la jolla') ||
      text.includes('santa barbara')
    ) {
      reply = `Aurel Cleaning Co. serves premier residential and commercial properties across California${
        currentRegion ? `, including ${currentRegion}` : ''
      }—spanning Beverly Hills & the Westside, Malibu, Santa Barbara & Montecito, Newport Coast, La Jolla, San Francisco, Silicon Valley, and Napa Valley. You can verify your exact California address on our interactive map or Book Now page.`;
      suggestedAction = 'view_map';
    } else if (text.includes('marble') || text.includes('stone') || text.includes('supply') || text.includes('product')) {
      reply =
        'We take particular care with sensitive architectural surfaces including honed Calacatta marble, travertine, unlacquered brass, and wide-plank hardwood. During your consultation or in Step 3 of our Book Now form, you can specify any surface treatments or preferred household products.';
      suggestedAction = 'open_book_page';
    } else if (text.includes('commercial') || text.includes('office') || text.includes('gallery') || text.includes('hotel')) {
      reply =
        'Our Commercial Cleaning division supports executive offices, architectural studios, private showrooms, and boutique hospitality spaces across California with discreet scheduling outside or alongside your operating hours.';
      suggestedAction = 'view_services';
    } else if (text.includes('move') || text.includes('construction') || text.includes('renovation')) {
      reply =
        'We offer specialized Move-In / Move-Out Cleaning and Post-Construction Detailing designed for luxury property handovers, fine dust removal, and pre-occupancy preparation.';
      suggestedAction = 'open_book_page';
    }

    res.json({
      reply,
      suggestedAction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
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
