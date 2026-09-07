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
import { useState } from "react";
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
}: {
  onOpenGroup: (group: number) => void;
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
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPlayerPickerOpen(true)}
          className="bf-gradient-panel rounded-[10px] px-5 py-2.5 text-white transition hover:brightness-125"
        >
          Add Player
        </button>

        <button
          type="button"
          onClick={() => setGroupPickerOpen(true)}
          // Matches the enemy group cards on the track: pink gradient, pink edge.
          className="bf-gradient-enemy rounded-[10px] border border-bf-pink-edge px-5 py-2.5 text-white transition hover:brightness-125"
        >
          Add Enemy Group
        </button>

        {state.initiative.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch({ type: "shuffleTrack" })}
            className="bf-gradient-blue rounded-[10px] px-5 py-2.5 text-white transition hover:brightness-125"
          >
            Shuffle
          </button>
        )}

        {state.initiative.length > 0 && (
          <button
            type="button"
            onClick={reset}
            title="Remove every explorer and hostile"
            className="ml-auto rounded-[10px] border border-white/20 px-4 py-2.5 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Clear arena
          </button>
        )}
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
            {state.initiative.map((item) => (
              <TrackCard
                key={keyFor(item)}
                id={keyFor(item)}
                item={item}
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
  onOpen,
}: {
  id: string;
  item: InitiativeItem;
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
      className={`m-1.5 flex min-h-[70px] max-w-[150px] flex-1 basis-[150px] rounded-[10px] border ${
        isEnemy ? "border-bf-pink-edge" : "border-bf-green"
      } ${isDragging ? "z-10 opacity-90 ring-2 ring-bf-cyan" : ""}`}
    >
      <div
        className={`m-1.5 flex flex-1 flex-col rounded-[10px] ${
          isEnemy ? "bf-gradient-enemy" : "bf-gradient-blue"
        } ${isDragging ? "bg-[#449498] bg-none" : ""}`}
      >
        <div className="flex items-start gap-1 p-1.5 pb-0">
          <h4 className="flex-1 text-base text-white">{label}</h4>

          {/*
            The only drag activator. touch-action: none belongs here rather than on the
            whole card, so swiping the card body still scrolls the page.
          */}
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            type="button"
            aria-label={`Reorder ${label}`}
            title="Drag to reorder"
            className={`touch-none rounded p-0.5 text-white/50 outline-none transition hover:bg-black/25 hover:text-white focus-visible:ring-2 focus-visible:ring-bf-cyan ${
              isDragging ? "cursor-grabbing text-white" : "cursor-grab"
            }`}
          >
            <GripIcon />
          </button>
        </div>

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
            <span className="mt-auto inline-flex items-center gap-0.5 pt-1 text-[0.7rem] text-bf-cyan">
              Roll behaviour
              <ChevronIcon />
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
