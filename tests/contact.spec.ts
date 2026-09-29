import { expect, test } from "@playwright/test";

test.describe("Contact Section and Message Form", () => {
  test("contact section renders two-column layout with info and form", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/#contact");
    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeVisible();

    // Verify Section Headings
    await expect(contactSection.getByText("Let’s connect")).toBeVisible();
    await expect(contactSection.getByRole("heading", { name: "Contact Information" })).toBeVisible();
    await expect(contactSection.getByRole("heading", { name: "Send Me a Message" })).toBeVisible();

    // Verify Contact Info elements
    const infoCard = page.locator(".contact-info-card");
    await expect(infoCard).toBeVisible();
    await expect(infoCard.locator("a[href^='mailto:']")).toHaveCount(1);

    // Verify Form Fields
    const formCard = page.locator(".contact-form-card");
    await expect(formCard).toBeVisible();
    await expect(formCard.getByLabel(/Full Name/i)).toBeVisible();
    await expect(formCard.getByLabel(/Email Address/i)).toBeVisible();
    await expect(formCard.getByLabel(/Subject/i)).toBeVisible();
    await expect(formCard.getByLabel(/Message/i)).toBeVisible();
    await expect(formCard.getByRole("button", { name: "Send Message" })).toBeVisible();

    // Verify Client-Side Validation on Submit Empty
    await formCard.getByRole("button", { name: "Send Message" }).click();
    await expect(page.locator("#contact-name-error")).toBeVisible();
    await expect(page.locator("#contact-email-error")).toBeVisible();
    await expect(page.locator("#contact-subject-error")).toBeVisible();
    await expect(page.locator("#contact-message-error")).toBeVisible();

    // Verify Email Format Validation
    await formCard.getByLabel(/Full Name/i).fill("Test Visitor");
    await formCard.getByLabel(/Email Address/i).fill("not-an-email");
    await formCard.getByLabel(/Subject/i).fill("Project Inquiry");
    await formCard.getByLabel(/Message/i).fill("Hello, this is a test message.");
    await formCard.getByRole("button", { name: "Send Message" }).click();

    await expect(page.locator("#contact-email-error")).toContainText("valid email");

    expect(errors).toEqual([]);
  });

  for (const width of [375, 768, 1024, 1440]) {
    test(`contact layout fits at ${width}px without horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/#contact");
      await page.evaluate(() => document.fonts.ready);

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(hasOverflow).toBe(false);

      const contactSection = page.locator("#contact");
      await expect(contactSection).toBeVisible();
    });
  }
});
