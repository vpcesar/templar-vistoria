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
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SortableRoom {
  id: string;
  name: string;
}

interface Props {
  items: SortableRoom[];
  onChange: (next: SortableRoom[]) => void;
}

export function SortableRoomList({ items, onChange }: Props) {
  const [newRoom, setNewRoom] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const rename = (id: string, val: string) => {
    onChange(items.map((r) => (r.id === id ? { ...r, name: val } : r)));
  };
  const remove = (id: string) => {
    onChange(items.filter((r) => r.id !== id));
  };
  const add = () => {
    const n = newRoom.trim();
    if (!n) return;
    onChange([...items, { id: `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: n }]);
    setNewRoom("");
  };
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((r) => r.id === active.id);
    const to = items.findIndex((r) => r.id === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(items, from, to));
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 mb-4">
            {items.map((r) => (
              <SortableItem key={r.id} room={r} onRename={rename} onRemove={remove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex gap-2">
        <Input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="Ex: Suíte, Corredor, Lavabo…"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
    </div>
  );
}

function SortableItem({
  room,
  onRename,
  onRemove,
}: {
  room: SortableRoom;
  onRename: (id: string, val: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: room.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md bg-white border border-border p-1"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground touch-none"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        value={room.name}
        onChange={(e) => onRename(room.id, e.target.value)}
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(room.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
