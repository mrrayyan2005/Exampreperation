import { Document as NoteDocument } from './DocumentEditor';

export type ExportFormat = 'pdf' | 'markdown' | 'html' | 'word';

interface ExportOptions {
    format: ExportFormat;
    includeTitle?: boolean;
    includeDate?: boolean;
    includeTags?: boolean;
}

export class ExportService {
    /**
     * Export note to PDF
     */
    static async exportToPDF(note: NoteDocument, options: ExportOptions = { format: 'pdf' }): Promise<Blob> {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        
        let yPosition = margin;
        
        // Add title
        if (options.includeTitle !== false) {
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text(note.title || 'Untitled Note', margin, yPosition);
            yPosition += 10;
        }
        
        // Add metadata
        if (options.includeDate !== false) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Last updated: ${new Date(note.updatedAt).toLocaleString()}`, margin, yPosition);
            yPosition += 8;
        }
        
        if (options.includeTags !== false && note.tags.length > 0) {
            pdf.text(`Tags: ${note.tags.join(', ')}`, margin, yPosition);
            yPosition += 10;
        }
        
        // Add separator
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        
        // Process blocks
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        for (const block of note.content.blocks) {
            // Check for page break
            if (yPosition > 270) {
                pdf.addPage();
                yPosition = margin;
            }
            
            switch (block.type) {
                case 'heading': {
                    pdf.setFontSize(16);
                    pdf.setFont('helvetica', 'bold');
                    const headingText = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    pdf.text(this.stripHtml(headingText), margin, yPosition);
                    yPosition += 8;
                    break;
                }
                    
                case 'text':
                case 'richText': {
                    const contentStr = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    const text = this.stripHtml(contentStr);
                    const splitText = pdf.splitTextToSize(text, contentWidth);
                    pdf.setFontSize(11);
                    pdf.setFont('helvetica', 'normal');
                    pdf.text(splitText, margin, yPosition);
                    yPosition += (splitText.length * 5) + 5;
                    break;
                }
                    
                case 'code': {
                    pdf.setFontSize(9);
                    pdf.setFont('courier', 'normal');
                    pdf.setFillColor(245, 245, 245);
                    const codeContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    const codeLines = codeContent.split('\n');
                    const codeHeight = codeLines.length * 4 + 4;
                    pdf.rect(margin, yPosition - 3, contentWidth, codeHeight, 'F');
                    pdf.text(codeLines, margin + 2, yPosition);
                    yPosition += codeHeight + 5;
                    break;
                }
                    
                case 'quote': {
                    pdf.setFontSize(11);
                    pdf.setFont('helvetica', 'italic');
                    pdf.setTextColor(80, 80, 80);
                    const quoteContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    const quoteText = this.stripHtml(quoteContent);
                    const splitQuote = pdf.splitTextToSize(`"${quoteText}"`, contentWidth - 10);
                    pdf.text(splitQuote, margin + 5, yPosition);
                    yPosition += (splitQuote.length * 5) + 5;
                    pdf.setTextColor(0, 0, 0);
                    break;
                }
                    
                case 'divider': {
                    pdf.setDrawColor(200, 200, 200);
                    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += 10;
                    break;
                }
                    
                default:
                    break;
            }
        }
        
        return pdf.output('blob');
    }

    /**
     * Export note to Markdown
     */
    static exportToMarkdown(note: NoteDocument, options: ExportOptions = { format: 'markdown' }): string {
        let markdown = '';
        
        // Add title
        if (options.includeTitle !== false) {
            markdown += `# ${note.title || 'Untitled Note'}\n\n`;
        }
        
        // Add metadata
        if (options.includeDate !== false) {
            markdown += `*Last updated: ${new Date(note.updatedAt).toLocaleString()}*\n\n`;
        }
        
        if (options.includeTags !== false && note.tags.length > 0) {
            markdown += `**Tags:** ${note.tags.join(', ')}\n\n`;
        }
        
        markdown += `---\n\n`;
        
