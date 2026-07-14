const HEADING_RE = /^(?:(?:I{1,3}|IV|V|VI{0,3}|IX|X)\.|[1-9]\d*\.|[A-Z]\.)\s+\S/;
const SUBHEADING_RE = /^\d+\.\d+\s+\S/;
const BULLET_RE = /^[●○]\s/;
const LABEL_RE = /^(?:Action|Venue|Date|Budget|Finance|Logistics|Schedule|Target|Deadline|Team|Game Title|Speaker|Format|Capacity|Timeline|Announcement|Registration|Contingency|Postponement|Event Order|Core Goal|Core Strategy|Milestone)\s*[:–-]/i;
const ATTENDEES_RE = /^(?:Attendees?|Participants?)\s*:/i;
const PAGE_HEADER_RE = /^EBEC\s+(?:Meeting|Online)\s+Report/i;
const FOOTER_RE = /^Page\s+\d+\s+of\s+\d+/i;
const PREPARED_RE = /^Prepared\s+(?:By|by)\s*:/i;

export function parseDocumentStructure(fullText) {
  const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
  const sections = [];
  let title = '';
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip page headers/footers
    if (PAGE_HEADER_RE.test(line) || FOOTER_RE.test(line)) continue;

    // Title: first meaningful line or line matching report pattern
    if (!title && (line.startsWith('EBEC') || line.startsWith('IGNITE') || line.startsWith('EBEConline'))) {
      title = line.replace(/\s+/g, ' ').trim();
      continue;
    }

    // Attendees block
    if (ATTENDEES_RE.test(line)) {
      sections.push({ type: 'attendees', content: line.replace(/\s+/g, ' ').trim() });
      continue;
    }

    // Prepared by line (part of header, skip or attach to section)
    if (PREPARED_RE.test(line)) continue;

    // Section heading
    if (HEADING_RE.test(line) && line.length < 120) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'heading', content: line.replace(/\s+/g, ' ').trim(), children: [] };
      continue;
    }

    // Sub-heading
    if (SUBHEADING_RE.test(line) && line.length < 120) {
      if (currentSection) {
        currentSection.children.push({ type: 'subheading', content: line.replace(/\s+/g, ' ').trim() });
      }
      continue;
    }

    // Bullet point
    if (BULLET_RE.test(line)) {
      if (currentSection) {
        currentSection.children.push({ type: 'bullet', content: line.replace(/\s+/g, ' ').trim() });
      }
      continue;
    }

    // Label line (Venue:, Budget:, etc.)
    if (LABEL_RE.test(line)) {
      if (currentSection) {
        currentSection.children.push({ type: 'label', content: line.replace(/\s+/g, ' ').trim() });
      }
      continue;
    }

    // Regular content line — append to current section
    if (currentSection) {
      const lastChild = currentSection.children[currentSection.children.length - 1];
      if (lastChild && lastChild.type === 'content') {
        lastChild.content += ' ' + line.replace(/\s+/g, ' ').trim();
      } else {
        currentSection.children.push({ type: 'content', content: line.replace(/\s+/g, ' ').trim() });
      }
    }
  }

  if (currentSection) sections.push(currentSection);

  return { title, sections };
}

export function sectionsToBlocks(parsed) {
  const { title, sections } = parsed;
  const blocks = [];

  for (const section of sections) {
    if (section.type === 'attendees') {
      blocks.push({
        heading: title,
        subheading: 'Attendees',
        content: section.content,
      });
      continue;
    }

    const sectionHeading = section.content;

    if (!section.children || section.children.length === 0) {
      blocks.push({ heading: title, subheading: sectionHeading, content: sectionHeading });
      continue;
    }

    // Group consecutive bullets into one block
    let bulletBuffer = [];
    const flushBullets = () => {
      if (bulletBuffer.length > 0) {
        blocks.push({
          heading: title,
          subheading: sectionHeading,
          content: bulletBuffer.join(' '),
        });
        bulletBuffer = [];
      }
    };

    for (const child of section.children) {
      if (child.type === 'bullet' || child.type === 'label' || child.type === 'content') {
        bulletBuffer.push(child.content);
      } else if (child.type === 'subheading') {
        flushBullets();
        blocks.push({
          heading: title,
          subheading: `${sectionHeading} > ${child.content}`,
          content: child.content,
        });
      }
    }
    flushBullets();
  }

  return blocks;
}
