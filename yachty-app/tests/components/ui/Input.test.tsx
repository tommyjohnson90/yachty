import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/components/ui/Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input field', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should generate id from label', () => {
      render(<Input label="Email Address" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email-address');
    });

    it('should use custom id if provided', () => {
      render(<Input label="Email" id="custom-id" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('should render with default type text', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });
  });

  describe('Input Types', () => {
    it('should render email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should render number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('States', () => {
    it('should render with error', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toHaveClass('text-red-600');
    });

    it('should apply error styles to input', () => {
      render(<Input error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('should render with helper text', () => {
      render(<Input helperText="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
      expect(screen.getByText('Enter your email address')).toHaveClass('text-gray-600');
    });

    it('should not show helper text when error exists', () => {
      render(<Input error="Error" helperText="Helper text" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('should render disabled state', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:bg-gray-50', 'disabled:cursor-not-allowed');
    });

    it('should show required asterisk', () => {
      render(<Input label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveClass('text-red-500');
    });
  });

  describe('Interactions', () => {
    it('should call onChange when value changes', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={onChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');

      expect(onChange).toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });

    it('should not trigger onChange when disabled', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={onChange} disabled />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle onFocus event', async () => {
      const onFocus = vi.fn();
      const user = userEvent.setup();

      render(<Input onFocus={onFocus} />);
      const input = screen.getByRole('textbox');

      await user.click(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it('should handle onBlur event', async () => {
      const onBlur = vi.fn();
      const user = userEvent.setup();

      render(<Input onBlur={onBlur} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should pass through HTML input attributes', () => {
      render(<Input placeholder="Enter text" maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter text');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should support ref forwarding', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it('should support value prop', () => {
      render(<Input value="test value" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test value');
    });

    it('should support defaultValue prop', () => {
      render(<Input defaultValue="default value" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('default value');
    });
  });

  describe('Accessibility', () => {
    it('should associate label with input', () => {
      render(<Input label="Email" />);
      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', input.id);
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(<Input />);
      const input = screen.getByRole('textbox');

      await user.tab();
      expect(input).toHaveFocus();
    });

    it('should have focus ring styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });
  });
});
