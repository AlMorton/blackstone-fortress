import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  GRIP,
  TRACK_ITEM,
  addGroup,
  addPlayers,
  gotoArena,
  trackOrder,
} from "./helpers";

/**
 * Real touch input, not page.mouse. Playwright's mouse API emits pointerType "mouse"
 * even in a touch-enabled context, which dnd-kit routes to the PointerSensor — so this
 * file is the only place the TouchSensor and its press-and-hold activation are covered.
 * Playwright's touchscreen API only taps, so drags go through CDP.
 *
 * There is deliberately no "a fast flick must not drag" test: CDP cannot dispatch a
 * burst inside the 180ms activation delay — the batch always lands after the drag has
 * already begun — and with touch-action: none a card never scrolls the page anyway, so
 * the only property that matters is that a tap does not drag, covered below.
 */
test.use({ hasTouch: true, viewport: { width: 412, height: 915 } });

async function touchDrag(
  page: Page,
  source: Locator,
  target: Locator,
  holdMs: number,
) {
  const cdp = await page.context().newCDPSession(page);
  const from = (await source.locator(GRIP).boundingBox())!;
  const to = (await target.boundingBox())!;
  const startX = from.x + from.width / 2;
  const startY = from.y + from.height / 2;
  const endX = to.x + to.width / 2;
  const endY = to.y + to.height / 2;

  const touch = (
    type: "touchStart" | "touchMove" | "touchEnd",
    x: number,
    y: number,
  ) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd" ? [] : [{ x, y, radiusX: 12, radiusY: 12 }],
    });

  await touch("touchStart", startX, startY);
  // The hold is what separates a drag from a tap.
  await page.waitForTimeout(holdMs);
  for (let step = 1; step <= 10; step++) {
    await touch(
      "touchMove",
      startX + ((endX - startX) * step) / 10,
      startY + ((endY - startY) * step) / 10,
    );
    await page.waitForTimeout(16);
  }
  await touch("touchEnd", endX, endY);
  await cdp.detach();
}

test.describe("initiative track on touch", () => {
  test.beforeEach(async ({ page }) => {
    await gotoArena(page);
    await addPlayers(page, ["Janus Drake", "Pious Vorne"]);
    await addGroup(page, ["Ur-Ghul"]);
    expect(await trackOrder(page)).toEqual([
      "Janus Drake",
      "Pious Vorne",
      "Group 1",
    ]);
  });

  test("press-and-hold then drag reorders", async ({ page }) => {
    const items = page.locator(TRACK_ITEM);
    await touchDrag(page, items.nth(0), items.nth(2), 250);
    await expect
      .poll(() => trackOrder(page))
      .toEqual(["Pious Vorne", "Group 1", "Janus Drake"]);
  });

  test("a tap still opens the group", async ({ page }) => {
    await page.locator(TRACK_ITEM).nth(2).getByText("Roll behaviour").tap();
    await expect(page).toHaveURL(/enemygroup\/1$/);
  });
});
