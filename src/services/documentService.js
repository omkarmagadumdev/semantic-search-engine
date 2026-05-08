import { DOC_CHUNK_OVERLAP, DOC_CHUNK_WORDS } from '../config/constants.js';
import { documentRepository } from '../repository/documentRepository.js';
import { chunkText } from '../utils/vectorHelpers.js';
import { ollamaService } from './ollamaService.js';

const OLLAMA_UNAVAILABLE =
  'Ollama unavailable. Install from https://ollama.com then run: ollama pull nomic-embed-text && ollama pull llama3.2';

class DocumentService {
  constructor(repository) {
    this.repository = repository;
  }

  async insert(title, text) {
    const chunks = chunkText(text, DOC_CHUNK_WORDS, DOC_CHUNK_OVERLAP);
    const ids = [];

    for (let index = 0; index < chunks.length; index += 1) {
      const embedding = await ollamaService.embed(chunks[index]);

      if (!embedding || embedding.length === 0) {
        return { error: OLLAMA_UNAVAILABLE };
      }

      const chunkTitle = chunks.length > 1
        ? `${title} [${index + 1}/${chunks.length}]`
        : title;

      ids.push(this.repository.insert(chunkTitle, chunks[index], embedding));
    }

    return {
      ids,
      chunks: chunks.length,
      dims: this.repository.getDims()
    };
  }

  remove(id) {
    return this.repository.remove(id);
  }

  list() {
    return this.repository.all().map((doc) => ({
      id: doc.id,
      title: doc.title,
      preview: doc.text.length > 120 ? `${doc.text.substring(0, 120)}…` : doc.text,
      words: doc.text.split(/\s+/).length
    }));
  }

  async search(question, k = 3) {
    const queryEmbedding = await ollamaService.embed(question);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      return { error: 'Ollama unavailable' };
    }

    const hits = this.repository.search(queryEmbedding, k);

    return {
      contexts: hits.map(([distance, doc]) => ({
        id: doc.id,
        title: doc.title,
        distance
      }))
    };
  }

  async ask(question, k = 3) {
    const queryEmbedding = await ollamaService.embed(question);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      return { error: 'Ollama unavailable' };
    }

    const hits = this.repository.search(queryEmbedding, k);
    const context = hits
      .map(([_, doc], index) => `[${index + 1}] ${doc.title}:\n${doc.text}`)
      .join('\n\n');

    const prompt = `You are a helpful assistant. Answer the user's question directly. Use the provided context if it contains relevant information. If it doesn't, just use your own general knowledge. IMPORTANT: Do NOT mention the 'context', 'provided text', or say things like 'the context doesn't mention'. Just answer the question naturally.

Context:
${context}
Question: ${question}

Answer:`;

    const answer = await ollamaService.generate(prompt);

    return {
      answer,
      model: ollamaService.genModel,
      contexts: hits.map(([distance, doc]) => ({
        id: doc.id,
        title: doc.title,
        text: doc.text,
        distance
      })),
      docCount: this.repository.size()
    };
  }

  size() {
    return this.repository.size();
  }

  getDims() {
    return this.repository.getDims();
  }
}

export const documentService = new DocumentService(documentRepository);
