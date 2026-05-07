import { Router } from 'express';

import {
  benchmarkVectors,
  deleteVector,
  getHnswInfo,
  insertVector,
  listVectors,
  searchVectors
} from '../controllers/vectorController.js';

const router = Router();

router.get('/search', searchVectors);
router.post('/insert', insertVector);
router.delete('/delete/:id', deleteVector);
router.get('/items', listVectors);
router.get('/benchmark', benchmarkVectors);
router.get('/hnsw-info', getHnswInfo);

export default router;
