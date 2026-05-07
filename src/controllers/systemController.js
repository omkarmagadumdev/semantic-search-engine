import path from 'path';

import { DIMS } from '../config/constants.js';
import { VIEWS_DIR } from '../config/paths.js';
import { documentService } from '../services/documentService.js';
import { ollamaService } from '../services/ollamaService.js';
import { vectorService } from '../services/vectorService.js';

export async function getStatus(req, res) {
  const ollamaAvailable = await ollamaService.isAvailable();

  return res.json({
    ollamaAvailable,
    embedModel: ollamaService.embedModel,
    genModel: ollamaService.genModel,
    docCount: documentService.size(),
    docDims: documentService.getDims(),
    demoDims: DIMS,
    demoCount: vectorService.size()
  });
}

export function getStats(req, res) {
  return res.json(vectorService.stats());
}

export function getHome(req, res) {
  return res.sendFile(path.join(VIEWS_DIR, 'index.html'), (error) => {
    if (error) {
      res.status(404).send('index.html not found');
    }
  });
}
