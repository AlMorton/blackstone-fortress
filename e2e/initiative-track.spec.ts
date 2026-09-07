import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  GRIP,
  TRACK_ITEM,
  addGroup,
  addPlayers,
  gotoArena,
  trackOrder,
  trackPositions,
} from "./helpers";

/**
 * Drags with explicit intermediate mouse moves. dnd-kit's PointerSensor only activates
 * after 8px of travel, and needs more than one move event to compute a translation, so
 * locator.dragTo() is not reliable here.
 */
async function dragTo(page: Page, source: Locator, target: Locator) {
  const from = (await source.locator(GRIP).boundingBox())!;
  const to = (await target.boundingBox())!;
  const startX = from.x + from.width / 2;
  const startY = from.y + from.height / 2;
  const endX = to.x + to.width / 2;
  const endY = to.y + to.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let step = 1; step <= 10; step++) {
    await page.mouse.move(
      startX + ((endX - startX) * step) / 10,
      startY + ((endY - startY) * step) / 10,
    );
  }
  await page.mouse.up();
}

test.describe("initiative track reordering", () => {
  test.beforeEach(async ({ page }) => {
    await gotoArena(page);
    await addPlayers(page, ["Janus Drake", "Pious Vorne"]);
    await addGroup(page, ["Ur-Ghul"]);
    await expect(page.locator(TRACK_ITEM)).toHaveCount(3);
    expect(await trackOrder(page)).toEqual([
      "Janus Drake",
      "Pious Vorne",
      "Group 1",
    ]);
  });

  test("drags a card to a later position", async ({ page }) => {
    const items = page.locator(TRACK_ITEM);
    await dragTo(page, items.nth(0), items.nth(2));
    await expect
      .poll(() => trackOrder(page))
      .toEqual(["Pious Vorne", "Group 1", "Janus Drake"]);
  });

  test("drags a card back to an earlier position", async ({ page }) => {
    const items = page.locator(TRACK_ITEM);
    await dragTo(page, items.nth(2), items.nth(0));
    await expect
      .poll(() => trackOrder(page))
      .toEqual(["Group 1", "Janus Drake", "Pious Vorne"]);
  });

  test("a plain click still opens a group instead of dragging", async ({
    page,
  }) => {
    // The regression this guards: an activation constraint too loose swallows clicks.
    await page.locator(TRACK_ITEM).nth(2).getByText("Roll behaviour").click();
    await expect(page).toHaveURL(/enemygroup\/1$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Group 1");
  });

  test("reorders with the keyboard", async ({ page }) => {
    /**
     * Waits on dnd-kit's own live-region announcements between keystrokes rather than
     * sleeping. It measures drop targets asynchronously after the lift, so an arrow
     * key sent in the same tick is silently ignored.
     */
    const announcements = page.locator('[aria-live="assertive"]');
    const items = page.locator(TRACK_ITEM);
    const handle = items.locator(GRIP).first();

    /**
     * The arrow depends on the layout, not the test's preference: the track wraps, so
     * a narrow viewport stacks the cards and sortableKeyboardCoordinates then moves on
     * the vertical axis. Hardcoding ArrowRight made this test fail for an unrelated
     * card-width change.
     */
    const [first, second] = await Promise.all([
      items.nth(0).boundingBox(),
      items.nth(1).boundingBox(),
    ]);
    const sameRow = Math.abs(first!.y - second!.y) < 4;
    const forward = sameRow ? "ArrowRight" : "ArrowDown";

    await handle.focus();
    await page.keyboard.press("Space");
    await expect(announcements).toContainText("droppable area a:Janus Drake.");

    /**
     * Re-presses only while the card is still over itself, i.e. nothing has moved yet.
     * That covers the arrow being swallowed before measuring finishes without ever
     * overshooting, since the retry stops the moment the card moves anywhere.
     */
    await expect
      .poll(async () => {
        const text = await announcements.innerText();
        if (text.includes("droppable area a:Janus Drake.")) {
          await page.keyboard.press(forward);
        }
        return announcements.innerText();
      })
      .toContain("droppable area a:Pious Vorne.");

    await page.keyboard.press("Space");
    await expect
      .poll(() => trackOrder(page))
      .toEqual(["Pious Vorne", "Janus Drake", "Group 1"]);
  });

  test("a reordered track survives a reload", async ({ page }) => {
    const items = page.locator(TRACK_ITEM);
    await dragTo(page, items.nth(0), items.nth(2));
    await expect
      .poll(() => trackOrder(page))
      .toEqual(["Pious Vorne", "Group 1", "Janus Drake"]);

    await page.reload();
    await expect(page.locator(TRACK_ITEM)).toHaveCount(3);
    expect(await trackOrder(page)).toEqual([
      "Pious Vorne",
      "Group 1",
      "Janus Drake",
    ]);
  });

  test("shuffle keeps every entry", async ({ page }) => {
    await page.getByRole("button", { name: "Shuffle" }).click();
    await expect(page.locator(TRACK_ITEM)).toHaveCount(3);
    expect((await trackOrder(page)).sort()).toEqual(
      ["Group 1", "Janus Drake", "Pious Vorne"].sort(),
    );
  });
});

test.describe("the track states its order", () => {
  test("numbers every entry from 1", async ({ page }) => {
    await gotoArena(page);
    await addPlayers(page, ["Janus Drake", "Pious Vorne"]);
    await addGroup(page, ["Ur-Ghul"]);
    expect(await trackPositions(page)).toEqual(["1", "2", "3"]);
  });

  test("renumbers after a drag, so the badges match the real order", async ({
    page,
  }) => {
    // The valuable assertion: proves the numbers track state, not just DOM movement.
    await gotoArena(page);
    await addPlayers(page, ["Janus Drake", "Pious Vorne"]);
    await addGroup(page, ["Ur-Ghul"]);

    const items = page.locator(TRACK_ITEM);
    await dragTo(page, items.nth(0), items.nth(2));

    await expect
      .poll(() => trackOrder(page))
      .toEqual(["Pious Vorne", "Group 1", "Janus Drake"]);
    expect(await trackPositions(page)).toEqual(["1", "2", "3"]);

    // Janus Drake moved to the end, so its grip must now announce position 3.
    await expect(items.nth(2).locator(GRIP)).toHaveAttribute(
      "aria-label",
      "Reorder Janus Drake, position 3 of 3",
    );
  });

  test("prompts when the track is empty", async ({ page }) => {
    await gotoArena(page);
    const prompt = page.getByText("Nobody on the track yet");
    await expect(prompt).toBeVisible();

    await addPlayers(page, ["Pious Vorne"]);
    await expect(prompt).toBeHidden();

    await page.getByRole("button", { name: "Clear arena" }).click();
    await expect(prompt).toBeVisible();
  });

  test("names the section", async ({ page }) => {
    await gotoArena(page);
    await expect(
      page.getByRole("heading", { name: "Initiative Track" }),
    ).toBeVisible();
  });
});
