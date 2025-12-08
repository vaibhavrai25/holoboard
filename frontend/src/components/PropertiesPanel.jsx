import React from 'react';
import useStore from '../store/useStore';

const COLORS = ['#ff6b6b', '#f06595', '#cc5de8', '#845ef7', '#339af0', '#22b8cf', '#20c997', '#51cf66', '#94d82d', '#fcc419', '#ff922b', '#868e96', '#ffffff', '#000000'];

const PropertiesPanel = () => {
  const selectedId = useStore((state) => state.selectedId);
  const shapes = useStore((state) => state.shapes);
  const updateShape = useStore((state) => state.updateShape);
  const deleteSelected = useStore((state) => state.deleteSelected);

  if (!selectedId || !shapes[selectedId]) return null;
  const selectedShape = shapes[selectedId];
  const handleChange = (key, value) => updateShape(selectedId, { [key]: value });

  return (
    <div className="panel-base" style={styles.panel}>
      <div style={styles.header}>Properties</div>
      <div style={styles.section}>
        <label style={styles.label}>Label Text</label>
        <input style={styles.input} value={selectedShape.text || ''} onChange={(e) => handleChange('text', e.target.value)} placeholder="Enter label..." />
      </div>
      <div style={styles.section}>
        <label style={styles.label}>Color</label>
        <div style={styles.grid}>
          {COLORS.map((color) => (
            <div key={color} onClick={() => handleChange('fill', color)} title={color} style={{ ...styles.colorSwatch, backgroundColor: color, border: selectedShape.fill === color ? '2px solid white' : '1px solid var(--button-border)', transform: selectedShape.fill === color ? 'scale(1.2)' : 'scale(1)' }} />
          ))}
        </div>
      </div>
      <div style={styles.section}>
         <button className="icon-button" style={styles.deleteBtn} onClick={deleteSelected}>Delete Shape</button>
      </div>
    </div>
  );
};

const styles = {
  panel: {
    position: 'fixed', top: '80px', right: '20px', width: '240px',
    borderRadius: '12px', padding: '16px', zIndex: 10,
  },
  header: { fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid var(--toolbar-border)', paddingBottom: '8px' },
  section: { marginBottom: '16px' },
  label: { fontSize: '12px', color: 'var(--text-color)', opacity: 0.7, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' },
  input: {
    width: '90%', padding: '8px', borderRadius: '4px', border: '1px solid var(--button-border)',
    background: 'var(--bg-color)', color: 'var(--text-color)', outline: 'none'
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' },
  colorSwatch: { width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' },
  deleteBtn: { width: '100%', background: '#fa5252', border: 'none', padding: '10px', color: 'white', fontWeight: 'bold' }
};

export default PropertiesPanel;