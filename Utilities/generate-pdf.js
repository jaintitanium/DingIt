/**
 * PDF Generation Utility
 * Converts the Technical Assessment Report from Markdown to PDF
 *
 * Usage: npm run generate-pdf
 */

const { mdToPdf } = require('md-to-pdf');
const path = require('path');

async function generatePdf() {
    // Get command line argument for which file to convert
    const fileArg = process.argv[2] || 'technical';

    let inputFile, outputFile;
    if (fileArg === 'features') {
        inputFile = path.join(__dirname, '..', 'docs', 'FEATURE_LIST.md');
        outputFile = path.join(__dirname, '..', 'docs', 'FEATURE_LIST.pdf');
    } else {
        inputFile = path.join(__dirname, '..', 'TECHNICAL_ASSESSMENT_REPORT.md');
        outputFile = path.join(__dirname, '..', 'TECHNICAL_ASSESSMENT_REPORT.pdf');
    }

    console.log('Converting Markdown to PDF...');
    console.log(`Input: ${inputFile}`);
    console.log(`Output: ${outputFile}`);

    try {
        const pdf = await mdToPdf(
            { path: inputFile },
            {
                dest: outputFile,
                pdf_options: {
                    format: 'A4',
                    margin: {
                        top: '20mm',
                        bottom: '20mm',
                        left: '20mm',
                        right: '20mm'
                    },
                    printBackground: true
                },
                stylesheet: [
                    'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css'
                ],
                css: `
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        max-width: 100%;
                        padding: 0;
                    }
                    h1 {
                        color: #1a365d;
                        border-bottom: 3px solid #2563eb;
                        padding-bottom: 10px;
                    }
                    h2 {
                        color: #1e40af;
                        border-bottom: 1px solid #93c5fd;
                        padding-bottom: 5px;
                        margin-top: 30px;
                    }
                    h3 {
                        color: #1e3a8a;
                    }
                    h4 {
                        color: #3730a3;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 15px 0;
                        font-size: 0.9em;
                    }
                    th {
                        background-color: #1e40af;
                        color: white;
                        padding: 10px;
                        text-align: left;
                    }
                    td {
                        padding: 8px 10px;
                        border: 1px solid #e5e7eb;
                    }
                    tr:nth-child(even) {
                        background-color: #f9fafb;
                    }
                    code {
                        background-color: #f3f4f6;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 0.9em;
                    }
                    pre {
                        background-color: #1f2937;
                        color: #e5e7eb;
                        padding: 15px;
                        border-radius: 8px;
                        overflow-x: auto;
                        font-size: 0.85em;
                    }
                    pre code {
                        background-color: transparent;
                        color: inherit;
                        padding: 0;
                    }
                    blockquote {
                        border-left: 4px solid #2563eb;
                        padding-left: 15px;
                        color: #4b5563;
                        margin: 15px 0;
                    }
                    strong {
                        color: #1f2937;
                    }
                    hr {
                        border: none;
                        border-top: 1px solid #d1d5db;
                        margin: 30px 0;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                `,
                launch_options: {
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
            }
        );

        if (pdf) {
            console.log('\n✅ PDF generated successfully!');
            console.log(`📄 File: ${outputFile}`);
        }
    } catch (error) {
        console.error('❌ Error generating PDF:', error.message);
        process.exit(1);
    }
}

generatePdf();