        // Process blocks
        for (const block of note.content.blocks) {
            switch (block.type) {
                case 'heading': {
                    const headingContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    markdown += `## ${this.stripHtml(headingContent)}\n\n`;
                    break;
                }
                    
                case 'text':
                case 'richText': {
                    const textContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    markdown += `${this.htmlToMarkdown(textContent)}\n\n`;
                    break;
                }
                    
                case 'code': {
                    const lang = block.language || '';
                    const codeContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    markdown += `\`\`\`${lang}\n${codeContent}\n\`\`\`\n\n`;
                    break;
                }
                    
                case 'quote': {
                    const quoteContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    const quoteLines = this.stripHtml(quoteContent).split('\n');
                    markdown += quoteLines.map(line => `> ${line}`).join('\n') + '\n\n';
                    break;
                }
                    
                case 'checklist':
                    try {
                        const checklistContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                        const items = JSON.parse(checklistContent) as Array<{ text: string; checked: boolean }>;
                        items.forEach((item) => {
                            markdown += `- [${item.checked ? 'x' : ' '}] ${item.text}\n`;
                        });
                        markdown += '\n';
                    } catch {
                        const fallbackContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                        markdown += `${fallbackContent}\n\n`;
                    }
                    break;
                    
                case 'divider':
                    markdown += `---\n\n`;
                    break;
                    
                default: {
                    const defaultContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    markdown += `${defaultContent}\n\n`;
                    break;
                }
            }
        }
        
