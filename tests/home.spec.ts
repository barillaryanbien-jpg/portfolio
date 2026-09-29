import { expect, test } from "@playwright/test";

test("homepage has intentional empty states, valid navigation, and no browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page).toHaveTitle("Ryan Bien N Barilla | Portfolio");
  await expect(page.locator("h1")).toHaveText("Ryan Bien N Barilla");
  await expect(page.locator("#projects, #skills, #contact")).toHaveCount(3);
  const aboutSection = page.locator("#about");
  if ((await aboutSection.count()) > 0) {
    await expect(aboutSection).toBeVisible();
  }
  await expect(page.locator(".project-placeholder, .project-card")).toHaveCount(3);
  const skillItems = page.locator(".skill-placeholder, .skill-card-item, .skill-card");
  await expect(skillItems).toHaveCount(12);
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  for (const href of await page
    .locator('a[href^="#"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")!))) {
    await expect(page.locator(href)).toHaveCount(1);
  }
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  expect(errors).toEqual([]);
});

for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  test(`layout fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    await expect(page.locator("h1")).toBeVisible();
    const heading = await page.locator("h1").boundingBox();
    const visual = await page.locator(".profile-visual").boundingBox();
    expect(heading).not.toBeNull();
    expect(visual).not.toBeNull();
    if (heading && visual)
      expect(
        width < 768
          ? heading.y + heading.height <= visual.y
          : heading.x + heading.width <= visual.x,
      ).toBeTruthy();
    await page.screenshot({
      animations: "disabled",
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  });
}

test("respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator(".hero-copy")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

test("mobile navigation opens, closes, and reaches the visible sections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByLabel("Toggle navigation");
  await toggle.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Projects" })
    .click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator(".mobile-menu")).not.toHaveAttribute("open");
  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(page.locator(".mobile-menu")).not.toHaveAttribute("open");
  await page.getByRole("link", { name: "Let’s talk" }).click();
  await expect(page).toHaveURL(/#contact$/);
});

test("fonts load locally without Google Fonts requests", async ({ page }) => {
  const externalFontRequests: string[] = [];
  page.on("request", (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) {
      externalFontRequests.push(request.url());
    }
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const loadedFonts = await page.evaluate(
    () =>
      Array.from(document.fonts).filter((font) => font.status === "loaded")
        .length,
  );
  expect(loadedFonts).toBeGreaterThanOrEqual(2);
  expect(externalFontRequests).toEqual([]);
});
