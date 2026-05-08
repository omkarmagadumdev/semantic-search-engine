import { DocumentDB } from '../utils/documentdb.js';

class DocumentRepository {
  constructor() {
    this.db = new DocumentDB();
  }

  insert(title, text, embedding) {
    return this.db.insert(title, text, embedding);
  }

  remove(id) {
    return this.db.remove(id);
  }

  search(queryVector, k) {
    return this.db.search(queryVector, k);
  }

  all() {
    return this.db.all();
  }

  size() {
    return this.db.size();
  }

  getDims() {
    return this.db.getDims();
  }
}

export const documentRepository = new DocumentRepository();
