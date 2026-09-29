import { test, expect } from "@playwright/test";
import { schemas } from "../src/lib/admin/schema";
import {
  saveCertificateFallback,
  readCertificatesFallback,
  deleteCertificateFallback,
} from "../src/lib/admin/certificates-storage";

test.describe("Certifications System", () => {
  test("certificate validation schema accepts simplified payload without legacy fields", () => {
    // Exact simplified payload submitted by the new form
    const simplifiedPayload = {
      title: "Full-Stack Web Development Certificate",
      issue_date: "2024",
      certificate_image_path: "385f6f87-c311-408f-8d72-3e0e7a17730e/certificates/b8cf7b32-8df2-4ce0-a299-a86fa887ffb0.webp",
      certificate_image_public_id: "portfolio/certificates/test-certificate",
      sort_order: 1,
      is_visible: true,
    };

    const result = schemas.certificates.safeParse(simplifiedPayload);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Full-Stack Web Development Certificate");
      expect(result.data.issue_date).toBe("2024");
      expect(result.data.certificate_image_path).toBe(
        "385f6f87-c311-408f-8d72-3e0e7a17730e/certificates/b8cf7b32-8df2-4ce0-a299-a86fa887ffb0.webp"
      );
      expect(result.data.certificate_image_public_id).toBe(
        "portfolio/certificates/test-certificate",
      );
      expect(result.data.sort_order).toBe(1);
      expect(result.data.is_visible).toBe(true);
    }

    // Rejects empty title
    const invalidTitleResult = schemas.certificates.safeParse({
      ...simplifiedPayload,
      title: "",
    });
    expect(invalidTitleResult.success).toBe(false);
  });

  test("certificate storage fallback can create, read, update, and delete without legacy fields", () => {
    const created = saveCertificateFallback({
      title: "Playwright Test Certificate",
      issue_date: "Aug 2024",
      certificate_image_path: "385f6f87-c311-408f-8d72-3e0e7a17730e/certificates/b8cf7b32-8df2-4ce0-a299-a86fa887ffb0.webp",
      certificate_image_public_id: "portfolio/certificates/test-certificate",
      sort_order: 1,
      is_visible: true,
    });

    expect(created.id).toBeTruthy();
    expect(created.title).toBe("Playwright Test Certificate");
    expect(created.issue_date).toBe("Aug 2024");

    // Read back
    const list = readCertificatesFallback();
    const found = list.find((c) => c.id === created.id);
    expect(found).toBeDefined();
    expect(found?.certificate_image_public_id).toBe(
      "portfolio/certificates/test-certificate",
    );

    // Update
    const updated = saveCertificateFallback({
      id: created.id,
      title: "Updated Certificate Title",
      issue_date: "Sep 2024",
      sort_order: 2,
      is_visible: true,
    });
    expect(updated.title).toBe("Updated Certificate Title");

    // Delete
    deleteCertificateFallback(created.id);
    const afterDelete = readCertificatesFallback();
    expect(afterDelete.find((c) => c.id === created.id)).toBeUndefined();
  });

  test("dedicated /certificates page shows the correct certificate state", async ({
    page,
  }) => {
    await page.goto("/certificates");
    await expect(page).toHaveTitle(/Certificates & Credentials \| Ryan Bien N Barilla/);

    // Back link
    const backLink = page.locator(".cert-back-link");
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/#about");

    const emptyState = page.locator(".cert-empty-state");
    if ((await emptyState.count()) > 0) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator(".cert-empty-title")).toHaveText("No certificates found");
    } else {
      await expect(page.locator(".cert-public-card").first()).toBeVisible();
      await expect(page.locator(".cert-public-title").first()).not.toBeEmpty();
    }
  });

  test("unauthenticated access to /admin/certificates redirects to /admin/login", async ({
    page,
  }) => {
    await page.goto("/admin/certificates");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  const viewports = [320, 375, 430, 768, 1024, 1280];
  for (const width of viewports) {
    test(`homepage and certificates page fit at ${width}px without horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });

      // Homepage
      await page.goto("/");
      let hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasOverflow).toBe(false);

      // Certificates page
      await page.goto("/certificates");
      hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasOverflow).toBe(false);
    });
  }
});
