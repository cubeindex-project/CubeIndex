import { describe, test, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import Page from "./(public)/+page.svelte";

describe("/+page.svelte", () => {
  test("should render h1", () => {
    const data = { totalCubes: 0, totalUsers: 0, achievements: [] };
    render(Page, { data });
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
