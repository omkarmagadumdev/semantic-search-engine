/**
 * Ollama service - Integration with local Ollama LLM server
 * Handles embeddings via nomic-embed-text and generation via llama3.2
 */

import axios from 'axios';

export class OllamaClient {
  constructor(host = '127.0.0.1', port = 11434) {
    this.host = host;
    this.port = port;
    this.embedModel = 'nomic-embed-text';
    this.genModel = 'llama3.2';
    this.baseUrl = `http://${host}:${port}`;
  }

  /**
   * Check if Ollama server is available
   */
  async isAvailable() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 2000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Embed text using nomic-embed-text model (768D)
   * Returns empty array if unavailable
   */
  async embed(text) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
        model: this.embedModel,
        prompt: text
      }, {
        timeout: 30000 // 30 second timeout for embeddings
      });

      if (response.data && response.data.embedding) {
        return response.data.embedding;
      }
      return [];
    } catch (error) {
      console.error('Ollama embed error:', error.message);
      return [];
    }
  }

  /**
   * Generate text using llama3.2 model
   * Returns error string if unavailable
   */
  async generate(prompt) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.genModel,
        prompt: prompt,
        stream: false
      }, {
        timeout: 180000 // 180 second timeout for LLM generation
      });

      if (response.data && response.data.response) {
        return response.data.response;
      }
      return 'ERROR: No response from Ollama';
    } catch (error) {
      return `ERROR: Ollama unavailable. Install from https://ollama.com then run: ollama pull nomic-embed-text && ollama pull llama3.2`;
    }
  }
}

export const ollamaService = new OllamaClient();
