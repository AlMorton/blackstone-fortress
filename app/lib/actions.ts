import raw from "../data/enemy-actions.json";

interface RawActionGroup {
  Enemy: string;
  Actions: Array<{ Name: string; Description: string }>;
}

/**
 * Flattened name -> rules text, mirroring ActionsService.cs. First definition wins,
 * so an enemy-specific entry only applies if it appears before the shared "All" set.
 */
export const actionDescriptions: ReadonlyMap<string, string> = new Map(
  (raw as RawActionGroup[])
    .flatMap((group) => group.Actions)
    .map((action) => [action.Name, action.Description] as const)
    .reverse(),
);

export function describeAction(name: string | undefined): string {
  if (!name) return "";
  return actionDescriptions.get(name) ?? "";
}
