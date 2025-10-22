import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  describe('Rendering', () => {
    it('should render spinner', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have spinning animation', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });

    it('should render with default size (medium)', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-8', 'h-8');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = render(<LoadingSpinner size="small" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-5', 'h-5');
    });

    it('should render medium size', () => {
      const { container } = render(<LoadingSpinner size="medium" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-8', 'h-8');
    });

    it('should render large size', () => {
      const { container } = render(<LoadingSpinner size="large" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-12', 'h-12');
    });
  });

  describe('Text', () => {
    it('should render without text by default', () => {
      render(<LoadingSpinner />);
      expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
    });

    it('should render with text', () => {
      render(<LoadingSpinner text="Loading..." />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should style text correctly', () => {
      render(<LoadingSpinner text="Please wait" />);
      const text = screen.getByText('Please wait');
      expect(text).toHaveClass('text-sm', 'text-gray-600');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should maintain base classes with custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });

  describe('Visual Elements', () => {
    it('should have circle element for spinner', () => {
      const { container } = render(<LoadingSpinner />);
      const circle = container.querySelector('circle');
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveAttribute('cx', '12');
      expect(circle).toHaveAttribute('cy', '12');
      expect(circle).toHaveAttribute('r', '10');
    });

    it('should have path element for spinner', () => {
      const { container } = render(<LoadingSpinner />);
      const path = container.querySelector('path');
      expect(path).toBeInTheDocument();
    });

    it('should use blue color theme', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-600');
    });
  });
});
