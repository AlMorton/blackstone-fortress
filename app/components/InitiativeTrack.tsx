import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { getEnemy } from "~/lib/enemies";
import { useGame } from "~/store/GameProvider";
import type { InitiativeItem } from "~/types";
import { AdventurerPicker } from "./AdventurerPicker";

export function InitiativeTrack() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);

  // Index of the card currently being dragged, for both pointer and mouse drag.
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  function commitMove(to: number | null) {
    if (dragIndex !== null && to !== null && to !== dragIndex) {
      dispatch({ type: "moveTrackItem", from: dragIndex, to });
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  /**
   * Pointer Events cover mouse, pen and touch in one code path. The Blazor version
   * used HTML5 drag events, which never fire on touch devices, plus a separate
   * two-tap fallback.
   */
  function handlePointerMove(event: React.PointerEvent) {
    if (dragIndex === null) return;
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-track-index]");
    setOverIndex(target ? Number(target.dataset.trackIndex) : null);
  }

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="bf-gradient-panel rounded-[10px] px-5 py-2.5 text-white transition hover:brightness-125"
        >
          Add Player
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
      </div>

      <AdventurerPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />

      <div
        ref={trackRef}
        className="flex w-full flex-row flex-wrap justify-start"
        onPointerMove={handlePointerMove}
        onPointerUp={() => commitMove(overIndex)}
        onPointerCancel={() => commitMove(null)}
      >
        {state.initiative.map((item, index) => (
          <TrackCard
            key={keyFor(item)}
            item={item}
            index={index}
            isDragging={dragIndex === index}
            isOver={overIndex === index && dragIndex !== null && dragIndex !== index}
            onGrab={() => setDragIndex(index)}
            onDragOver={() => setOverIndex(index)}
            onDrop={() => commitMove(index)}
            onOpen={() =>
              item.kind === "group" ? navigate(`/enemygroup/${item.group}`) : undefined
            }
          />
        ))}
      </div>
    </>
  );
}

function keyFor(item: InitiativeItem) {
  return item.kind === "adventurer" ? `a:${item.id}` : `g:${item.group}`;
}

function TrackCard({
  item,
  index,
  isDragging,
  isOver,
  onGrab,
  onDragOver,
  onDrop,
  onOpen,
}: {
  item: InitiativeItem;
  index: number;
  isDragging: boolean;
  isOver: boolean;
  onGrab: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onOpen: () => void;
}) {
  const { state } = useGame();
  const isEnemy = item.kind === "group";
  const group = isEnemy ? state.groups[item.group]! : null;

  return (
    <div
      data-track-index={index}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={`m-1.5 flex min-h-[70px] max-w-[150px] flex-1 basis-[150px] rounded-[10px] border ${
        isEnemy ? "border-bf-pink-edge" : "border-bf-green"
      } ${isOver ? "ring-2 ring-bf-cyan" : ""}`}
    >
      <div
        draggable
        onDragStart={onGrab}
        onDragEnd={onDrop}
        onPointerDown={(event) => {
          // Touch only: mouse drags are handled by the native HTML5 drag events above.
          if (event.pointerType !== "touch") return;
          event.currentTarget.releasePointerCapture(event.pointerId);
          onGrab();
        }}
        onClick={onOpen}
        className={`m-1.5 flex-1 touch-none rounded-[10px] p-1.5 ${
          isEnemy ? "bf-gradient-enemy cursor-pointer" : "bf-gradient-blue cursor-grab"
        } ${isDragging ? "cursor-grabbing bg-[#449498] bg-none" : ""}`}
      >
        <h4 className="text-base text-white">
          {item.kind === "adventurer" ? item.id : group!.name}
        </h4>

        {group?.members.map((member) => (
          <p key={member.instanceId} className="m-0 p-0 text-[0.7rem]">
            {getEnemy(member.enemyId).name}
          </p>
        ))}
      </div>
    </div>
  );
}
