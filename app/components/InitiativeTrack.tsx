import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type ReactNode } from "react";
import { getEnemy } from "~/lib/enemies";
import { useGame } from "~/store/GameProvider";
import type { InitiativeItem } from "~/types";
import { AdventurerPicker } from "./AdventurerPicker";
import { ChevronIcon, GripIcon } from "./icons";
import { EnemyGroupPicker } from "./EnemyGroupPicker";

/** Stable dnd-kit id per track entry; also the React key. */
function keyFor(item: InitiativeItem) {
  return item.kind === "adventurer" ? `a:${item.id}` : `g:${item.group}`;
}

export function InitiativeTrack({
  onOpenGroup,
  actions,
}: {
  onOpenGroup: (group: number) => void;
  /** Page-level controls for the right of the action row, e.g. a link out. */
  actions?: ReactNode;
}) {
  const { state, dispatch, reset } = useGame();
  const [playerPickerOpen, setPlayerPickerOpen] = useState(false);
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);

  /**
   * Only the grip starts a drag, so the card body stays an ordinary button and needs
   * no activation constraint to protect its click. A small distance threshold is kept
   * so a slightly shaky press on the grip itself is not read as a drag.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = state.initiative.map(keyFor);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    dispatch({ type: "moveTrackItem", from, to });
  }

  return (
    <>
      <h2 className="bf-eyebrow border-b border-bf-edge pb-2 text-bf-kicker mb-3">Initiative Track</h2>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPlayerPickerOpen(true)}
          className="rounded border px-4 py-2 font-cond text-sm tracking-wide uppercase transition focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none border-bf-edge bg-bf-slate text-bf-bright hover:border-bf-cyan hover:text-bf-cyan"
        >
          Add Player
        </button>

        <button
          type="button"
          onClick={() => setGroupPickerOpen(true)}
          // Pink edge marks it as the hostile action, matching the group cards.
          className="rounded border px-4 py-2 font-cond text-sm tracking-wide uppercase transition focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none border-bf-pink-edge bg-bf-slate text-bf-bright hover:text-bf-kicker"
        >
          Add Enemy Group
        </button>

        {state.initiative.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch({ type: "shuffleTrack" })}
            className="rounded border px-4 py-2 font-cond text-sm tracking-wide uppercase transition focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none border-bf-edge bg-bf-slate text-bf-bright hover:border-bf-cyan hover:text-bf-cyan"
          >
            Shuffle
          </button>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {actions}

          {state.initiative.length > 0 && (
            <button
              type="button"
              onClick={reset}
              title="Remove every explorer and hostile"
              className="rounded border px-4 py-2 font-cond text-sm tracking-wide uppercase transition focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none border-bf-edge text-bf-muted hover:border-bf-cyan hover:text-bf-cyan"
            >
              Clear arena
            </button>
          )}
        </div>
      </div>

      <AdventurerPicker
        open={playerPickerOpen}
        onClose={() => setPlayerPickerOpen(false)}
      />
      <EnemyGroupPicker
        open={groupPickerOpen}
        onClose={() => setGroupPickerOpen(false)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* rectSortingStrategy, not the horizontal one: the track wraps onto rows. */}
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="flex w-full flex-row flex-wrap justify-start">
            {state.initiative.length === 0 && (
              <p className="p-2 text-bf-muted">
                Nobody on the track yet — use Add Player or Add Enemy Group to
                begin.
              </p>
            )}

            {state.initiative.map((item, index) => (
              <TrackCard
                key={keyFor(item)}
                id={keyFor(item)}
                item={item}
                position={index + 1}
                total={state.initiative.length}
                onOpen={
                  item.kind === "group" ? () => onOpenGroup(item.group) : null
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}

function TrackCard({
  id,
  item,
  position,
  total,
  onOpen,
}: {
  id: string;
  item: InitiativeItem;
  position: number;
  total: number;
  onOpen: (() => void) | null;
}) {
  const { state } = useGame();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const isEnemy = item.kind === "group";
  const group = isEnemy ? state.groups[item.group]! : null;
  const label = isEnemy ? group!.name : item.id;

  return (
    <div
      ref={setNodeRef}
      data-track-item={id}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`m-1.5 flex min-h-[70px] max-w-[160px] flex-1 basis-[160px] rounded border ${
        isEnemy ? "border-bf-pink-edge" : "border-bf-cyan/50"
      } ${isDragging ? "z-10 opacity-90 ring-2 ring-bf-cyan" : ""}`}
    >
      <div
        className={`m-1.5 flex min-w-0 flex-1 flex-col rounded ${
          isEnemy ? "bf-gradient-enemy" : "bf-gradient-blue"
        } ${isDragging ? "bg-[#449498] bg-none" : ""}`}
      >
        {/*
          The badge and grip share a thin top row so the name gets the card's full
          width on the line below. Competing with them inline left too little room:
          long names like "Amallyn Shadowguide" broke mid-word, and widening the card
          enough to fix that dropped a phone to one card per row.
        */}
        <div className="flex items-center justify-between gap-1 px-1.5 pt-1.5">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/40 text-[0.7rem] tabular-nums text-white/80"
          >
            {position}
          </span>

          {/*
            The only drag activator. touch-action: none belongs here rather than on the
            whole card, so swiping the card body still scrolls the page.
          */}
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            type="button"
            aria-label={`Reorder ${label}, position ${position} of ${total}`}
            title="Drag to reorder"
            className={`touch-none rounded p-0.5 text-white/50 outline-none transition hover:bg-black/25 hover:text-white focus-visible:ring-2 focus-visible:ring-bf-cyan ${
              isDragging ? "cursor-grabbing text-white" : "cursor-grab"
            }`}
          >
            <GripIcon />
          </button>
        </div>

        <h4 className="px-1.5 pt-0.5 font-cond text-sm leading-tight wrap-anywhere text-bf-bright">
          {label}
        </h4>

        {onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            className="flex flex-1 cursor-pointer flex-col rounded-b-[10px] px-1.5 pb-1.5 text-left outline-none hover:bg-black/15 focus-visible:ring-2 focus-visible:ring-bf-cyan"
          >
            {group!.members.map((member) => (
              <span key={member.instanceId} className="block text-[0.7rem]">
                {getEnemy(member.enemyId).name}
              </span>
            ))}
            <span className="mt-auto inline-flex items-center gap-0.5 pt-1 font-cond text-[0.65rem] tracking-wide uppercase text-bf-cyan">
              Roll behaviour
              <ChevronIcon />
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
