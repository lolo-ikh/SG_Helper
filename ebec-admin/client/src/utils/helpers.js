export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatBullets = (text) => {
  if (!text) return "";
  return text.split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (/^[\u2022\u25CF\u25CB\u25AA\u25AB\u25B6\u25C6\u25E6*-\d+]/.test(trimmed)) return trimmed;
      return `• ${trimmed}`;
    })
    .filter(line => line)
    .join('\n');
};

export const formatNumbered = (text) => {
  if (!text) return "";
  let count = 1;
  return text.split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (/^\d+[\.\-]/.test(trimmed)) return trimmed;
      return `${count++}. ${trimmed}`;
    })
    .filter(line => line)
    .join('\n');
};

export const htmlToLatex = (html) => {
  if (!html) return "No notes recorded.";
  let tex = html
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '\\textbf{$1}')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '\\textit{$1}')
    .replace(/<u[^>]*>(.*?)<\/u>/gi, '\\underline{$1}')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\\item $1\n')
    .replace(/<ul[^>]*>/gi, '\\begin{itemize}\n')
    .replace(/<\/ul>/gi, '\\end{itemize}\n')
    .replace(/<p[^>]*>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br[^>]*>/gi, '\\\\ ')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '');
  tex = tex.replace(/([&%$#_{ }])/g, '\\$1');
  return tex;
};

export const generateLatexReport = (meeting, attendeeRows, notesTex) => {
  return `
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{xcolor}
\\usepackage{titlesec}

\\definecolor{ebecblue}{HTML}{0071E3}
\\definecolor{ebecgold}{HTML}{EBEC00}
\\titleformat{\\section}{\\large\\bfseries\\color{ebecblue}}{ }{0em}{ }[\\titlerule]

\\pagestyle{fancy}
\\fancyhf{ }
\\lhead{\\textbf{EBEC SECRETARIAT}}
\\rhead{Report: ${meeting.title}}
\\lfoot{EBEC Helper Admin}
\\rfoot{Page \\thepage}

\\begin{document}

\\begin{center}
\\Huge \\textbf{\\color{ebecblue} EBEC} \\\\
\\large \\textit{Board of European Students of Technology} \\\\
\\vspace{0.5cm}
\\Large \\textbf{Official Meeting Report} \\\\
\\vspace{0.2cm}
\\large ${meeting.title}
\\end{center}

\\vspace{1cm}

\\section*{Meeting Information}
\\begin{tabular}{ll}
\\textbf{Date:} & ${meeting.date} \\\\
\\textbf{Time:} & ${meeting.time} AM \\\\
\\textbf{Project:} & EBEC Administrative Year ${meeting.season || '2026'} \\\\
\\textbf{Ref:} & EBEC-ADM-${meeting.season || '2026'}-${String(meeting.id).slice(-4)}
\\end{tabular}

\\vspace{0.5cm}

\\section*{Attendance Register}
\\begin{tabularx}{\\textwidth}{| X | l | c |}
\\hline
\\rowcolor{ebecblue!10} \\textbf{Name} & \\textbf{Role} & \\textbf{Status} \\\\ \\hline
${attendeeRows}
\\end{tabularx}
\\textit{\\small (P: Present, L: Late, A: Absent)}

\\vspace{0.5cm}

\\section*{Discussions and Deliberations}
${notesTex}

\\vspace{1cm}

\\vfill
\\begin{flushright}
\\textbf{Authorized by:} \\\\
Vice President \\\\
EBEC Secretariat ${meeting.season || '2026'}
\\end{flushright}

\\end{document}
`.trim();
};

export const exportToCSV = (headers, rows, filename) => {
  const csvContent = "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
