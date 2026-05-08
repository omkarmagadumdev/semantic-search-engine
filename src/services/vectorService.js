import { ALGORITHMS, DIMS, METRICS } from '../config/constants.js';
import { vectorRepository } from '../repository/vectorRepository.js';
import { demoVectors } from '../schema/demoVectors.js';
import { cosine, getDistFn } from '../utils/distances.js';

class VectorService {
  constructor(repository) {
    this.repository = repository;
    this.demoLoaded = false;
  }

  loadDemo() {
    if (this.demoLoaded) {
      return;
    }

    for (const vector of demoVectors) {
      this.repository.insert(vector.meta, vector.cat, vector.emb, cosine);
    }

    this.demoLoaded = true;
  }

  search(queryVector, k, metric, algo) {
    return this.repository.search(queryVector, k, metric, algo, getDistFn(metric));
  }

  insert(metadata, category, embedding) {
    return this.repository.insert(metadata, category, embedding, cosine);
  }

  remove(id) {
    return this.repository.remove(id);
  }

  items() {
    return this.repository.all().map((item) => ({
      id: item.id,
      metadata: item.metadata,
      category: item.category,
      embedding: item.emb
    }));
  }

  benchmark(queryVector, k, metric) {
    return this.repository.benchmark(queryVector, k, getDistFn(metric));
  }

  hnswInfo() {
    return this.repository.hnswInfo();
  }

  stats() {
    return {
      count: this.repository.size(),
      dims: DIMS,
      algorithms: ALGORITHMS,
      metrics: METRICS
    };
  }

  size() {
    return this.repository.size();
  }
}

export const vectorService = new VectorService(vectorRepository);
