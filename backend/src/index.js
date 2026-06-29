import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import securityRoutes from './routes/security.js';
import llm from './services/llm.js';
import { requestGuard } from './middleware/requestGuard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(requestGuard);


// ✅ HEALTH ROUTE
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ ✅ NEW STATUS ROUTE (THIS FIXES YOUR ISSUE)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    message: 'AI Security Gateway running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api', securityRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error'
  });
});

// Optional OpenAI setup
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
  if (process.env.ENABLE_OPENAI === 'true') {
    llm.initialize(process.env.OPENAI_API_KEY);
    console.log('OpenAI API configured and enabled');
  }
}

// Start server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║        AI SECURITY GATEWAY - PROMPT INJECTION DEFENSE         ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                 ║
║  Status: OPERATIONAL                                         ║
║  Mode: ${process.env.ENABLE_OPENAI === 'true' ? 'OpenAI API' : 'Simulated LLM'} 
╠═══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                  ║
║  POST /api/analyze        - Full security analysis           ║
║  POST /api/transform      - Sanitization only                ║
║  POST /api/chat           - Process safe input               ║
║  POST /api/hallucination  - Hallucination check              ║
║  GET  /api/history        - Last 10 interactions             ║
║  GET  /api/status         - System status                    ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}

export default app;