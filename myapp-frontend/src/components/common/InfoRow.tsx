import React from 'react';
import { TextInput } from '../ui/TextInput';

interface InfoRowProps {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  readOnly = true,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
}) => (
  <TextInput
    label={label}
    value={value}
    readOnly={readOnly}
    onChange={onChange}
    onBlur={onBlur}
    placeholder={placeholder}
    type={type}
  />
);
