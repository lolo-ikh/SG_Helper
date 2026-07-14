const MAX_CHUNK_CHARS = 800;

export function semanticChunk(blocks) {
  const chunks = [];
  let chunkIndex = 0;

  for (const block of blocks) {
    const { heading, subheading, content } = block;
    const breadcrumb = subheading ? `${heading} > ${subheading}` : heading;

    if (content.length <= MAX_CHUNK_CHARS) {
      chunks.push({
        chunk_index: chunkIndex++,
        content: `${breadcrumb}\n\n${content}`,
        page_number: 1,
        section: subheading || heading,
      });
      continue;
    }

    // Split long content by sentences, keeping them complete
    const sentences = content.split(/(?<=[.!?])\s+/);
    let current = '';

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).length > MAX_CHUNK_CHARS && current) {
        chunks.push({
          chunk_index: chunkIndex++,
          content: `${breadcrumb}\n\n${current.trim()}`,
          page_number: 1,
          section: subheading || heading,
        });
        current = sentence;
      } else {
        current = current ? current + ' ' + sentence : sentence;
      }
    }

    if (current.trim()) {
      chunks.push({
        chunk_index: chunkIndex++,
        content: `${breadcrumb}\n\n${current.trim()}`,
        page_number: 1,
        section: subheading || heading,
      });
    }
  }

  return chunks;
}
