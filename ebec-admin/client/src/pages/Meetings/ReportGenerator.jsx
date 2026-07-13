import { useState, useRef, useEffect } from 'react';
import { FileText, Layout } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { htmlToLatex, generateLatexReport } from '../../utils/helpers';
import { LEGACY_2025_TEAM } from '../../utils/legacyData';

export default function ReportGenerator({ meeting, onClose, onSave }) {
  const [reportData, setReportData] = useState(meeting?.report || { type: 'latex', content: '', fileName: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamList, setTeamList] = useState(LEGACY_2025_TEAM);

  useEffect(() => {
    async function loadTeam() {
      const { data } = await supabase.from('managers').select('name, role').eq('is_active', true);
      if (data && data.length > 0) setTeamList(data.map(m => ({ name: m.name, role: m.role })));
    }
    loadTeam();
  }, []);

  const generateLatex = () => {
    setIsGenerating(true);
    const attendance = meeting?.attendance || {};
    const attendeeRows = teamList.map(m => {
      const status = attendance[m.name] || 'absent';
      const symbol = status === 'present' ? 'P' : (status === 'late' ? 'L' : 'A');
      return `${m.name} & ${m.role} & ${symbol} \\\\ \\hline`;
    }).join('\n');

    const notesTex = htmlToLatex(meeting?.notes);
    const latex = generateLatexReport(meeting, attendeeRows, notesTex);

    setTimeout(() => {
      setReportData({ ...reportData, type: 'latex', content: latex, fileName: `EBEC_Report_${meeting.id}.tex` });
      setIsGenerating(false);
    }, 2000);
  };

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const filePath = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('reports').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('reports').getPublicUrl(filePath);
      setReportData({ ...reportData, type: 'pdf', fileName: file.name, fileUrl: publicUrl });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="form-overlay fade-in">
      <div className="premium-form" style={{ maxWidth: 700 }}>
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta"><span className="meta-text">REPORT CENTER</span></div>
            <h2>{meeting?.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="form-body">
          <p className="sub-text mb-8">Choose to upload an existing PDF or generate a professional LaTeX report using meeting notes.</p>

          <div className="mgmt-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf" onChange={handleFileUpload} />
            <div className={`premium-card ${reportData.type === 'pdf' ? 'selected' : ''}`}
              style={{ cursor: 'pointer', border: reportData.type === 'pdf' ? '2px solid var(--apple-blue)' : '' }}
              onClick={() => fileInputRef.current?.click()}>
              <div className="option-icon email"><FileText size={20} /></div>
              <h4 className="mt-4">{isUploading ? 'Uploading...' : 'Upload PDF'}</h4>
              <p style={{ fontSize: 12 }}>{reportData.type === 'pdf' ? reportData.fileName : 'Attach existing report'}</p>
            </div>
            <div className={`premium-card ${reportData.type === 'latex' ? 'selected' : ''}`}
              style={{ cursor: 'pointer', border: reportData.type === 'latex' ? '2px solid var(--apple-blue)' : '' }}
              onClick={generateLatex}>
              <div className="option-icon meet"><Layout size={20} /></div>
              <h4 className="mt-4">{isGenerating ? 'Generating...' : 'Generate LaTeX'}</h4>
              <p style={{ fontSize: 12 }}>Create report from notes</p>
            </div>
          </div>

          {reportData.type === 'pdf' && reportData.fileUrl && (
            <div className="mt-6 p-4" style={{ background: 'rgba(0,113,227,0.05)', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={20} color="var(--apple-blue)" />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{reportData.fileName}</span>
              </div>
              <a href={reportData.fileUrl} target="_blank" rel="noopener noreferrer" className="pill-btn" style={{ background: '#000', color: '#fff' }}>View PDF</a>
            </div>
          )}

          {reportData.content && (
            <div className="mt-8">
              <label className="section-label">Generated LaTeX Code</label>
              <textarea readOnly className="notes-editor w-full"
                style={{ height: 200, fontFamily: 'monospace', fontSize: 12, padding: 16, background: '#f5f5f7' }}
                value={reportData.content} />
              <button className="pill-btn mt-4" onClick={() => { navigator.clipboard.writeText(reportData.content); alert("LaTeX Copied!"); }}>Copy LaTeX</button>
            </div>
          )}

          {reportData.type === 'pdf' && reportData.fileUrl && (
            <div className="mt-8" style={{ height: '500px', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
              <iframe src={reportData.fileUrl} title="Report Viewer" style={{ width: '100%', height: '100%', border: 'none' }} />
            </div>
          )}
        </div>
        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={onClose}>Close</button>
          <button className="btn-primary-premium ripple" onClick={() => { onSave(meeting.id, reportData); onClose(); }}>Save & Sync Report</button>
        </div>
      </div>
    </div>
  );
}
