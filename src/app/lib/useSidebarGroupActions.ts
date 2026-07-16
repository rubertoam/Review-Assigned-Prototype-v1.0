import { useCallback, useMemo, useState } from "react";
import type {
  AceSidebarGroup,
  AceSidebarMenuAction,
} from "@ace-ds/components/organisms/AceSidebar/AceSidebar";
import type {
  GroupFormDialogItem,
  GroupFormDialogMode,
} from "@ace-ds/components/organisms/AceSidebar/GroupFormDialog";

export type SidebarGroupItemData = {
  id: string;
  label: string;
};

export type SidebarGroupData = {
  id: string;
  label: string;
  expanded: boolean;
  items: SidebarGroupItemData[];
};

export type SidebarDeleteTarget = {
  kind: "group" | "item";
  groupId: string;
  itemId?: string;
  label: string;
  /** Where the action was opened from, for contextual copy. */
  contextLabel: string;
};

type GroupFormState = {
  mode: GroupFormDialogMode;
  sourceGroupId: string;
  initialName: string;
  draftName: string;
  items: GroupFormDialogItem[];
  contextLabel: string;
};

function withCount(label: string, count: number) {
  return `${label} (${count})`;
}

export function useSidebarGroupActions(
  initialGroups: readonly SidebarGroupData[],
  options: {
    /** e.g. "dashboard group" or "report category" */
    contextLabel: string;
    initialSelectedItemId?: string;
    /** When false, group overflow Edit/Copy/Delete is omitted. Default true. */
    enableGroupMenus?: boolean;
    /** When false, group labels omit “(n)” counts. Default true. */
    showItemCounts?: boolean;
  },
) {
  const {
    contextLabel,
    initialSelectedItemId,
    enableGroupMenus = true,
    showItemCounts = true,
  } = options;
  const [groups, setGroups] = useState<SidebarGroupData[]>(() =>
    initialGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({ ...item })),
    })),
  );
  const [selectedItemId, setSelectedItemId] = useState(
    initialSelectedItemId ?? initialGroups[0]?.items[0]?.id ?? "",
  );
  const [groupForm, setGroupForm] = useState<GroupFormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SidebarDeleteTarget | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const openDeleteModal = useCallback((target: Omit<SidebarDeleteTarget, "contextLabel">) => {
    setDeleteTarget({ ...target, contextLabel });
    setDeleteConfirmText("");
  }, [contextLabel]);

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null);
    setDeleteConfirmText("");
  }, []);

  const openEditGroup = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;
      setGroupForm({
        mode: "edit",
        sourceGroupId: groupId,
        initialName: group.label,
        draftName: group.label,
        contextLabel,
        items: group.items.map((item) => ({
          id: item.id,
          label: item.label,
          markedForRemoval: false,
        })),
      });
    },
    [contextLabel, groups],
  );

  const openCopyGroup = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;
      const defaultName = `${group.label} Copy`;
      setGroupForm({
        mode: "copy",
        sourceGroupId: groupId,
        initialName: defaultName,
        draftName: defaultName,
        contextLabel,
        items: group.items.map((item) => ({
          id: item.id,
          label: item.label,
          markedForRemoval: false,
        })),
      });
    },
    [contextLabel, groups],
  );

  const closeGroupForm = useCallback(() => setGroupForm(null), []);

  const remainingItemCount =
    groupForm?.items.filter((item) => !item.markedForRemoval).length ?? 0;
  const groupFormPrimaryDisabled =
    groupForm == null ||
    !groupForm.draftName.trim() ||
    // Copy requires at least one item; edit may rename an empty group.
    (groupForm.mode === "copy" && remainingItemCount === 0) ||
    (groupForm.mode === "edit" &&
      groupForm.draftName.trim() === groupForm.initialName &&
      !groupForm.items.some((item) => item.markedForRemoval));

  const submitGroupForm = useCallback(() => {
    if (!groupForm || groupFormPrimaryDisabled) return;
    const trimmedName = groupForm.draftName.trim();
    const includedItems = groupForm.items.filter((item) => !item.markedForRemoval);

    if (groupForm.mode === "edit") {
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id !== groupForm.sourceGroupId) return g;
          return {
            ...g,
            label: trimmedName,
            items: includedItems.map((item) => ({ id: item.id, label: item.label })),
          };
        }),
      );
      if (!includedItems.some((item) => item.id === selectedItemId)) {
        setSelectedItemId(includedItems[0]?.id ?? "");
      }
    } else {
      const copyId = `group-${Date.now()}`;
      setGroups((prev) => [
        ...prev,
        {
          id: copyId,
          label: trimmedName,
          expanded: false,
          items: includedItems.map((item, index) => ({
            id: `${item.id}-copy-${copyId}-${index}`,
            label: item.label,
          })),
        },
      ]);
    }
    closeGroupForm();
  }, [closeGroupForm, groupForm, groupFormPrimaryDisabled, selectedItemId]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget || deleteConfirmText !== "delete") return;
    if (deleteTarget.kind === "group") {
      setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.groupId));
      const removed = groups.find((g) => g.id === deleteTarget.groupId);
      if (removed?.items.some((item) => item.id === selectedItemId)) {
        const fallback = groups.find((g) => g.id !== deleteTarget.groupId)?.items[0]?.id ?? "";
        setSelectedItemId(fallback);
      }
    } else if (deleteTarget.itemId) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === deleteTarget.groupId
            ? { ...g, items: g.items.filter((i) => i.id !== deleteTarget.itemId) }
            : g,
        ),
      );
      if (selectedItemId === deleteTarget.itemId) {
        const group = groups.find((g) => g.id === deleteTarget.groupId);
        const fallback =
          group?.items.find((i) => i.id !== deleteTarget.itemId)?.id ??
          groups.find((g) => g.id !== deleteTarget.groupId)?.items[0]?.id ??
          "";
        setSelectedItemId(fallback);
      }
    }
    closeDeleteModal();
  }, [closeDeleteModal, deleteConfirmText, deleteTarget, groups, selectedItemId]);

  const handleGroupMenuAction = useCallback(
    (action: AceSidebarMenuAction, groupId: string, label: string) => {
      if (action === "edit") {
        openEditGroup(groupId);
        return;
      }
      if (action === "copy") {
        openCopyGroup(groupId);
        return;
      }
      if (action === "delete") {
        openDeleteModal({ kind: "group", groupId, label });
      }
    },
    [openCopyGroup, openDeleteModal, openEditGroup],
  );

  const sidebarGroups: AceSidebarGroup[] = useMemo(
    () =>
      groups.map((group) => {
        const label = showItemCounts
          ? withCount(group.label, group.items.length)
          : group.label;
        return {
          id: group.id,
          label,
          expanded: group.expanded,
          onToggle: () =>
            setGroups((prev) =>
              prev.map((g) => (g.id === group.id ? { ...g, expanded: !g.expanded } : g)),
            ),
          ...(enableGroupMenus
            ? {
                onMenuAction: (action: AceSidebarMenuAction) =>
                  handleGroupMenuAction(action, group.id, label),
              }
            : {}),
          items: group.items.map((item) => ({
            id: item.id,
            label: item.label,
            selected: selectedItemId === item.id,
            onSelect: () => setSelectedItemId(item.id),
          })),
        };
      }),
    [enableGroupMenus, groups, handleGroupMenuAction, selectedItemId, showItemCounts],
  );

  const selectedItemLabel =
    groups.flatMap((g) => g.items).find((item) => item.id === selectedItemId)?.label ?? "";

  return {
    sidebarGroups,
    selectedItemId,
    selectedItemLabel,
    setSelectedItemId,
    groupForm,
    setGroupForm,
    closeGroupForm,
    submitGroupForm,
    groupFormPrimaryDisabled,
    deleteTarget,
    deleteConfirmText,
    setDeleteConfirmText,
    closeDeleteModal,
    confirmDelete,
  };
}
