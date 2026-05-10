import { app } from './config/app.js';
import { PORT } from './config/constants.js';
import { ollamaService } from './services/ollamaService.js';
import { vectorService } from './services/vectorService.js';

async function startup() {
  vectorService.loadDemo();

  const ollamaAvailable = await ollamaService.isAvailable();

  console.log('=== Semantic Search Engine ===');
  console.log(`http://localhost:${PORT}`);
  console.log(`${vectorService.size()} demo vectors | 16 dims | HNSW+KD-Tree+BruteForce`);
  console.log(`Ollama: ${ollamaAvailable ? 'ONLINE' : 'OFFLINE (install from ollama.com)'}`);

  if (ollamaAvailable) {
    console.log(`  embed model: ${ollamaService.embedModel}`);
    console.log(`  gen model: ${ollamaService.genModel}`);
  }

  app.listen(PORT, () => {
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
  });
}

startup().catch((error) => {
  console.error('Startup error:', error);
  process.exit(1);
});