        return markdown;
    }

    /**
     * Export note to HTML
     */
    static exportToHTML(note: NoteDocument, options: ExportOptions = { format: 'html' }): string {
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${note.title || 'Untitled Note'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        h1 { color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
        h2 { color: #333; margin-top: 2rem; }
        .meta { color: #666; font-size: 0.9rem; margin-bottom: 1rem; }
        .tags { margin-bottom: 2rem; }
        .tag { 
            display: inline-block;
            background: #f0f0f0;
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.85rem;
            margin-right: 0.5rem;
        }
        pre {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        code { font-family: 'Consolas', 'Monaco', monospace; }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 0;
            padding-left: 1rem;
            color: #666;
            font-style: italic;
        }
        hr { border: none; border-top: 1px solid #eee; margin: 2rem 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
        th { background: #f5f5f5; }
        img { max-width: 100%; height: auto; }
        ul.checklist { list-style: none; padding-left: 1.5rem; }
        ul.checklist li::before {
            content: "☐ ";
            margin-right: 0.5rem;
        }
        ul.checklist li.checked::before {
            content: "☑ ";
        }
    </style>
</head>
<body>`;
        
        // Add title
        if (options.includeTitle !== false) {
            html += `<h1>${note.title || 'Untitled Note'}</h1>`;
        }
        
        // Add metadata
        html += `<div class="meta">`;
        if (options.includeDate !== false) {
            html += `Last updated: ${new Date(note.updatedAt).toLocaleString()}`;
        }
        html += `</div>`;
        
        if (options.includeTags !== false && note.tags.length > 0) {
            html += `<div class="tags">`;
            note.tags.forEach(tag => {
                html += `<span class="tag">${tag}</span>`;
            });
            html += `</div>`;
        }
        
        html += `<hr>`;
        
        // Process blocks
        for (const block of note.content.blocks) {
            switch (block.type) {
                case 'heading':
                    html += `<h2>${block.content}</h2>`;
                    break;
                    
                case 'text':
                case 'richText':
                    html += `<div class="rich-text">${block.content}</div>`;
                    break;
                    
                case 'code': {
                    const lang = block.language ? ` class="language-${block.language}"` : '';
                    const codeContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    html += `<pre><code${lang}>${this.escapeHtml(codeContent)}</code></pre>`;
                    break;
                }
                    
                case 'quote': {
                    const quoteContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    html += `<blockquote>${quoteContent}</blockquote>`;
                    break;
                }
                    
                case 'image': {
                    const imageContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    const caption = block.metadata?.caption ? `<figcaption>${block.metadata.caption}</figcaption>` : '';
                    html += `<figure><img src="${imageContent}" alt="">${caption}</figure>`;
                    break;
                }
                    
                case 'table': {
                    const tableContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    html += `<div class="table-wrapper">${tableContent}</div>`;
                    break;
                }
                    
                case 'checklist':
                    try {
                        const checklistContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                        const items = JSON.parse(checklistContent) as Array<{ text: string; checked: boolean }>;
                        html += `<ul class="checklist">`;
                        items.forEach((item) => {
                            html += `<li class="${item.checked ? 'checked' : ''}">${item.text}</li>`;
                        });
                        html += `</ul>`;
                    } catch {
                        const fallbackContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                        html += `<p>${fallbackContent}</p>`;
                    }
                    break;
                    
                case 'divider':
                    html += `<hr>`;
                    break;
                    
                default: {
                    const defaultContent = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
                    html += `<p>${defaultContent}</p>`;
                    break;
                }
            }
        }
        
        html += `</body></html>`;
        
        return html;
    }

    /**
     * Export note to Word (DOCX format using HTML as base)
     */
    static exportToWord(note: NoteDocument, options: ExportOptions = { format: 'word' }): Blob {
        const html = this.exportToHTML(note, options);
        
        // Create a Word-specific HTML wrapper
        const wordHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>${note.title || 'Untitled Note'}</title>
                <!--[if gte mso 9]>
                <xml>
                    <w:WordDocument>
                        <w:View>Print</w:View>
                        <w:Zoom>100</w:Zoom>
                    </w:WordDocument>
                </xml>
                <![endif]-->
            </head>
            <body>
                ${html.replace(/<!DOCTYPE html>.*?<body>/s, '').replace('</body></html>', '')}
            </body>
            </html>
        `;
        
        const blob = new Blob([wordHtml], {
            type: 'application/msword'
        });
        
        return blob;
    }

    /**
     * Main export function
     */
    static async export(note: NoteDocument, format: ExportFormat, filename?: string): Promise<void> {
        let blob: Blob;
        let extension: string;
        
        switch (format) {
            case 'pdf':
                blob = await this.exportToPDF(note);
                extension = 'pdf';
                break;
                
            case 'markdown': {
                const markdown = this.exportToMarkdown(note);
                blob = new Blob([markdown], { type: 'text/markdown' });
                extension = 'md';
                break;
            }
                
            case 'html': {
                const html = this.exportToHTML(note);
                blob = new Blob([html], { type: 'text/html' });
                extension = 'html';
                break;
            }
                
            case 'word':
                blob = this.exportToWord(note);
                extension = 'doc';
                break;
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
        
        // Download the file
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${filename || note.title || 'untitled-note'}.${extension}`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Strip HTML tags from content
     */
    private static stripHtml(html: string): string {
        if (typeof window === 'undefined') return html;
        const tmp = window.document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    /**
     * Convert HTML to Markdown
     */
    private static htmlToMarkdown(html: string): string {
        let markdown = html;
        
        // Bold
        markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
        markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');
        
        // Italic
        markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
        markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');
        
        // Links
        markdown = markdown.replace(/<a href="(.*?)".*?>(.*?)<\/a>/g, '[$2]($1)');
        
        // Paragraphs
        markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
        
        // Lists
        markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, '$1');
        markdown = markdown.replace(/<li>(.*?)<\/li>/g, '- $1\n');
        
        // Clean up remaining tags
        markdown = markdown.replace(/<[^>]+>/g, '');
        
        // Decode HTML entities
        if (typeof window !== 'undefined') {
            const textarea = window.document.createElement('textarea');
            textarea.innerHTML = markdown;
            markdown = textarea.value;
        }
        
        return markdown.trim();
    }

    /**
     * Escape HTML special characters
     */
    private static escapeHtml(text: string): string {
        if (typeof window === 'undefined') return text;
        const div = window.document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}