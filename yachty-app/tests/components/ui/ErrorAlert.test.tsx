import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

describe('ErrorAlert Component', () => {
  describe('Rendering', () => {
    it('should render error message', () => {
      render(<ErrorAlert message="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render error icon', () => {
      const { container } = render(<ErrorAlert message="Error" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-red-600');
    });

    it('should have error styling', () => {
      render(<ErrorAlert message="Error" />);
      const message = screen.getByText('Error');
      expect(message).toHaveClass('text-red-800');
    });

    it('should have red border and background', () => {
      const { container } = render(<ErrorAlert message="Error" />);
      const alert = container.firstChild;
      expect(alert).toHaveClass('bg-red-50', 'border-red-200');
    });
  });

  describe('Dismissible', () => {
    it('should not show dismiss button by default', () => {
      render(<ErrorAlert message="Error" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should show dismiss button when onDismiss provided', () => {
      render(<ErrorAlert message="Error" onDismiss={() => {}} />);
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button clicked', async () => {
      const onDismiss = vi.fn();
      const user = userEvent.setup();

      render(<ErrorAlert message="Error" onDismiss={onDismiss} />);
      await user.click(screen.getByRole('button', { name: 'Dismiss' }));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should render dismiss icon', () => {
      const { container } = render(<ErrorAlert message="Error" onDismiss={() => {}} />);
      const button = screen.getByRole('button', { name: 'Dismiss' });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use flexbox layout', () => {
      const { container } = render(<ErrorAlert message="Error" />);
      const alert = container.firstChild;
      expect(alert).toHaveClass('flex', 'items-start');
    });

    it('should have proper spacing', () => {
      const { container } = render(<ErrorAlert message="Error" />);
      const alert = container.firstChild;
      expect(alert).toHaveClass('gap-3', 'p-4');
    });

    it('should have rounded corners', () => {
      const { container } = render(<ErrorAlert message="Error" />);
      const alert = container.firstChild;
      expect(alert).toHaveClass('rounded-lg');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on dismiss button', () => {
      render(<ErrorAlert message="Error" onDismiss={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Dismiss');
    });

    it('should be keyboard accessible for dismiss', async () => {
      const onDismiss = vi.fn();
      const user = userEvent.setup();

      render(<ErrorAlert message="Error" onDismiss={onDismiss} />);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onDismiss).toHaveBeenCalled();
    });

    it('should have hover styles on dismiss button', () => {
      render(<ErrorAlert message="Error" onDismiss={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:text-red-800');
    });
  });

  describe('Content', () => {
    it('should handle long error messages', () => {
      const longMessage = 'This is a very long error message that should still render correctly without breaking the layout or causing any visual issues';
      render(<ErrorAlert message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<ErrorAlert message="Error: Failed with code #404!" />);
      expect(screen.getByText('Error: Failed with code #404!')).toBeInTheDocument();
    });

    it('should handle empty message', () => {
      const { container } = render(<ErrorAlert message="" />);
      const paragraph = container.querySelector('p.text-sm.text-red-800');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveTextContent('');
    });
  });
});
