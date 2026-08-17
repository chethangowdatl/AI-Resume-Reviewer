import React from 'react';
import { Download, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function ExportReport({ data, fileName = 'Resume_Review_Report' }) {

  const exportMarkdown = () => {
    if (!data) return;

    let content = `# AI Resume Review & ATS Audit Report\n\n`;
    content += `**ATS Match Score:** ${data.ats_score}/100 (${data.verdict || 'Reviewed'})\n`;
    content += `**Executive Summary:** ${data.summary || ''}\n\n`;

    content += `## 🌟 Key Strengths\n`;
    (data.strengths || []).forEach(s => { content += `- ${s}\n`; });

    content += `\n## ⚠️ Areas for Improvement & Weaknesses\n`;
    (data.weaknesses || []).forEach(w => { content += `- ${w}\n`; });

    content += `\n## 🔑 Missing Keywords & Recommended Skills\n`;
    (data.missing_skills || []).forEach(k => { content += `- ${k}\n`; });

    content += `\n## ⚡ Rewritten Bullet Points (Before vs After)\n`;
    (data.improved_bullet_points || []).forEach((item, i) => {
      content += `### Bullet ${i + 1}\n`;
      content += `- **Original:** ${item.original}\n`;
      content += `- **Revised:** ${item.improved}\n`;
      content += `- **Reasoning:** ${item.reasoning}\n\n`;
    });

    if (data.final_recommendation) {
      content += `\n## 💡 Final Strategic Advice\n${data.final_recommendation}\n`;
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName.replace('.pdf', '')}_ATS_Report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!data) return;

    // Create a temporary, ultra-clean white document element specifically for PDF generation
    const printContainer = document.createElement('div');
    printContainer.style.width = '750px';
    printContainer.style.padding = '30px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.color = '#0f172a';
    printContainer.style.fontFamily = "'Inter', 'Helvetica Neue', Arial, sans-serif";
    printContainer.style.fontSize = '14px';
    printContainer.style.lineHeight = '1.6';

    const cleanFileName = fileName.replace('.pdf', '');

    let html = `
      <div style="border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="font-size: 24px; font-weight: 800; color: #1e1b4b; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: -0.5px;">
            ATS Resume Audit & Optimization Report
          </h1>
          <p style="font-size: 13px; color: #64748b; margin: 0;">
            Document: <strong>${cleanFileName}.pdf</strong> &bull; Date: ${new Date().toLocaleDateString()}
          </p>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; background-color: ${data.ats_score >= 80 ? '#ecfdf5' : data.ats_score >= 65 ? '#fffbebf' : '#fef2f2'}; border: 1px solid ${data.ats_score >= 80 ? '#059669' : data.ats_score >= 65 ? '#d97706' : '#dc2626'}; border-radius: 8px; padding: 6px 14px; text-align: center;">
            <div style="font-size: 22px; font-weight: 800; color: ${data.ats_score >= 80 ? '#047857' : data.ats_score >= 65 ? '#b45309' : '#b91c1c'}; line-height: 1;">
              ${data.ats_score}<span style="font-size: 13px; color: #64748b;">/100</span>
            </div>
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; margin-top: 2px;">
              ${data.verdict || 'Score'}
            </div>
          </div>
        </div>
      </div>

      <!-- Executive Summary -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #4338ca; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          Executive Assessment
        </h2>
        <p style="margin: 0; color: #334155; font-size: 13.5px;">${data.summary}</p>
        ${data.final_recommendation ? `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #1e293b;">
            <strong style="color: #d97706;">Actionable Advice:</strong> ${data.final_recommendation}
          </div>
        ` : ''}
      </div>

      <!-- 2-Column Grid: Strengths & Weaknesses -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 10px;">
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; min-height: 160px;">
              <h3 style="font-size: 14px; font-weight: 700; color: #15803d; margin: 0 0 10px 0;">
                ✓ Key Strengths
              </h3>
              <ul style="margin: 0; padding-left: 18px; color: #166534; font-size: 13px;">
                ${(data.strengths || []).map(s => `<li style="margin-bottom: 6px;">${s}</li>`).join('')}
              </ul>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 10px;">
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; min-height: 160px;">
              <h3 style="font-size: 14px; font-weight: 700; color: #b45309; margin: 0 0 10px 0;">
                ⚠ Areas for Improvement
              </h3>
              <ul style="margin: 0; padding-left: 18px; color: #92400e; font-size: 13px;">
                ${(data.weaknesses || []).map(w => `<li style="margin-bottom: 6px;">${w}</li>`).join('')}
              </ul>
            </div>
          </td>
        </tr>
      </table>

      <!-- Missing Skills -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 8px 0; text-transform: uppercase;">
          Recommended Technical Skills to Include
        </h3>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${(data.missing_skills || []).map(skill => `
            <span style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 10px; font-size: 12px; font-weight: 600; color: #475569;">
              + ${skill}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Bullet Point Optimizer -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: 800; color: #4338ca; border-bottom: 1.5px solid #e0e7ff; padding-bottom: 6px; margin: 0 0 15px 0;">
          Rewritten Bullet Points (ATS Optimized)
        </h2>
        ${(data.improved_bullet_points || []).map((b, i) => `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
            <div style="margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 700; color: #dc2626; text-transform: uppercase; background: #fef2f2; padding: 2px 6px; border-radius: 4px;">Original</span>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b; font-style: italic;">"${b.original}"</p>
            </div>
            <div style="background-color: #f0fdf4; border-left: 3px solid #16a34a; padding: 8px 10px; margin-top: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase;">Optimized Revision</span>
              <p style="margin: 3px 0 0 0; font-size: 13.5px; font-weight: 600; color: #0f172a;">"${b.improved}"</p>
              ${b.reasoning ? `<p style="margin: 4px 0 0 0; font-size: 11.5px; color: #475569;"><em>Why: ${b.reasoning}</em></p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      ${data.job_match ? `
        <!-- Job Description Match Section -->
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #0369a1; margin: 0 0 8px 0;">
            Target Job Description Match (${data.job_match.match_percentage}%)
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155;">${data.job_match.advice}</p>
          <div style="font-size: 12px; color: #64748b;">
            <strong>Matching Keywords:</strong> ${(data.job_match.matching_keywords || []).join(', ')}
          </div>
        </div>
      ` : ''}

      <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8;">
        Generated by AI Resume Reviewer &bull; http://localhost:3000
      </div>
    `;

    printContainer.innerHTML = html;
    document.body.appendChild(printContainer);

    const opt = {
      margin: 0.4,
      filename: `${cleanFileName}_ATS_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(printContainer)
      .save()
      .then(() => {
        document.body.removeChild(printContainer);
      })
      .catch((err) => {
        console.error('PDF export error:', err);
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
      });
  };

  return (
    <div style={styles.container}>
      <button style={styles.btnSecondary} onClick={exportMarkdown}>
        <FileText size={16} color="#818cf8" />
        <span>Export Markdown</span>
      </button>

      <button style={styles.btnPrimary} onClick={exportPDF}>
        <Download size={16} color="#ffffff" />
        <span>Download PDF Report</span>
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.875rem',
    padding: '0.6rem 1.15rem',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s ease',
  },
  btnSecondary: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f8fafc',
    fontWeight: '500',
    fontSize: '0.875rem',
    padding: '0.6rem 1.15rem',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    transition: 'all 0.2s ease',
  }
};
