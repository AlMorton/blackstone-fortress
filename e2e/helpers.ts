import type { Page } from "@playwright/test";

export const TRACK_ITEM = "[data-track-item]";
/** The grip is the only drag activator; the rest of the card is a click target. */
export const GRIP = '[aria-label^="Reorder"]';

/** The position badges on the track, in DOM order. */
export async function trackPositions(page: Page): Promise<string[]> {
  return page.locator(`${TRACK_ITEM} span[aria-hidden="true"]`).allInnerTexts();
}

/** Names on the initiative track, in order. */
export async function trackOrder(page: Page): Promise<string[]> {
  return page.locator(`${TRACK_ITEM} h4`).allInnerTexts();
}

export async function gotoArena(page: Page) {
  await page.goto("./");
  // A stored arena from another spec would make ordering assertions meaningless.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Add Player" }).waitFor();
}

export async function addPlayers(page: Page, names: string[]) {
  await page.getByRole("button", { name: "Add Player" }).click();
  const dialog = page.getByRole("dialog");
  for (const name of names) {
    // The +/check glyph is aria-hidden, so the accessible name is just the name.
    await dialog.getByRole("button", { name, exact: true }).click();
  }
  await page.getByRole("button", { name: "OK" }).click();
  await dialog.waitFor({ state: "hidden" });
}

export async function addGroup(page: Page, enemies: string[]) {
  await page.getByRole("button", { name: "Add Enemy Group" }).click();
  const dialog = page.getByRole("dialog");
  for (const enemy of enemies) {
    await dialog
      .getByRole("button", { name: new RegExp(`^${escape(enemy)}`) })
      .click();
  }
  await page.getByRole("button", { name: "OK" }).click();
  await dialog.waitFor({ state: "hidden" });
}

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
}
