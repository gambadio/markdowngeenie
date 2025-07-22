import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItTOC from 'markdown-it-table-of-contents';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  UnderlineType,
  ShadingType,
  convertInchesToTwip,
  LevelFormat,
  convertMillimetersToTwip
} from 'docx';
import type { Theme } from '$lib/types';

interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'table' | 'blockquote' | 'hr';
  level?: number;
  content: string;
  children?: ParsedElement[];
  items?: string[];
  headers?: string[];
  rows?: string[][];
  language?: string;
}

/**
 * Convert Markdown content to a downloadable Word document
 */
export async function convertMarkdownToDocx(
  markdown: string,
  theme: Theme,
  includeTOC: boolean = false
): Promise<void> {
  try {
    // Initialize markdown-it with plugins
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: false
    })
      .use(markdownItAttrs)
      .use(markdownItAnchor, {
        permalink: false,
        level: [1, 2, 3, 4, 5, 6]
      });

    // Add TOC plugin if enabled
    if (includeTOC) {
      md.use(markdownItTOC, {
        includeLevel: [1, 2, 3, 4, 5, 6],
        containerClass: 'toc',
        markerPattern: /^\[\[toc\]\]/im
      });

      // Insert TOC marker after first h1 if not present
      if (!markdown.includes('[[toc]]')) {
        const h1Index = markdown.search(/^#\s/m);
        if (h1Index !== -1) {
          const lines = markdown.split('\n');
          let insertIndex = 0;
          
          // Find the line after the first h1
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^#\s/)) {
              insertIndex = i + 1;
              break;
            }
          }
          
          lines.splice(insertIndex, 0, '', '[[toc]]', '');
          markdown = lines.join('\n');
        } else {
          // No h1 found, add at the beginning
          markdown = '[[toc]]\n\n' + markdown;
        }
      }
    }

    // Convert markdown to HTML
    const html = md.render(markdown);

    // Convert HTML to DOCX blob
    const blob = await convertToDocx(html, theme, includeTOC);

    // Download the file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-document.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Conversion error:', error);
    throw new Error('Failed to convert markdown to Word document');
  }
}

export async function convertToDocx(html: string, theme: Theme, includeTOC: boolean = false): Promise<Blob> {
  try {
    // Parse HTML and convert to structured elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const elements = parseElements(doc.body);
    const docxElements = await convertElementsToDocx(elements, theme, includeTOC);
    
    // Create DOCX document with professional styling
    const docxDoc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: theme === 'elegant' ? 32 : 28,
              bold: true,
              color: theme === 'elegant' ? "7C3AED" : "1E40AF",
              font: theme === 'elegant' ? "Georgia" : "Calibri"
            },
            paragraph: {
              spacing: {
                before: convertMillimetersToTwip(12),
                after: convertMillimetersToTwip(6)
              },
              border: {
                bottom: {
                  color: theme === 'elegant' ? "D8B4FE" : "93C5FD",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6
                }
              }
            }
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: theme === 'elegant' ? 26 : 24,
              bold: true,
              color: theme === 'elegant' ? "8B5CF6" : "2563EB",
              font: theme === 'elegant' ? "Georgia" : "Calibri"
            },
            paragraph: {
              spacing: {
                before: convertMillimetersToTwip(10),
                after: convertMillimetersToTwip(4)
              }
            }
          },
          {
            id: "Heading3",
            name: "Heading 3",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: theme === 'elegant' ? 22 : 20,
              bold: true,
              color: theme === 'elegant' ? "A855F7" : "3B82F6",
              font: theme === 'elegant' ? "Georgia" : "Calibri"
            },
            paragraph: {
              spacing: {
                before: convertMillimetersToTwip(8),
                after: convertMillimetersToTwip(3)
              }
            }
          },
          {
            id: "CodeBlock",
            name: "Code Block",
            basedOn: "Normal",
            run: {
              font: "Consolas",
              size: 18,
              color: "2D3748"
            },
            paragraph: {
              spacing: {
                before: convertMillimetersToTwip(4),
                after: convertMillimetersToTwip(4)
              },
              shading: {
                type: ShadingType.SOLID,
                color: "F8FAFC"
              },
              border: {
                top: { color: "E2E8F0", space: 1, style: BorderStyle.SINGLE, size: 2 },
                bottom: { color: "E2E8F0", space: 1, style: BorderStyle.SINGLE, size: 2 },
                left: { color: "E2E8F0", space: 1, style: BorderStyle.SINGLE, size: 2 },
                right: { color: "E2E8F0", space: 1, style: BorderStyle.SINGLE, size: 2 }
              },
              indent: {
                left: convertMillimetersToTwip(8),
                right: convertMillimetersToTwip(8)
              }
            }
          },
          {
            id: "Quote",
            name: "Quote",
            basedOn: "Normal",
            run: {
              italics: true,
              color: "4A5568",
              size: 22
            },
            paragraph: {
              spacing: {
                before: convertMillimetersToTwip(6),
                after: convertMillimetersToTwip(6)
              },
              shading: {
                type: ShadingType.SOLID,
                color: theme === 'elegant' ? "FAF5FF" : "EFF6FF"
              },
              border: {
                left: {
                  color: theme === 'elegant' ? "8B5CF6" : "3B82F6",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 12
                }
              },
              indent: {
                left: convertMillimetersToTwip(15),
                right: convertMillimetersToTwip(5)
              }
            }
          }
        ]
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1)
              }
            }
          },
          children: docxElements
        }
      ]
    });
    
    // Generate blob
    return await Packer.toBlob(docxDoc);
  } catch (error) {
    console.error('Error converting to DOCX:', error);
    throw new Error('Failed to convert to DOCX format');
  }
}

