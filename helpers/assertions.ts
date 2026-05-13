import { expect, Page, type Locator } from "@playwright/test";

export async function waitPastCloudflareIfAny(
  page: Page,
  timeout: number = 120000
): Promise<void> {
  const cfText = "Performing security verification";

  const cf = page.getByText(cfText);

  // Không có Cloudflare → thoát nhanh
  const isVisible = await cf.isVisible().catch(() => false);
  if (!isVisible) return;

  console.log("Cloudflare detected → waiting...");

  // Chia timeout (65% cho lần đầu)
  const firstPhase = Math.min(90000, Math.floor(timeout * 0.65));

  try {
    // chờ lần 1
    await expect(cf).toBeHidden({ timeout: firstPhase });
    return;
  } catch {
    console.log("Cloudflare still active → retry with reload...");

    // reload fallback
    await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});

    // chờ lần 2
    await expect(cf).toBeHidden({
      timeout: Math.max(15000, timeout - firstPhase),
    });
  }
}