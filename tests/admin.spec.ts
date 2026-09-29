import { expect, test } from "@playwright/test";
import { schemas, slugify, contactMessageSubmissionSchema } from "../src/lib/admin/schema";

test("unauthenticated visitors cannot access any admin editor", async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const path of [
    "/admin",
    "/admin/messages",
    "/admin/profile",
    "/admin/projects",
    "/admin/projects/new",
    "/admin/skills",
    "/admin/about",
    "/admin/contact",
    "/admin/socials",
    "/admin/settings",
    "/admin/statistics",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(
      page.getByRole("heading", { name: "Welcome back." }),
    ).toBeVisible();
  }
});

for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  test(`admin login remains usable at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/admin/login");
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/admin-login-${width}.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}

test("validation rejects unsafe URLs, duplicate technologies, invalid order, and malformed slugs", () => {
  expect(
    schemas.socials.safeParse({
      platform: "Test",
      url: "javascript:alert(1)",
      username: "",
      sort_order: 0,
      is_visible: true,
    }).success,
  ).toBe(false);
  expect(
    schemas.skills.safeParse({
      name: "",
      icon: "",
      icon_path: "",
      category: "",
      sort_order: -1,
      is_visible: true,
    }).success,
  ).toBe(false);
  const project = {
    title: "Test",
    slug: "test",
    category: "",
    short_description: "",
    full_description: "",
    cover_image_path: "",
    live_url: "",
    repository_url: "",
    featured: false,
    is_published: false,
    sort_order: 0,
    technologies: [],
  };
  expect(schemas.projects.safeParse(project).success).toBe(true);
  expect(
    schemas.projects.safeParse({ ...project, slug: "Bad slug!" }).success,
  ).toBe(false);
  expect(
    schemas.projects.safeParse({ ...project, technologies: ["Tag", "tag"] })
      .success,
  ).toBe(false);
  expect(slugify(" My First Project! ")).toBe("my-first-project");

  expect(
    contactMessageSubmissionSchema.safeParse({
      name: "",
      email: "invalid-email",
      subject: "",
      message: "",
    }).success,
  ).toBe(false);

  expect(
    contactMessageSubmissionSchema.safeParse({
      name: "Juan dela Cruz",
      email: "juan@example.com",
      subject: "Collaboration Opportunity",
      message: "Hello Ryan, I would like to discuss a project with you.",
    }).success,
  ).toBe(true);
});