function parseElements(container: Element): ParsedElement[] {
  const elements: ParsedElement[] = [];
  
  for (const child of container.children) {
    const element = parseElement(child);
    if (element) {
      elements.push(element);
    }
  }
  
  return elements;
}

function parseElement(element: Element): ParsedElement | null {
  const tagName = element.tagName.toLowerCase();
  
  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: 'heading',
        level: parseInt(tagName.charAt(1)),
        content: element.textContent || ''
      };
      
    case 'p':
      return {
        type: 'paragraph',
        content: element.textContent || ''
      };
      
    case 'ul':
    case 'ol':
      const items: string[] = [];
      for (const li of element.querySelectorAll('li')) {
        items.push(li.textContent || '');
      }
      return {
        type: 'list',
        content: tagName,
        items
      };
      
    case 'pre':
      const code = element.querySelector('code');
      const language = code?.className.match(/language-(\w+)/)?.[1] || '';
      return {
        type: 'code',
        content: element.textContent || '',
        language
      };
      
    case 'table':
      const headers: string[] = [];
      const rows: string[][] = [];
      
      // Extract headers
      const headerRow = element.querySelector('thead tr');
      if (headerRow) {
        for (const th of headerRow.querySelectorAll('th')) {
          headers.push(th.textContent || '');
        }
      }
      
      // Extract rows
      const bodyRows = element.querySelectorAll('tbody tr');
      for (const tr of bodyRows) {
        const row: string[] = [];
        for (const td of tr.querySelectorAll('td')) {
          row.push(td.textContent || '');
        }
        rows.push(row);
      }
      
      return {
        type: 'table',
        content: '',
        headers,
        rows
      };
      
    case 'blockquote':
      return {
        type: 'blockquote',
        content: element.textContent || ''
      };
      
    case 'hr':
      return {
        type: 'hr',
        content: ''
      };
      
    default:
      if (element.textContent?.trim()) {
        return {
          type: 'paragraph',
          content: element.textContent
        };
      }
      return null;
  }
}

