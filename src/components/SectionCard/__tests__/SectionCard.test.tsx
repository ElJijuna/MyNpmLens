import { render, screen } from '@testing-library/react';
import { SectionCard } from '../index';

describe('SectionCard', () => {
  it('renders title', () => {
    render(
      <SectionCard title="Package info" isLoading={false}>
        <p>content</p>
      </SectionCard>,
    );
    expect(screen.getByText('Package info')).toBeInTheDocument();
  });

  it('shows spinner while loading', () => {
    render(
      <SectionCard title="Downloads" isLoading={true}>
        <p>content</p>
      </SectionCard>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('announces loading with an accessible status', () => {
    render(
      <SectionCard title="Downloads" isLoading={true}>
        <p>content</p>
      </SectionCard>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('shows error banner when error is provided', () => {
    render(
      <SectionCard title="GitHub" isLoading={false} error={new Error('rate limit exceeded')}>
        <p>content</p>
      </SectionCard>,
    );
    expect(screen.getByText('rate limit exceeded')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('renders children when loaded with no error', () => {
    render(
      <SectionCard title="Bundle size" isLoading={false}>
        <p>4.2 kB</p>
      </SectionCard>,
    );
    expect(screen.getByText('4.2 kB')).toBeInTheDocument();
  });
});
