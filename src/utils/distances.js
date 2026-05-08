/**
 * Distance Metrics Module
 * Implements euclidean, cosine, and manhattan distance functions
 */

/**
 * Euclidean distance: sqrt(sum((a[i] - b[i])^2))
 */
export function euclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Cosine distance: 1 - (a·b) / (||a|| * ||b||)
 * Returns 1.0 if either vector is near-zero
 */
export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na < 1e-9 || nb < 1e-9) return 1.0;
  return 1.0 - dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Manhattan distance: sum(|a[i] - b[i]|)
 */
export function manhattan(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum;
}

/**
 * Get distance function by name
 * @param {string} metric - "cosine", "manhattan", or "euclidean" (default)
 * @returns {Function} Distance function
 */
export function getDistFn(metric) {
  if (metric === 'cosine') return cosine;
  if (metric === 'manhattan') return manhattan;
  return euclidean;
}
