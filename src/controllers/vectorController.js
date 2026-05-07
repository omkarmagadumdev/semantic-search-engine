import { vectorService } from '../services/vectorService.js';
import { validateIdParam, validateSearchQuery, validateVectorInsert } from '../validators/vectorValidators.js';

export function searchVectors(req, res) {
  const validation = validateSearchQuery(req.query);

  if (validation.error) {
    return res.json({ error: validation.error });
  }

  const { queryVector, k, metric, algo } = validation.value;
  const searchResult = vectorService.search(queryVector, k, metric, algo);

  return res.json({
    results: searchResult.hits,
    latencyUs: searchResult.latencyUs,
    algo: searchResult.algo,
    metric: searchResult.metric
  });
}

export function insertVector(req, res) {
  const validation = validateVectorInsert(req.body);

  if (validation.error) {
    return res.json({ error: validation.error });
  }

  const { metadata, category, embedding } = validation.value;
  return res.json({ id: vectorService.insert(metadata, category, embedding) });
}

export function deleteVector(req, res) {
  const validation = validateIdParam(req.params);

  if (validation.error) {
    return res.json({ error: validation.error });
  }

  return res.json({ ok: vectorService.remove(validation.value) });
}

export function listVectors(req, res) {
  return res.json(vectorService.items());
}

export function benchmarkVectors(req, res) {
  const validation = validateSearchQuery(req.query);

  if (validation.error) {
    return res.json({ error: validation.error });
  }

  const { queryVector, k, metric } = validation.value;
  return res.json(vectorService.benchmark(queryVector, k, metric));
}

export function getHnswInfo(req, res) {
  return res.json(vectorService.hnswInfo());
}
