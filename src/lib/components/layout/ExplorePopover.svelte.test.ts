import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ExplorePopover from './ExplorePopover.svelte';

describe('ExplorePopover', () => {
  it('renders all cards with correct titles', () => {
    render(ExplorePopover);

    expect(screen.getByText('Cubes')).toBeInTheDocument();
    expect(screen.getByText('Accessories')).toBeInTheDocument();
    expect(screen.getByText('Vendors')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('links to available sections with correct hrefs', async () => {
    render(ExplorePopover);

    const cubes = screen.getByRole('menuitem', { name: /cubes/i });
    const vendors = screen.getByRole('menuitem', { name: /vendors/i });
    const users = screen.getByRole('menuitem', { name: /users/i });

    expect(cubes).toHaveAttribute('href', '/explore/cubes');
    expect(vendors).toHaveAttribute('href', '/explore/vendors');
    expect(users).toHaveAttribute('href', '/explore/users');
  });

  it('marks unavailable items as disabled and not links', () => {
    render(ExplorePopover);

    const accessories = screen.getByText('Accessories');
    // The disabled card is not an anchor and has aria-disabled
    const disabledTile = accessories.closest('[aria-disabled="true"]');
    expect(disabledTile).not.toBeNull();
  });
});
