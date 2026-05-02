import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { createGem } from '../../api';
import { useAuth } from '../../context/AuthContext';
import './AddGem.css';


const CATEGORIES = ['Classical', 'Retail', 'Precious', 'Semi-Precious', 'Rare', 'Collector', 'Birthstone'];
const GEM_TYPES = ['Ruby', 'Blue Sapphire', 'Padparadscha Sapphire', 'Lavender Sapphire', 'Purple Sapphire', 'White Sapphire', 'Pink Sapphire', 'Yellow Sapphire', 'Star Sapphire', 'Emerald', 'Diamond', 'Garnet', 'Amethyst', 'Aquamarine', 'Topaz', 'Opal', 'Pearl', 'Tanzanite', 'Peridot', 'Blue Topaz', 'Other'];
const STATUSES = ['Available', 'Sold'];

const INITIAL_FORM = {
  name: '', category: '', gemType: '', price: '', status: 'Available',
  description: '', weight: '', clarity: '', size: '', colour: '',
  shapeAndCut: '', treatment: '', certificate: '', origin: 'Sri Lanka'
};

export default function AddGem() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePreview = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      setError('Name, category, and price are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));
      const data = await createGem(formData, token);
      if (data._id) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setForm(INITIAL_FORM);
          setImages([]);
          setPreviews([]);
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Failed to create gem');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <AdminLayout title="Add Gem" subtitle="Admin Panel">
      <div className="addgem-container">
        <div className="addgem-card">
          <h2 className="addgem-heading">Add New Gem</h2>

          {error && <div className="addgem-error">{error}</div>}
          {success && <div className="addgem-success">✓ Gem added successfully! Redirecting...</div>}

          <form onSubmit={handleSubmit} className="addgem-form">
            <div className="addgem-grid">
              {/* Left: Image Upload */}
              <div className="addgem-left">
                <label className="field-label">Gem Image</label>
                <div
                  className={`image-dropzone ${dragOver ? 'drag-over' : ''} ${previews.length > 0 ? 'has-images' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => previews.length === 0 && fileInputRef.current?.click()}
                >
                  {previews.length === 0 ? (
                    <div className="dropzone-placeholder">
                      <div className="upload-icon">⬆️</div>
                      <p><span className="click-link" onClick={() => fileInputRef.current?.click()}>Click here</span> to upload or drop image here</p>
                      <p className="no-file">No file chosen yet</p>
                    </div>
                  ) : (
                    <div className="preview-grid">
                      {previews.map((src, i) => (
                        <div key={i} className="preview-item">
                          <img src={src} alt={`preview ${i}`} />
                          <button type="button" className="remove-preview" onClick={(e) => { e.stopPropagation(); removePreview(i); }}>✕</button>
                        </div>
                      ))}
                      <div className="preview-add" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        + Add more
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => handleFiles(e.target.files)}
                />
              </div>

             
              <div className="addgem-right">
                <div className="field-group">
                  <label className="field-label">Gem Name <span className="required">*</span></label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. 1.21ct Natural Unheated Ruby" required />
                </div>
                <div className="field-group">
                  <label className="field-label">Category <span className="required">*</span></label>
                  <select name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Gem Type</label>
                  <select name="gemType" value={form.gemType} onChange={handleChange}>
                    <option value="">Select gem type</option>
                    {GEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Price (LKR) <span className="required">*</span></label>
                  <div className="price-input">
                    <span className="price-prefix">$</span>
                    <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0" min="0" required />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

      
            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the gem's characteristics, provenance, and unique qualities..." />
            </div>

            {/* Gem Details Section */}
            <div className="details-section">
              <h3 className="details-heading">Gem Specifications</h3>
              <div className="details-grid">
                <div className="field-group">
                  <label className="field-label">Weight</label>
                  <input type="text" name="weight" value={form.weight} onChange={handleChange} placeholder="e.g. 1.21 carat" />
                </div>
                <div className="field-group">
                  <label className="field-label">Clarity</label>
                  <input type="text" name="clarity" value={form.clarity} onChange={handleChange} placeholder="e.g. Eye clean" />
                </div>
                <div className="field-group">
                  <label className="field-label">Size</label>
                  <input type="text" name="size" value={form.size} onChange={handleChange} placeholder="e.g. 5.5x6.0mm" />
                </div>
                <div className="field-group">
                  <label className="field-label">Colour</label>
                  <input type="text" name="colour" value={form.colour} onChange={handleChange} placeholder="e.g. Red Ruby" />
                </div>
                <div className="field-group">
                  <label className="field-label">Shape & Cut</label>
                  <input type="text" name="shapeAndCut" value={form.shapeAndCut} onChange={handleChange} placeholder="e.g. Cushion/Step" />
                </div>
                <div className="field-group">
                  <label className="field-label">Treatment</label>
                  <input type="text" name="treatment" value={form.treatment} onChange={handleChange} placeholder="e.g. Unheated" />
                </div>
                <div className="field-group">
                  <label className="field-label">Certificate</label>
                  <input type="text" name="certificate" value={form.certificate} onChange={handleChange} placeholder="e.g. GIA-12345" />
                </div>
                <div className="field-group">
                  <label className="field-label">Origin</label>
                  <input type="text" name="origin" value={form.origin} onChange={handleChange} placeholder="e.g. Sri Lanka" />
                </div>
              </div>
            </div>

            <div className="addgem-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate('/admin/dashboard')}>
                CANCEL
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Adding Gem...' : 'ADD GEM'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
