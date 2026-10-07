import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButton";
import { moveItem } from "@/lib/actions/reorder";

const BTN =
  "rounded-full border border-border bg-bg px-2 py-1 text-xs font-bold text-secondary hover:bg-surface hover:text-ink";

/** Boutons ↑↓ pour réordonner une liste (table autorisée côté serveur). */
export function MoveButtons({ table, id }: { table: string; id: string }) {
  return (
    <ActionForm action={moveItem} successMessage="Ordre mis à jour." className="flex shrink-0 items-center gap-1">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <SubmitButton name="dir" value="up" title="Monter" aria-label="Monter" pendingLabel="…" className={BTN}>
        ↑
      </SubmitButton>
      <SubmitButton name="dir" value="down" title="Descendre" aria-label="Descendre" pendingLabel="…" className={BTN}>
        ↓
      </SubmitButton>
    </ActionForm>
  );
}
