import { AceInputField } from "@ace-ds/components/atoms/AceInputField";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import {
  GroupFormDialog,
  type GroupFormDialogItem,
  type GroupFormDialogMode,
} from "@ace-ds/components/organisms/AceSidebar/GroupFormDialog";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import type { SidebarDeleteTarget } from "../lib/useSidebarGroupActions";
import { cn } from "./ui/utils";

const footerBtnClass = cn(
  aceTypography(ACE_TYPE.p1Bold),
  "inline-flex items-center justify-center rounded-[var(--dialog-modal-btn-radius)] px-4 py-2",
);

type GroupFormState = {
  mode: GroupFormDialogMode;
  draftName: string;
  items: GroupFormDialogItem[];
  contextLabel: string;
};

type SidebarGroupActionModalsProps = {
  groupForm: GroupFormState | null;
  onGroupNameChange: (name: string) => void;
  onToggleItemRemoval: (itemId: string) => void;
  onCloseGroupForm: () => void;
  onSubmitGroupForm: () => void;
  groupFormPrimaryDisabled: boolean;
  deleteTarget: SidebarDeleteTarget | null;
  deleteConfirmText: string;
  onDeleteConfirmTextChange: (value: string) => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
};

function titleCase(label: string) {
  return label.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function SidebarGroupActionModals({
  groupForm,
  onGroupNameChange,
  onToggleItemRemoval,
  onCloseGroupForm,
  onSubmitGroupForm,
  groupFormPrimaryDisabled,
  deleteTarget,
  deleteConfirmText,
  onDeleteConfirmTextChange,
  onCloseDelete,
  onConfirmDelete,
}: SidebarGroupActionModalsProps) {
  const deleteContext =
    deleteTarget?.kind === "item"
      ? deleteTarget.contextLabel.replace(/group|category/i, "item") || "item"
      : deleteTarget?.contextLabel || "group";

  return (
    <>
      {/*
        Edit/Copy use ACE GroupFormDialog (titles: Edit/Copy Group).
        Form state is scoped to the group that opened the menu.
        Delete uses DialogModal with page-specific entity labels.
      */}
      <GroupFormDialog
        mode={groupForm?.mode ?? "edit"}
        open={groupForm != null}
        onClose={onCloseGroupForm}
        groupName={groupForm?.draftName ?? ""}
        onGroupNameChange={onGroupNameChange}
        items={groupForm?.items ?? []}
        onToggleItemRemoval={onToggleItemRemoval}
        onPrimary={onSubmitGroupForm}
        primaryDisabled={groupFormPrimaryDisabled}
      />

      <DialogModal
        open={deleteTarget != null}
        onClose={onCloseDelete}
        title={`Delete ${titleCase(deleteContext)}`}
        description={
          deleteTarget ? (
            <>
              Type <strong className="font-semibold">delete</strong> to permanently remove this{" "}
              {deleteContext}:{" "}
              <strong className="font-semibold">{deleteTarget.label}</strong>.
            </>
          ) : null
        }
        size="md"
        footer={
          <div className="flex w-full flex-wrap items-center justify-end gap-[var(--dialog-modal-footer-btn-gap)]">
            <button
              type="button"
              onClick={onCloseDelete}
              className={cn(
                footerBtnClass,
                "border border-solid border-[var(--dialog-modal-outline-border)] bg-[var(--dialog-modal-surface)] text-[var(--dialog-modal-outline-text)] hover:bg-[var(--dialog-modal-outline-hover-bg)]",
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteConfirmText !== "delete"}
              onClick={onConfirmDelete}
              className={cn(
                footerBtnClass,
                "bg-[var(--dialog-modal-danger)] text-[var(--dialog-modal-on-primary)] hover:bg-[var(--dialog-modal-danger-hover)]",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              Delete
            </button>
          </div>
        }
      >
        <AceInputField
          id="sidebar-delete-confirm"
          label="Confirmation"
          value={deleteConfirmText}
          onChange={(event) => onDeleteConfirmTextChange(event.target.value)}
          placeholder="delete"
          autoComplete="off"
          fieldSize="md"
        />
      </DialogModal>
    </>
  );
}
