export function validateDocumentInsert(body) {
  const { title, text } = body;

  if (!title || !text) {
    return { error: 'need title and text' };
  }

  return { value: { title, text } };
}

export function validateQuestion(body) {
  const { question, k } = body;

  if (!question) {
    return { error: 'need question' };
  }

  return {
    value: {
      question,
      k: Number.parseInt(k, 10) || 3
    }
  };
}