async function convertElementsToDocx(elements: ParsedElement[], theme: Theme, includeTOC: boolean): Promise<(Paragraph | Table)[]> {
  const docxElements: (Paragraph | Table)[] = [];
  
  for (const element of elements) {
    switch (element.type) {
      case 'heading':
        const headingLevels = [
          HeadingLevel.HEADING_1,
          HeadingLevel.HEADING_2,
          HeadingLevel.HEADING_3,
          HeadingLevel.HEADING_4,
          HeadingLevel.HEADING_5,
          HeadingLevel.HEADING_6
        ];
        
        docxElements.push(
          new Paragraph({
            text: element.content,
            heading: headingLevels[(element.level || 1) - 1],
            spacing: {
              before: convertMillimetersToTwip(element.level === 1 ? 12 : element.level === 2 ? 10 : 8),
              after: convertMillimetersToTwip(element.level === 1 ? 6 : element.level === 2 ? 4 : 3)
            }
          })
        );
        break;
        
      case 'paragraph':
        if (element.content.trim()) {
          docxElements.push(
            new Paragraph({
              children: parseInlineFormatting(element.content, theme),
              spacing: {
                before: convertMillimetersToTwip(3),
                after: convertMillimetersToTwip(6)
              }
            })
          );
        }
        break;
        
      case 'list':
        if (element.items) {
          for (let i = 0; i < element.items.length; i++) {
            docxElements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${element.content === 'ol' ? `${i + 1}.` : '•'} ${element.items[i]}`,
                    font: theme === 'elegant' ? "Georgia" : "Calibri",
                    size: 22
                  })
                ],
                indent: {
                  left: convertMillimetersToTwip(12),
                  hanging: convertMillimetersToTwip(6)
                },
                spacing: {
                  before: convertMillimetersToTwip(1),
                  after: convertMillimetersToTwip(1)
                }
              })
            );
          }
          
          // Add spacing after list
          docxElements.push(
            new Paragraph({
              text: "",
              spacing: {
                after: convertMillimetersToTwip(6)
              }
            })
          );
        }
        break;
        
      case 'code':
        // Split code into lines for better formatting
        const codeLines = element.content.split('\n');
        
        // Filter out excessive empty lines and normalize spacing
        const normalizedLines = normalizeCodeSpacing(codeLines, element.language);
        
        for (const line of normalizedLines) {
          docxElements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || ' ', // Preserve empty lines
                  font: "Consolas",
                  size: 20,
                  color: "2D3748"
                })
              ],
              style: "CodeBlock",
              spacing: {
                before: 0,
                after: 0,
                line: 240 // 1.2 line spacing for better readability
              }
            })
          );
        }
        
        // Add spacing after code block
        docxElements.push(
          new Paragraph({
            text: "",
            spacing: {
              after: convertMillimetersToTwip(6)
            }
          })
        );
        break;
        
      case 'table':
        if (element.headers && element.rows) {
          const tableRows: TableRow[] = [];
          
          // Add header row
          if (element.headers.length > 0) {
            tableRows.push(
              new TableRow({
                children: element.headers.map(header => 
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: header,
                            bold: true,
                            color: "1F2937",
                            font: theme === 'elegant' ? "Georgia" : "Calibri",
                            size: 22
                          })
                        ],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    shading: {
                      type: ShadingType.SOLID,
                      color: theme === 'elegant' ? "FAF5FF" : "F8FAFC"
                    },
                    margins: {
                      top: convertMillimetersToTwip(3),
                      bottom: convertMillimetersToTwip(3),
                      left: convertMillimetersToTwip(4),
                      right: convertMillimetersToTwip(4)
                    }
                  })
                )
              })
            );
          }
          
          // Add data rows
          for (const row of element.rows) {
            tableRows.push(
              new TableRow({
                children: row.map(cell => 
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: cell,
                            font: theme === 'elegant' ? "Georgia" : "Calibri",
                            size: 20
                          })
                        ]
                      })
                    ],
                    margins: {
                      top: convertMillimetersToTwip(3),
                      bottom: convertMillimetersToTwip(3),
                      left: convertMillimetersToTwip(4),
                      right: convertMillimetersToTwip(4)
                    }
                  })
                )
              })
            );
          }
          
          docxElements.push(
            new Table({
              rows: tableRows,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                left: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                right: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "F1F5F9" },
                insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "F1F5F9" }
              }
            })
          );
          
          // Add spacing after table
          docxElements.push(
            new Paragraph({
              text: "",
              spacing: {
                after: convertMillimetersToTwip(8)
              }
            })
          );
        }
        break;
        
      case 'blockquote':
        docxElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content,
                italics: true,
                color: "4A5568",
                size: 22,
                font: theme === 'elegant' ? "Georgia" : "Calibri"
              })
            ],
            style: "Quote"
          })
        );
        break;
        
      case 'hr':
        docxElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "_______________________________________________",
                color: theme === 'elegant' ? "E9D5FF" : "E5E7EB"
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: convertMillimetersToTwip(8),
              after: convertMillimetersToTwip(8)
            }
          })
        );
        break;
    }
  }
  
  return docxElements;
}

function parseInlineFormatting(text: string, theme: Theme): TextRun[] {
  const runs: TextRun[] = [];
  
  // Simple regex patterns for basic formatting
  const patterns = [
    { regex: /\*\*(.*?)\*\*/g, format: { bold: true } },
    { regex: /\*(.*?)\*/g, format: { italics: true } },
    { regex: /`(.*?)`/g, format: { font: "Consolas", color: "2D3748", shading: { type: ShadingType.SOLID, color: "F1F5F9" } } },
    { regex: /~~(.*?)~~/g, format: { strike: true } },
    { regex: /__(.*?)__/g, format: { underline: { type: UnderlineType.SINGLE } } }
  ];
  
  let processedText = text;
  const formattedRuns: { start: number; end: number; format: any; text: string }[] = [];
  
  // Find all formatted sections
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      formattedRuns.push({
        start: match.index,
        end: match.index + match[0].length,
        format: pattern.format,
        text: match[1]
      });
    }
  }
  
  // Sort by position
  formattedRuns.sort((a, b) => a.start - b.start);
  
  // If no formatting found, return simple text run
  if (formattedRuns.length === 0) {
    return [
      new TextRun({
        text: text,
        font: theme === 'elegant' ? "Georgia" : "Calibri",
        size: 22,
        color: "374151"
      })
    ];
  }
  
  // Build runs with formatting
  let lastEnd = 0;
  
  for (const run of formattedRuns) {
    // Add unformatted text before this run
    if (run.start > lastEnd) {
      const plainText = text.substring(lastEnd, run.start);
      if (plainText) {
        runs.push(
          new TextRun({
            text: plainText,
            font: theme === 'elegant' ? "Georgia" : "Calibri",
            size: 22,
            color: "374151"
          })
        );
      }
    }
    
    // Add formatted run
    runs.push(
      new TextRun({
        text: run.text,
        font: theme === 'elegant' ? "Georgia" : "Calibri",
        size: 22,
        color: "374151",
        ...run.format
      })
    );
    
    lastEnd = run.end;
  }
  
  // Add remaining unformatted text
  if (lastEnd < text.length) {
    const remainingText = text.substring(lastEnd);
    if (remainingText) {
      runs.push(
        new TextRun({
          text: remainingText,
          font: theme === 'elegant' ? "Georgia" : "Calibri",
          size: 22,
          color: "374151"
        })
      );
    }
  }
  
  return runs;
}

/**
 * Normalize code spacing for better formatting
 */
function normalizeCodeSpacing(lines: string[], language?: string): string[] {
  if (!lines.length) return lines;
  
  // Remove leading and trailing empty lines
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  
  // For JSON and YAML, apply specific formatting rules
  if (language === 'json' || language === 'yaml') {
    return normalizeStructuredCode(lines, language);
  }
  
  // For other languages, just reduce excessive empty lines
  const normalized: string[] = [];
  let consecutiveEmpty = 0;
  
  for (const line of lines) {
    if (line.trim() === '') {
      consecutiveEmpty++;
      // Allow max 1 consecutive empty line
      if (consecutiveEmpty <= 1) {
        normalized.push(line);
      }
    } else {
      consecutiveEmpty = 0;
      normalized.push(line);
    }
  }
  
  return normalized;
}

/**
 * Normalize JSON and YAML code with proper indentation
 */
function normalizeStructuredCode(lines: string[], language: string): string[] {
  const normalized: string[] = [];
  const indentSize = language === 'json' ? 2 : 2; // Use 2 spaces for both
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip excessive empty lines
    if (trimmed === '') {
      // Only add empty line if it's between major sections
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
      
      // Add empty line only between closing and opening braces/brackets
      if ((prevLine.endsWith('}') || prevLine.endsWith('},')) && 
          (nextLine.startsWith('"') && nextLine.includes(': {'))) {
        normalized.push('');
      }
      continue;
    }
    
    // Calculate proper indentation level
    const originalIndent = line.length - line.trimStart().length;
    let indentLevel = 0;
    
    // Count nesting level for proper indentation
    for (let j = 0; j < i; j++) {
      const prevTrimmed = lines[j].trim();
      if (prevTrimmed.endsWith('{') || prevTrimmed.endsWith('[')) {
        indentLevel++;
      } else if (prevTrimmed.startsWith('}') || prevTrimmed.startsWith(']')) {
        indentLevel--;
      }
    }
    
    // Adjust for current line
    if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    // Apply consistent indentation
    const properIndent = ' '.repeat(indentLevel * indentSize);
    normalized.push(properIndent + trimmed);
  }
  
  return normalized;
}