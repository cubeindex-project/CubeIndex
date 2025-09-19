import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import FeatureSection from './FeatureSection.svelte';

describe('FeatureSection', () => {
  it('renders heading, description, highlights and image with alt', () => {
    render(FeatureSection, {
      props: {
        eyebrow: 'Explore',
        title: 'A Living Database of Cubes',
        description: 'Browse hundreds of models with rich details',
        highlights: ['Deep filters', 'Community ratings'],
        imageSrc: '/CI-desktop-cubes.webp',
        imageAlt: 'Screenshot of CubeIndex database listing with filters',
      }
    });

    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'A Living Database of Cubes', level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/rich details/i)).toBeInTheDocument();
    expect(screen.getByText('Deep filters')).toBeInTheDocument();
    expect(screen.getByAltText('Screenshot of CubeIndex database listing with filters')).toBeInTheDocument();
  });

  it('applies reverse ordering when reverse is true', () => {
    const { container } = render(FeatureSection, {
      props: {
        title: 'Reverse Layout',
        description: 'Testing reverse order',
        imageSrc: '/CI-mobile-cubes.webp',
        imageAlt: 'Mobile view of cube search and filtering',
        reverse: true
      }
    });

    const heading = screen.getByRole('heading', { name: 'Reverse Layout', level: 2 });
    const textWrapper = heading.parentElement as HTMLElement; // text container div
    expect(textWrapper.className).toContain('order-last');

    // Image wrapper should have order-first
    const fig = container.querySelector('figure')?.parentElement as HTMLElement;
    expect(fig.className).toContain('order-first');
  });
});
