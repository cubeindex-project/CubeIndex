import { describe, test, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import Page from "./+page.svelte";

describe("/home/+page.svelte", () => {
  test("should render heading", () => {
    render(Page, { data: { user: { email: "test@example.com" } } });
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
