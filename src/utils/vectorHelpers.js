export function parseVec(str) {
  return str
    .split(',')
    .map((value) => Number.parseFloat(value))
    .filter((value) => !Number.isNaN(value));
}

export function chunkText(text, chunkWords, overlapWords) {
  const words = text.split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 0) {
    return [];
  }

  if (words.length <= chunkWords) {
    return [text];
  }

  const chunks = [];
  const step = chunkWords - overlapWords;

  for (let index = 0; index < words.length; index += step) {
    const end = Math.min(index + chunkWords, words.length);
    chunks.push(words.slice(index, end).join(' '));

    if (end === words.length) {
      break;
    }
  }

  return chunks;
}
