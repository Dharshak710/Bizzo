import { useState } from "react";
import { useData } from "../context/DataContext";
import { Modal, ConfirmDialog, PageHeader, EmptyState } from "../components/ui";
import { Icons } from "../components/icons";
import { cn } from "../lib/utils";
import type { Category } from "../types";

const palette = ["#ec4899", "#f59e0b", "#10b981", "#6366f1", "#ef4444", "#14b8a6", "#8b5cf6", "#3b82f6", "#f97316", "#84cc16"];

export function Categories() {
  const { categories, items, addCategory, updateCategory, deleteCategory } = useData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const itemCount = (id: string) => items.filter((i) => i.categoryId === id).length;
  const unitCount = (id: string) => items.filter((i) => i.categoryId === id).reduce((s, i) => s + i.quantity, 0);

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Organize your inventory into categories."
        actions={
          <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Icons.plus className="h-4 w-4" /> Add Category
          </button>
        }
      />

      {categories.length === 0 ? (
        <div className="card"><EmptyState title="No categories yet" message="Create your first category to organize inventory." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg text-white" style={{ backgroundColor: c.color }}>
                    <Icons.tag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-400">{itemCount(c.id)} items · {unitCount(c.id)} units</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost !px-2 !py-1.5" onClick={() => { setEditing(c); setFormOpen(true); }}><Icons.edit className="h-4 w-4" /></button>
                  <button className="btn-ghost !px-2 !py-1.5 text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(c)}><Icons.trash className="h-4 w-4" /></button>
                </div>
              </div>
              {c.description && <p className="mt-3 text-sm text-slate-500">{c.description}</p>}
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <CategoryForm
          category={editing}
          onClose={() => setFormOpen(false)}
          onSave={(payload) => {
            if (editing) updateCategory(editing.id, payload);
            else addCategory(payload as Omit<Category, "id">);
            setFormOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category"
        message={`Delete "${deleteTarget?.name}"? Items in this category will remain but become uncategorized.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (deleteTarget) deleteCategory(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function CategoryForm({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (payload: Partial<Category>) => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [color, setColor] = useState(category?.color ?? palette[0]);

  const valid = name.trim().length > 0;

  return (
    <Modal
      open
      onClose={onClose}
      title={category ? "Edit Category" : "Add Category"}
      size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!valid} onClick={() => onSave({ name: name.trim(), description: description.trim(), color })}>
            {category ? "Save" : "Add"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Category name *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Decor" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2">
            {palette.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setColor(p)}
                className={cn("h-9 w-9 rounded-lg border-2 transition-transform", color === p ? "border-slate-800 scale-110" : "border-transparent")}
                style={{ backgroundColor: p }}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
