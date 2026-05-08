import { DIMS } from '../config/constants.js';
import { VectorDB } from '../utils/vectordb.js';

class VectorRepository {
  constructor() {
    this.db = new VectorDB(DIMS);
  }

  insert(metadata, category, embedding, distFn) {
    return this.db.insert(metadata, category, embedding, distFn);
  }

  remove(id) {
    return this.db.remove(id);
  }

  search(queryVector, k, metric, algo, distFn) {
    return this.db.search(queryVector, k, metric, algo, distFn);
  }

  benchmark(queryVector, k, distFn) {
    return this.db.benchmark(queryVector, k, distFn);
  }

  all() {
    return this.db.all();
  }

  hnswInfo() {
    return this.db.hnswInfo();
  }

  size() {
    return this.db.size();
  }
}

export const vectorRepository = new VectorRepository();
