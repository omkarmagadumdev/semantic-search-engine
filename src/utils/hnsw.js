/**
 * HNSW - Hierarchical Navigable Small World
 * Production-grade approximate nearest neighbor search algorithm
 * Used by Pinecone, Weaviate, Chroma, Milvus
 */

/**
 * HNSW Node
 */
class HNSWNode {
  constructor(item, maxLyr) {
    this.item = item;
    this.maxLyr = maxLyr;
    this.nbrs = Array(maxLyr + 1)
      .fill(null)
      .map(() => []);
  }
}

/**
 * HNSW - Hierarchical Navigable Small World
 */
export class HNSW {
  constructor(m = 16, efBuild = 200) {
    this.M = m;
    this.M0 = 2 * m;
    this.efBuild = efBuild;
    this.mL = 1.0 / Math.log(m);
    this.G = new Map(); // id -> HNSWNode
    this.topLayer = -1;
    this.entryPt = -1;
  }

  randLevel() {
    return Math.floor(-Math.log(Math.random()) * this.mL);
  }

  insert(item, distFn) {
    const id = item.id;
    const lvl = this.randLevel();
    this.G.set(id, new HNSWNode(item, lvl));

    if (this.entryPt === -1) {
      this.entryPt = id;
      this.topLayer = lvl;
      return;
    }

    // Search for nearest at layer above insertion level
    let ep = this.entryPt;
    for (let lc = this.topLayer; lc > lvl; lc--) {
      if (lc < this.G.get(ep).nbrs.length) {
        const W = this.searchLayer(item.emb, ep, 1, lc, distFn);
        if (W.length > 0) ep = W[0][1];
      }
    }

    // Insert at layers 0 to lvl
    for (let lc = Math.min(this.topLayer, lvl); lc >= 0; lc--) {
      const W = this.searchLayer(item.emb, ep, this.efBuild, lc, distFn);
      const maxM = lc === 0 ? this.M0 : this.M;
      const sel = this.selectNbrs(W, maxM);

      this.G.get(id).nbrs[lc] = sel;

      // Update neighbors
      for (const nid of sel) {
        if (!this.G.has(nid)) continue;
        const conn = this.G.get(nid).nbrs[lc];
        conn.push(id);

        if (conn.length > maxM) {
          const ds = [];
          for (const c of conn) {
            if (this.G.has(c)) {
              ds.push([distFn(this.G.get(nid).item.emb, this.G.get(c).item.emb), c]);
            }
          }
          ds.sort((a, b) => a[0] - b[0]);
          this.G.get(nid).nbrs[lc] = ds.slice(0, maxM).map(d => d[1]);
        }
      }

      if (W.length > 0) ep = W[0][1];
    }

    // Update entry point if necessary
    if (lvl > this.topLayer) {
      this.topLayer = lvl;
      this.entryPt = id;
    }
  }

  searchLayer(q, ep, ef, lyr, distFn) {
    const vis = new Set();
    const cands = [[distFn(q, this.G.get(ep).item.emb), ep]];
    const found = [[distFn(q, this.G.get(ep).item.emb), ep]];
    vis.add(ep);

    while (cands.length > 0) {
      cands.sort((a, b) => a[0] - b[0]);
      const [cd, cid] = cands.shift();

      if (cd > found[found.length - 1][0] && found.length >= ef) break;

      const node = this.G.get(cid);
      if (lyr >= node.nbrs.length) continue;

      for (const nid of node.nbrs[lyr]) {
        if (vis.has(nid)) continue;
        vis.add(nid);

        const nd = distFn(q, this.G.get(nid).item.emb);
        if (found.length < ef || nd < found[found.length - 1][0]) {
          cands.push([nd, nid]);
          found.push([nd, nid]);
          found.sort((a, b) => a[0] - b[0]);
          if (found.length > ef) found.pop();
        }
      }
    }

    return found;
  }

  selectNbrs(cands, maxM) {
    const res = [];
    for (let i = 0; i < Math.min(cands.length, maxM); i++) {
      res.push(cands[i][1]);
    }
    return res;
  }

  knn(q, k, ef, distFn) {
    if (this.entryPt === -1) return [];

    let ep = this.entryPt;

    // Search at layers above 0
    for (let lc = this.topLayer; lc > 0; lc--) {
      if (lc < this.G.get(ep).nbrs.length) {
        const W = this.searchLayer(q, ep, 1, lc, distFn);
        if (W.length > 0) ep = W[0][1];
      }
    }

    // Search at layer 0
    const W = this.searchLayer(q, ep, Math.max(ef, k), 0, distFn);
    W.sort((a, b) => a[0] - b[0]);
    return W.slice(0, k);
  }

  remove(id) {
    if (!this.G.has(id)) return;

    // Remove from all neighbor lists
    for (const [nid, node] of this.G) {
      for (let lyr = 0; lyr < node.nbrs.length; lyr++) {
        node.nbrs[lyr] = node.nbrs[lyr].filter(n => n !== id);
      }
    }

    // Update entry point if needed
    if (this.entryPt === id) {
      this.entryPt = -1;
      for (const [nid] of this.G) {
        if (nid !== id) {
          this.entryPt = nid;
          break;
        }
      }
    }

    this.G.delete(id);
  }

  getInfo() {
    const maxL = Math.max(this.topLayer + 1, 1);
    const nodesPerLayer = Array(maxL).fill(0);
    const edgesPerLayer = Array(maxL).fill(0);
    const nodes = [];
    const edges = [];

    for (const [id, node] of this.G) {
      nodes.push({ id, metadata: node.item.metadata, category: node.item.category, maxLyr: node.maxLyr });

      for (let lc = 0; lc <= node.maxLyr && lc < maxL; lc++) {
        nodesPerLayer[lc]++;
        for (const nid of node.nbrs[lc]) {
          if (id < nid) {
            edgesPerLayer[lc]++;
            edges.push({ src: id, dst: nid, lyr: lc });
          }
        }
      }
    }

    return {
      topLayer: this.topLayer,
      nodeCount: this.G.size,
      nodesPerLayer,
      edgesPerLayer,
      nodes,
      edges
    };
  }

  size() {
    return this.G.size;
  }
}
