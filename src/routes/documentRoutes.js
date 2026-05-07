import { Router } from 'express';

import {
  askDocumentQuestion,
  deleteDocument,
  insertDocument,
  listDocuments,
  searchDocuments
} from '../controllers/documentController.js';

const router = Router();

router.post('/doc/insert', insertDocument);
router.delete('/doc/delete/:id', deleteDocument);
router.get('/doc/list', listDocuments);
router.post('/doc/search', searchDocuments);
router.post('/doc/ask', askDocumentQuestion);

export default router;
