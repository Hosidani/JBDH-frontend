import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('renders label when provided', () => {
    render(<TextInput label="E-post" value="" />);
    expect(screen.getByText('E-post')).toBeInTheDocument();
  });

  it('renders input with correct value', () => {
    render(<TextInput value="test@example.com" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('calls onChange with new value on input', async () => {
    const onChange = vi.fn();
    render(<TextInput value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('calls onBlur when input loses focus', async () => {
    const onBlur = vi.fn();
    render(<TextInput value="foo" onBlur={onBlur} />);
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('shows error message', () => {
    render(<TextInput value="" error="Obligatoriskt fält" />);
    expect(screen.getByText('Obligatoriskt fält')).toBeInTheDocument();
  });

  it('shows helpText', () => {
    render(<TextInput value="" helpText="Max 100 tecken" />);
    expect(screen.getByText('Max 100 tecken')).toBeInTheDocument();
  });

  it('renders readOnly as a div, not an input', () => {
    render(<TextInput value="readonly value" readOnly />);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('readonly value')).toBeInTheDocument();
  });

  it('renders placeholder in readOnly mode when value is empty', () => {
    render(<TextInput value="" readOnly placeholder="Ej angivet" />);
    expect(screen.getByText('Ej angivet')).toBeInTheDocument();
  });

  it('uses email type on the input element', () => {
    render(<TextInput value="" type="email" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('email');
  });
});
