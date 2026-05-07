import { DIMS } from '../config/constants.js';
import { parseVec } from '../utils/vectorHelpers.js';

export function validateSearchQuery(query) {
  const vector = parseVec(query.v || '');

  if (vector.length !== DIMS) {
    return { error: `need ${DIMS}D vector` };
  }

  return {
    value: {
      queryVector: vector,
      k: Number.parseInt(query.k, 10) || 5,
      metric: query.metric || 'cosine',
      algo: query.algo || 'hnsw'
    }
  };
}

export function validateVectorInsert(body) {
  const { metadata, category, embedding } = body;

  if (!metadata || !category || !Array.isArray(embedding) || embedding.length !== DIMS) {
    return { error: 'invalid body' };
  }

  return {
    value: { metadata, category, embedding }
  };
}

export function validateIdParam(params) {
  const id = Number.parseInt(params.id, 10);

  if (Number.isNaN(id)) {
    return { error: 'invalid id' };
  }

  return { value: id };
}
