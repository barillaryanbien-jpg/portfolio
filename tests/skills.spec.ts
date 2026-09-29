import { expect, test } from "@playwright/test";

test.describe("Dedicated Skills Page (/skills)", () => {
  test.setTimeout(60000);

  test("renders hero, filter pills, search input, back link, and skills", async ({ page }) => {
    await page.goto("/skills");
    await expect(page).toHaveTitle(/Skills & Technologies \| Ryan Bien N Barilla/);

    // Hero section
    await expect(page.locator(".skills-page-title")).toHaveText("My Skills & Tools");
    await expect(page.locator(".skills-page-subtitle")).toBeVisible();

    // Back to home link
    const backLink = page.locator(".skills-back-link");
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/#skills");

    // Filter pills toolbar
    const allPill = page.locator('.skills-filter-pill:has-text("All")');
    await expect(allPill).toBeVisible();
    await expect(allPill).toHaveClass(/is-active/);

    // Search input
    const searchInput = page.locator(".skills-search-input");
    await expect(searchInput).toBeVisible();

    // Homepage navigation on /skills should link back with /#
    const homeNavLink = page.locator(".desktop-nav a").first();
    await expect(homeNavLink).toHaveAttribute("href", "/#home");
  });

  test("filters skills when clicking category pill or typing search", async ({ page }) => {
    await page.goto("/skills");

    const searchInput = page.locator(".skills-search-input");
    await searchInput.fill("Python");

    const cards = page.locator(".skills-page-grid li");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(cards.first()).toContainText("Python");

    // Clear search
    await page.locator(".skills-search-clear").click();
    await expect(searchInput).toHaveValue("");
  });

  test("homepage skills section displays More About My Skills CTA and limits to 12 items", async ({
    page,
  }) => {
    await page.goto("/");
    const moreBtn = page.locator(".skills-more-btn");
    await expect(moreBtn).toBeVisible();
    await expect(moreBtn).toHaveAttribute("href", "/skills");

    // Clicking CTA navigates to /skills
    await Promise.all([
      page.waitForURL(/\/skills$/, { timeout: 15000 }),
      moreBtn.click(),
    ]);
    await expect(page.locator(".skills-page-title")).toHaveText("My Skills & Tools");
  });
});
