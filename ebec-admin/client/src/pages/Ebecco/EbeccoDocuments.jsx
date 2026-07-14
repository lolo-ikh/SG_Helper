import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash, Download, Search, FolderOpen, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { extractPdfText, chunkDocument } from '../../utils/pdfExtractor';
import { enhanceChunks } from '../../utils/ebeccoEnhance';
import Toast from '../../components/Toast';

const CATEGORIES = [
  { value: 'meeting_report', label: 'Meeting Reports' },
  { value: 'admin_doc', label: 'Admin Documents' },
  { value: 'presentation', label: 'Presentations' },
  { value: 'general', label: 'General' },
];

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function EbeccoDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadFile, setUploadFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ebecco_documents').select('*').order('created_at', { ascending: false });
    if (error) console.error('[EBECO] Load failed:', error.message);
    setDocuments(data || []);
    setLoading(false);
  };

  useEffect(() => { loadDocuments(); }, []);

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      showNotification('Please fill in title and select a file', 'error');
      return;
    }
    setUploading(true);
    try {
      const filePath = `docs/${Date.now()}-${uploadFile.name}`;
      const { error: storageErr } = await supabase.storage.from('ebecco-docs').upload(filePath, uploadFile);
      if (storageErr) throw storageErr;

      let pageCount = 0;
      let chunkCount = 0;

      if (uploadFile.type === 'application/pdf' || uploadFile.name.endsWith('.pdf')) {
        try {
          showNotification('Extracting and parsing PDF...', 'info');
          const extracted = await extractPdfText(uploadFile);
          pageCount = extracted.pageCount;
          const { chunks } = chunkDocument(extracted.fullText);
          chunkCount = chunks.length;

          const { data: docRow, error: dbErr } = await supabase.from('ebecco_documents').insert([{
            title: uploadTitle.trim(),
            category: uploadCategory,
            file_name: uploadFile.name,
            file_path: filePath,
            file_size: uploadFile.size,
            page_count: pageCount,
            chunk_count: chunkCount,
            uploaded_by: user?.id,
          }]).select().single();
          if (dbErr) throw dbErr;

          if (chunks.length > 0) {
            const rows = chunks.map(c => ({
              document_id: docRow.id,
              chunk_index: c.chunk_index,
              content: c.content,
              page_number: c.page_number,
            }));
            const { error: chunkErr } = await supabase.from('ebecco_chunks').insert(rows);
            if (chunkErr) console.error('[EBECO] Chunk insert failed:', chunkErr.message);

            enhanceChunks(docRow.id).then(n => {
              if (n > 0) console.log(`[EBECO] Enhanced ${n} chunks for doc ${docRow.id}`);
            });
          }
        } catch (extractErr) {
          console.error('[EBECO] PDF extraction failed:', extractErr);
          await supabase.from('ebecco_documents').insert([{
            title: uploadTitle.trim(),
            category: uploadCategory,
            file_name: uploadFile.name,
            file_path: filePath,
            file_size: uploadFile.size,
            uploaded_by: user?.id,
          }]);
          showNotification('PDF text extraction failed — file saved without indexing', 'error');
        }
      } else {
        const { error: dbErr } = await supabase.from('ebecco_documents').insert([{
          title: uploadTitle.trim(),
          category: uploadCategory,
          file_name: uploadFile.name,
          file_path: filePath,
          file_size: uploadFile.size,
          uploaded_by: user?.id,
        }]);
        if (dbErr) throw dbErr;
      }

      showNotification('Document uploaded successfully');
      setUploadTitle('');
      setUploadCategory('general');
      setUploadFile(null);
      setShowUpload(false);
      loadDocuments();
    } catch (err) {
      console.error('[EBECO] Upload failed:', err.message);
      showNotification('Upload failed: ' + err.message, 'error');
    }
    setUploading(false);
  };

  const handleDownload = async (doc) => {
    const { data, error } = await supabase.storage.from('ebecco-docs').createSignedUrl(doc.file_path, 3600);
    if (error) { showNotification('Download failed', 'error'); return; }
    window.open(data.signedUrl, '_blank');
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    await supabase.storage.from('ebecco-docs').remove([doc.file_path]);
    await supabase.from('ebecco_documents').delete().eq('id', doc.id);
    showNotification('Document deleted');
    loadDocuments();
  };

  const filtered = documents.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const getCategoryLabel = (cat) => CATEGORIES.find(c => c.value === cat)?.label || cat;

  return (
    <div className="dashboard-content fade-in" style={{ maxWidth: 1100 }}>
      <Toast message={notification?.msg} type={notification?.type} onDone={() => setNotification(null)} />

      <div className="page-header">
        <div>
          <h1 className="page-title">EBECO Documents</h1>
          <p className="page-subtitle">
            {documents.length > 0
              ? `${documents.length} document${documents.length !== 1 ? 's' : ''} in knowledge base`
              : 'Upload and manage documents for the EBECO chatbot knowledge base'}
          </p>
        </div>
        <button className="btn-icon-plus" onClick={() => setShowUpload(!showUpload)} disabled={uploading}>
          {uploading ? <Loader2 size={14} className="ebecco-spinner" /> : showUpload ? <X size={14} /> : <Upload size={14} />} {uploading ? 'Processing...' : showUpload ? 'Cancel' : 'Upload'}
        </button>
      </div>

      {showUpload && (
        <div className="glass-panel-wide" style={{ padding: 24, marginBottom: 32 }}>
          <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: 16 }}>Upload Document</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder="Document title..." className="premium-input"
              value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} />
            <select className="premium-input" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) { setUploadFile(e.dataTransfer.files[0]); setUploadTitle(prev => prev || e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, '')); } }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? '#0071e3' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 16, padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
                background: dragActive ? 'rgba(0,113,227,0.05)' : 'transparent', transition: '0.2s'
              }}>
              <input ref={fileInputRef} type="file" accept=".pdf,.pptx,.ppt,.docx,.doc,.txt" style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) { setUploadFile(e.target.files[0]); setUploadTitle(prev => prev || e.target.files[0].name.replace(/\.[^/.]+$/, '')); } }} />
              {uploadFile ? (
                <div style={{ color: '#fff' }}>
                  <FileText size={24} style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{uploadFile.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{formatSize(uploadFile.size)}</p>
                </div>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <Upload size={24} style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>Drag & drop or click to select</p>
                  <p style={{ margin: 0, fontSize: 11, marginTop: 4 }}>PDF, PPTX, DOCX, TXT</p>
                </div>
              )}
            </div>
            <button className="btn-primary-premium ripple" onClick={handleUpload} disabled={uploading || !uploadFile || !uploadTitle.trim()}
              style={{ alignSelf: 'flex-end' }}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="premium-search-container" style={{ flex: 1, minWidth: 200 }}>
          <div className="search-icon-wrapper"><Search size={14} /></div>
          <input type="text" placeholder="Search documents..." className="cute-search-input" style={{ width: '100%' }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="season-tabs">
          <button className={`season-tab ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>All</button>
          {CATEGORIES.map(c => (
            <button key={c.value} className={`season-tab ${categoryFilter === c.value ? 'active' : ''}`}
              onClick={() => setCategoryFilter(c.value)}>{c.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40 }}>Loading documents...</p>
      ) : filtered.length === 0 ? (
        <div className="glass-panel-wide" style={{ padding: 60, textAlign: 'center' }}>
          <FolderOpen size={48} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 16 }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
            {documents.length === 0 ? 'No documents uploaded yet. Click "Upload" to get started.' : 'No documents match your search.'}
          </p>
        </div>
      ) : (
        <div className="mgmt-grid">
          {filtered.map(doc => (
            <div key={doc.id} className="glass-panel-wide" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ background: 'rgba(0,113,227,0.15)', borderRadius: 12, padding: 10, flexShrink: 0 }}>
                    <FileText size={20} style={{ color: '#0071e3' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ color: '#fff', margin: 0, fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 11, marginTop: 2 }}>{doc.file_name}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 100, fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {getCategoryLabel(doc.category)}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 100, fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {formatSize(doc.file_size)}
                </span>
                {doc.chunk_count > 0 && (
                  <span style={{ background: 'rgba(52,199,89,0.15)', padding: '3px 10px', borderRadius: 100, fontSize: 10, color: '#34c759', fontWeight: 600 }}>
                    <Check size={10} style={{ verticalAlign: -1 }} /> Indexed
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="pill-btn mini" onClick={() => handleDownload(doc)} style={{ flex: 1, justifyContent: 'center' }}>
                  <Download size={12} /> Download
                </button>
                <button className="pill-btn mini" onClick={() => handleDelete(doc)}
                  style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: 'none' }}>
                  <Trash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
