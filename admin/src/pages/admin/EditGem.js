import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { fetchGem, updateGem, getImageUrl } from '../../api';
import { useAuth } from '../../context/AuthContext';
import './AddGem.css';

const CATEGORIES = ['Classical', 'Retail', 'Precious', 'Semi-Precious', 'Rare', 'Birthstone'];
const GEM_TYPES = ['Ruby', 'Blue Sapphire', 'Padparadscha Sapphire', 'Lavender Sapphire', 'Purple Sapphire', 'White Sapphire', 'Pink Sapphire', 'Yellow Sapphire', 'Star Sapphire', 'Emerald', 'Diamond', 'Garnet', 'Amethyst', 'Aquamarine', 'Topaz', 'Opal', 'Pearl', 'Tanzanite', 'Peridot', 'Blue Topaz', 'Other'];
const STATUSES = ['Available', 'Sold'];

export default function EditGem() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    name: '', category: '', gemType: '', price: '', status: 'Available',
    description: '', weight: '', clarity: '', size: '', colour: '',
    shapeAndCut: '', treatment: '', certificate: '', origin: 'Sri Lanka'
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchGem(id).then(gem => {
      setForm({
        name: gem.name || '', category: gem.category || '', gemType: gem.gemType || '',
        price: gem.price || '', status: gem.status || 'Available',
        description: gem.description || '', weight: gem.weight || '',
        clarity: gem.clarity || '', size: gem.size || '', colour: gem.colour || '',
        shapeAndCut: gem.shapeAndCut || '', treatment: gem.treatment || '',
        certificate: gem.certificate || '', origin: gem.origin || 'Sri Lanka'
      });
      setExistingImages(gem.images || (gem.image ? [gem.image] : []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    setNewImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setNewPreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      newImages.forEach(img => formData.append('images', img));
      const data = await updateGem(id, formData, token);
      if (data._id) {
        setSuccess(true);
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      } else {
        setError(data.message || 'Failed to update');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Gem" subtitle="Admin Panel">
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-light)' }}>Loading gem data...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Gem" subtitle="Admin Panel">
      <div className="addgem-container">
        <div className="addgem-card">
          <h2 className="addgem-heading">Edit Gem</h2>
          {error && <div className="addgem-error">{error}</div>}
          {success && <div className="addgem-success">✓ Gem updated successfully!</div>}

          <form onSubmit={handleSubmit} className="addgem-form">
            <div className="addgem-grid">
              <div className="addgem-left">
                <label className="field-label">Current Images</label>
                <div className="existing-images">
                  {existingImages.map((img, i) => (
                    <div key={i} className="preview-item">
                      <img src={getImageUrl(img)} alt={`gem ${i}`} />
                    </div>
                  ))}
                </div>
                <label className="field-label" style={{ marginTop: '16px' }}>Add New Images</label>
                <div
                  className="image-dropzone"
                  style={{ minHeight: '120px' }}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {newPreviews.length === 0 ? (
                    <div className="dropzone-placeholder">
                      <div className="upload-icon">⬆️</div>
                      <p><span className="click-link">Click to add more images</span></p>
                    </div>
                  ) : (
                    <div className="preview-grid">
                      {newPreviews.map((src, i) => (
                        <div key={i} className="preview-item">
                          <img src={src} alt={`new ${i}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
              </div>

              <div className="addgem-right">
                <div className="field-group">
                  <label className="field-label">Gem Name <span className="required">*</span></label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required />
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
                    <input type="number" name="price" value={form.price} onChange={handleChange} min="0" required />
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
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
            </div>

            <div className="details-section">
              <h3 className="details-heading">Gem Specifications</h3>
              <div className="details-grid">
                {['weight','clarity','size','colour','shapeAndCut','treatment','certificate','origin'].map(field => (
                  <div key={field} className="field-group">
                    <label className="field-label">{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                    <input type="text" name={field} value={form[field]} onChange={handleChange} />
                  </div>
                ))}
              </div>
            </div>

            <div className="addgem-actions">
              <button type="button" className="cancel-btn" onClick={() => navigate('/admin/dashboard')}>CANCEL</button>
              <button type="submit" className="submit-btn" disabled={saving}>{saving ? 'Saving...' : 'SAVE CHANGES'}</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
