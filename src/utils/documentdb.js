/**
 * DocumentDB - Storage for RAG documents
 * Uses HNSW + BruteForce for hybrid indexing
 */

import { VectorItem, BruteForce } from './vectordb.js';
import { HNSW } from './hnsw.js';
import { cosine } from './distances.js';

export class DocItem {
  constructor(id, title, text, emb) {
    this.id = id;
    this.title = title;
    this.text = text;
    this.emb = emb;
  }
}

/**
 * DocumentDB - Document storage with semantic search
 */
export class DocumentDB {
  constructor() {
    this.store = new Map();
    this.hnsw = new HNSW(16, 200);
    this.bf = new BruteForce();
    this.nextId = 1;
    this.dims = 0; // Determined from first insertion
  }

  /**
   * Insert document chunk with pre-computed embedding
   */
  insert(title, text, emb) {
    if (this.dims === 0) {
      this.dims = emb.length;
    }

    const item = new DocItem(this.nextId++, title, text, emb);
    this.store.set(item.id, item);

    // Index in both HNSW and BruteForce
    const vi = new VectorItem(item.id, title, 'doc', emb);
    this.hnsw.insert(vi, cosine);
    this.bf.insert(vi);

    return item.id;
  }

  /**
   * Semantic search - returns top-k most similar chunks
   */
  search(q, k, maxDist = 0.7) {
    if (this.store.size === 0) return [];

    // Use BruteForce for small sets, HNSW for larger sets
    const raw = this.store.size < 10
      ? this.bf.knn(q, k, cosine)
      : this.hnsw.knn(q, k, 50, cosine);

    const results = [];
    for (const [dist, id] of raw) {
      if (this.store.has(id) && dist <= maxDist) {
        results.push([dist, this.store.get(id)]);
      }
    }

    return results;
  }

  remove(id) {
    if (!this.store.has(id)) return false;
    this.store.delete(id);
    this.hnsw.remove(id);
    this.bf.remove(id);
    return true;
  }

  all() {
    return Array.from(this.store.values());
  }

  size() {
    return this.store.size;
  }

  getDims() {
    return this.dims;
  }
}
