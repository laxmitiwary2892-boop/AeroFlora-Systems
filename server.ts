import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'aeroflora-systems-mk4' });
});

// Server-side Kisan Jal Saathi AI Assistant endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { message, language = 'en', farmContext } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Please provide a question for Kisan Jal Saathi.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'GEMINI_API_KEY_UNCONFIGURED',
        message: 'Gemini API key is not configured on the server.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contextLines = farmContext
      ? [
          `Active Farm Context:`,
          `- Location: ${farmContext.district || 'Banaskantha'}, ${farmContext.state || 'Gujarat'}`,
          `- Primary Crop: ${farmContext.crop || 'Pomegranate'} (${farmContext.acres || 2.5} acres)`,
          `- Daily AWH Array Harvest: ${farmContext.dailyHarvestLiters || 1400} L/day (${farmContext.towerCount || 3} towers)`,
          `- Existing Monthly Tanker/Water Spend: ₹${farmContext.monthlyWaterSpend || 12000}/month`,
        ].join('\n')
      : 'No active farm context provided.';

    const langDirective =
      language === 'hi'
        ? 'Respond clearly in simple, practical Hindi (Devanagari script) using familiar agricultural terms, Indian Rupees (₹), Litres (L), and Acres.'
        : 'Respond clearly in concise, practical Indian English using familiar agricultural terms, Indian Rupees (₹), Litres (L), and Acres.';

    const systemInstruction = `You are "Kisan Jal Saathi", the expert Indian AgriTech & Atmospheric Water Harvesting (AWH) agronomic advisor inside AeroFlora Systems (Mk-IV OS).
You help Indian farmers, FPOs, and agronomists with:
1. AeroFlora Mk-IV solar MOF-801 atmospheric water harvesting (passive nocturnal sorption + solar desorption, 0 kWh grid electricity, >=450 L/day target per tower even at 15-25% RH).
2. FAO-56 precision irrigation scheduling for Indian crops (Pomegranate Bhagwa, Cotton, Wheat, Grapes, Citrus, Groundnut, Vegetables, etc.).
3. Water quality & mineralization (SAR, RSC, EC, TDS, volcanic basalt + calcite passive bed preventing root osmotic shock and drip emitter scaling).
4. Indian agricultural subsidies (PM-KUSUM Component B 30%-50% subsidy, MIDH, NABARD/KCC loans) and water tanker replacement economics.

${langDirective}
Keep answers grounded, actionable, structured with short bullet points, and directly tailored to the user's farm context below.

${contextLines}`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: message.trim().slice(0, 2000),
      config: {
        systemInstruction,
      },
    });

    const reply = response.text?.trim();
    if (!reply) {
      res.status(502).json({ error: 'Empty response received from Gemini model.' });
      return;
    }

    res.json({ reply, model: 'gemini-4-hydrogen' });
  } catch (err) {
    console.error('Assistant API Error:', err);
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'ASSISTANT_ERROR', message: errMsg });
  }
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AeroFlora Systems server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
