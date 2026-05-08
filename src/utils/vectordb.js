/**
 * VectorDB - Main Vector Database
 * Manages BruteForce, KDTree, and HNSW indexes in parallel
 */

import { HNSW } from './hnsw.js';

/**
 * VectorItem - Basic vector storage unit
 */
export class VectorItem {
  constructor(id, metadata, category, emb) {
    this.id = id;
    this.metadata = metadata;
    this.category = category;
    this.emb = emb; // Array of floats
  }
}

/**
 * BruteForce - O(n) linear search
 */
export class BruteForce {
  constructor() {
    this.items = [];
  }

  insert(v) {
    this.items.push(v);
  }

  knn(q, k, distFn) {
    const distances = this.items.map(v => ({
      dist: distFn(q, v.emb),
      id: v.id
    }));
    distances.sort((a, b) => a.dist - b.dist);
    return distances.slice(0, k).map(d => [d.dist, d.id]);
  }

  remove(id) {
    this.items = this.items.filter(v => v.id !== id);
  }
}

/**
 * KDNode - Node in KD-Tree
 */
class KDNode {
  constructor(item) {
    this.item = item;
    this.left = null;
    this.right = null;
  }
}

/**
 * KDTree - Binary space partitioning tree
 */
export class KDTree {
  constructor(dims) {
    this.root = null;
    this.dims = dims;
  }

  insert(v) {
    if (this.root === null) {
      this.root = new KDNode(v);
    } else {
      this._insert(this.root, v, 0);
    }
  }

  _insert(node, v, depth) {
    const axis = depth % this.dims;
    if (v.emb[axis] < node.item.emb[axis]) {
      if (node.left === null) {
        node.left = new KDNode(v);
      } else {
        this._insert(node.left, v, depth + 1);
      }
    } else {
      if (node.right === null) {
        node.right = new KDNode(v);
      } else {
        this._insert(node.right, v, depth + 1);
      }
    }
  }

  knn(q, k, distFn) {
    const heap = [];
    this._knn(this.root, q, k, 0, distFn, heap);
    heap.sort((a, b) => a[0] - b[0]);
    return heap;
  }

  _knn(node, q, k, depth, distFn, heap) {
    if (node === null) return;

    const dist = distFn(q, node.item.emb);
    if (heap.length < k || dist < heap[heap.length - 1][0]) {
      heap.push([dist, node.item.id]);
      heap.sort((a, b) => a[0] - b[0]);
      if (heap.length > k) heap.pop();
    }

    const axis = depth % this.dims;
    const diff = q[axis] - node.item.emb[axis];
    const closer = diff < 0 ? node.left : node.right;
    const farther = diff < 0 ? node.right : node.left;

    this._knn(closer, q, k, depth + 1, distFn, heap);
    if (heap.length < k || Math.abs(diff) < heap[heap.length - 1][0]) {
      this._knn(farther, q, k, depth + 1, distFn, heap);
    }
  }

  remove(id) {
    const items = [];
    this._collectAll(this.root, items);
    this.root = null;
    for (const item of items) {
      if (item.id !== id) {
        this.insert(item);
      }
    }
  }

  _collectAll(node, items) {
    if (node === null) return;
    items.push(node.item);
    this._collectAll(node.left, items);
    this._collectAll(node.right, items);
  }
}

/**
 * VectorDB - Unified vector database interface
 */
export class VectorDB {
  constructor(dims) {
    this.store = new Map();
    this.bf = new BruteForce();
    this.kdt = new KDTree(dims);
    this.hnsw = new HNSW(16, 200);
    this.nextId = 1;
    this.dims = dims;
  }

  insert(metadata, category, emb, distFn) {
    const v = new VectorItem(this.nextId++, metadata, category, emb);
    this.store.set(v.id, v);
    this.bf.insert(v);
    this.kdt.insert(v);
    this.hnsw.insert(v, distFn);
    return v.id;
  }

  remove(id) {
    if (!this.store.has(id)) return false;
    this.store.delete(id);
    this.bf.remove(id);
    this.kdt.remove(id);
    this.hnsw.remove(id);
    return true;
  }

  search(q, k, metric, algo, distFn) {
    const t0 = Date.now();
    let raw = [];

    if (algo === 'bruteforce') {
      raw = this.bf.knn(q, k, distFn);
    } else if (algo === 'kdtree') {
      raw = this.kdt.knn(q, k, distFn);
    } else {
      // hnsw
      raw = this.hnsw.knn(q, k, 50, distFn);
    }

    const us = (Date.now() - t0) * 1000; // Convert ms to microseconds

    const hits = [];
    for (const [dist, id] of raw) {
      if (this.store.has(id)) {
        const v = this.store.get(id);
        hits.push({
          id,
          metadata: v.metadata,
          category: v.category,
          distance: dist,
          embedding: v.emb
        });
      }
    }

    return {
      hits,
      latencyUs: Math.round(us),
      algo,
      metric
    };
  }

  benchmark(q, k, distFn) {
    const time = (fn) => {
      const t0 = Date.now();
      fn();
      return (Date.now() - t0) * 1000; // microseconds
    };

    const bfUs = time(() => this.bf.knn(q, k, distFn));
    const kdUs = time(() => this.kdt.knn(q, k, distFn));
    const hnswUs = time(() => this.hnsw.knn(q, k, 50, distFn));

    return {
      bruteforceUs: Math.round(bfUs),
      kdtreeUs: Math.round(kdUs),
      hnswUs: Math.round(hnswUs),
      itemCount: this.store.size
    };
  }

  all() {
    return Array.from(this.store.values());
  }

  hnswInfo() {
    return this.hnsw.getInfo();
  }

  size() {
    return this.store.size;
  }
}
