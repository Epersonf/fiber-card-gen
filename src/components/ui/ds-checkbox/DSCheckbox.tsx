import React from 'react';
import './DSCheckbox.css';

interface DSCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

const DSCheckbox: React.FC<DSCheckboxProps> = ({ label, className, ...props }) => (
  <label className={['ds-checkbox-label', className].filter(Boolean).join(' ')}>
    <input className="ds-checkbox" type="checkbox" {...props} />
    {label && <span className="ds-checkbox-text">{label}</span>}
  </label>
);

export default DSCheckbox;
