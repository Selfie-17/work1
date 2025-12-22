import { useEffect, useRef } from 'react';
import 'mathlive';

export default function MathEditor({ value, onChange }) {
  const mathfieldRef = useRef(null);
  const keepFocusRef = useRef(false);

  useEffect(() => {
    const mf = mathfieldRef.current;
    if (!mf) return;

    // Configure MathLive using direct properties (new API)
    mf.mathVirtualKeyboardPolicy = 'auto';

    // Use × for multiplication instead of · (dot)
    mf.inlineShortcuts = {
      ...mf.inlineShortcuts,
      '*': '\\times'
    };

    // Set initial value
    if (value) {
      mf.setValue(value, { silenceNotifications: true });
    }

    const handleChange = () => {
      const latex = mf.getValue('latex');
      onChange(latex);
    };

    // Prevent focus loss when interacting with virtual keyboard
    const handleMouseDown = (e) => {
      if (e.target.closest('.ML__keyboard')) {
        keepFocusRef.current = true;
      }
    };

    const handleMouseUp = () => {
      if (keepFocusRef.current) {
        setTimeout(() => {
          mf.focus();
          keepFocusRef.current = false;
        }, 10);
      }
    };

    mf.addEventListener('input', handleChange);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);

    setTimeout(() => mf.focus(), 100);

    return () => {
      mf.removeEventListener('input', handleChange);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, []);

  useEffect(() => {
    const mf = mathfieldRef.current;
    if (mf && value !== undefined && value !== mf.getValue('latex')) {
      mf.setValue(value, { silenceNotifications: true });
    }
  }, [value]);

  return (
    <div className="math-editor-wrapper">
      <math-field
        ref={mathfieldRef}
        style={{
          width: '100%',
          minHeight: '80px',
          fontSize: '1.4rem',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          color: '#1a202c',
          outline: 'none',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
        }}
      />
    </div>
  );
}
