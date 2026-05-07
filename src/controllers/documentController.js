import { documentService } from '../services/documentService.js';
import { validateDocumentInsert, validateQuestion } from '../validators/documentValidators.js';
import { validateIdParam } from '../validators/vectorValidators.js';

export async function insertDocument(req, res) {
  const validation = validateDocumentInsert(req.body);

  if (validation.error) {
    return res.json({ error: validation.error });
  }

  return res.json(await documentService.insert(validation.value.title, validation.value.text));
}

export function deleteDocument(req, res) {
  const validation = validateIdParam(req.params);

  if (validation.error) {
    return res.json({ error: validation.error });
  }

  return res.json({ ok: documentService.remove(validation.value) });
}

export function listDocuments(req, res) {
  return res.json(documentService.list());
}

export async function searchDocuments(req, res) {
  const validation = validateQuestion(req.body);

  if (validation.error) {
    return res.json({ error: validation.error });
  }

  return res.json(await documentService.search(validation.value.question, validation.value.k));
}

export async function askDocumentQuestion(req, res) {
  const validation = validateQuestion(req.body);

  if (validation.error) {
    return res.json({ error: validation.error });
  }

  return res.json(await documentService.ask(validation.value.question, validation.value.k));
}
