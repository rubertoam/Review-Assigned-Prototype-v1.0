"use client";

/** ACE-backed shim — composable API maps to `DialogModal`. */

import * as React from "react";
import { useMemo } from "react";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import { cn } from "./utils";

type ParsedDialog = {
  contentClassName: string;
  title: string;
  description?: string;
  hideAceHeader: boolean;
  fitContent: boolean;
  /** Match Simulator–style shells with an explicit `h-[min(...)]` need a filled flex column, not `h-fit`. */
  hasFixedHeight: boolean;
  noPadding: boolean;
  body: React.ReactNode;
};

function childText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(childText).join("");
  if (React.isValidElement(node)) return childText(node.props.children);
  return "";
}

function isSrOnly(className?: string) {
  return String(className ?? "").includes("sr-only");
}

/** Stable across Vite HMR — reference equality on `child.type` can break after hot reload. */
function componentName(type: unknown): string | null {
  if (typeof type !== "function") return null;
  const fn = type as { displayName?: string; name?: string };
  return fn.displayName ?? fn.name ?? null;
}

function isComponentType(child: React.ReactElement, component: { displayName?: string; name?: string }) {
  return child.type === component || componentName(child.type) === componentName(component);
}

function extractHeaderInfo(headerEl: React.ReactElement) {
  let title = "";
  let description = "";
  let titleSrOnly = isSrOnly(headerEl.props.className);

  React.Children.forEach(headerEl.props.children, (child) => {
    if (!React.isValidElement(child)) return;
    if (isComponentType(child, DialogTitle)) {
      title = childText(child.props.children);
      titleSrOnly = isSrOnly(child.props.className) || titleSrOnly;
    }
    if (isComponentType(child, DialogDescription)) {
      description = childText(child.props.children);
    }
  });

  return { title, description, titleSrOnly };
}

function parseDialogChildren(children: React.ReactNode): ParsedDialog | null {
  const topLevel = React.Children.toArray(children);
  let contentEl: React.ReactElement | null = null;
  let outerHeader: React.ReactElement | null = null;

  for (const child of topLevel) {
    if (!React.isValidElement(child)) continue;
    if (isComponentType(child, DialogContent)) contentEl = child;
    if (isComponentType(child, DialogHeader)) outerHeader = child;
  }

  if (!contentEl) return null;

  const contentClassName = String(contentEl.props.className ?? "");
  const innerChildren = React.Children.toArray(contentEl.props.children);

  let title = "";
  let description = "";
  let titleSrOnly = false;
  let hasCustomHeader = false;

  if (outerHeader) {
    const info = extractHeaderInfo(outerHeader);
    title = info.title;
    description = info.description;
    titleSrOnly = info.titleSrOnly;
  }

  for (const child of innerChildren) {
    if (!React.isValidElement(child)) continue;
    if (isComponentType(child, DialogHeader)) {
      hasCustomHeader = true;
      const info = extractHeaderInfo(child);
      if (!title) title = info.title;
      if (!description) description = info.description;
      titleSrOnly = titleSrOnly || info.titleSrOnly;
    }
    if (isComponentType(child, DialogTitle)) {
      if (!title) title = childText(child.props.children);
      titleSrOnly = titleSrOnly || isSrOnly(child.props.className);
    }
    if (isComponentType(child, DialogDescription) && !description) {
      description = childText(child.props.children);
    }
  }

  const hideAceHeader = titleSrOnly || hasCustomHeader || outerHeader != null;
  const fitContent = /1200px|90vh|880px/i.test(contentClassName);
  const hasFixedHeight = /\bh-\[min\(/i.test(contentClassName);
  const noPadding = /\bp-0\b/.test(contentClassName);

  return {
    contentClassName,
    title: title || "Dialog",
    description: description || undefined,
    hideAceHeader,
    fitContent,
    hasFixedHeight,
    noPadding,
    body: contentEl.props.children,
  };
}

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const parsed = useMemo(() => parseDialogChildren(children), [children]);

  if (!parsed) return null;

  const {
    contentClassName,
    title,
    description,
    hideAceHeader,
    fitContent,
    hasFixedHeight,
    body,
    noPadding,
  } = parsed;

  const wideModal = fitContent || hasFixedHeight;

  return (
    <DialogModal
      open={open ?? false}
      onClose={() => onOpenChange?.(false)}
      title={title}
      description={description}
      size="lg"
      fitContent={hasFixedHeight ? false : fitContent}
      className={cn(
        contentClassName,
        hideAceHeader && "[&>div:first-child]:hidden",
        wideModal && "!max-w-[min(calc(100vw-2rem),1200px)]",
        hasFixedHeight &&
          "!h-[min(90vh,880px)] !max-h-[min(90vh,880px)] !gap-0 !overflow-hidden",
        "!border-[#cfd2d9] !bg-white shadow-[var(--ace-drop-shadow-xs)] dark:!border-[#38414a] dark:!bg-[#22272b]",
        noPadding && "!p-0",
      )}
      bodyClassName={cn(
        noPadding && "!mt-0 !p-0",
        hasFixedHeight && "!flex-1 !min-h-0 !gap-0 !overflow-hidden",
        hasFixedHeight &&
          "[&>div:last-child]:flex [&>div:last-child]:h-full [&>div:last-child]:min-h-0 [&>div:last-child]:flex-1 [&>div:last-child]:flex-col [&>div:last-child]:!pt-0",
        !hasFixedHeight && fitContent && "flex min-h-0 flex-col overflow-hidden",
        !hasFixedHeight && "[&>div:last-child]:min-h-0",
      )}
    >
      {body}
    </DialogModal>
  );
}
Dialog.displayName = "Dialog";

function DialogTrigger(_props: React.ComponentProps<"button">) {
  return null;
}
DialogTrigger.displayName = "DialogTrigger";

function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
DialogPortal.displayName = "DialogPortal";

function DialogClose(_props: React.ComponentProps<"button">) {
  return null;
}
DialogClose.displayName = "DialogClose";

function DialogOverlay(_props: React.ComponentProps<"div">) {
  return null;
}
DialogOverlay.displayName = "DialogOverlay";

function DialogContent({ children }: { children?: React.ReactNode; className?: string }) {
  return <>{children}</>;
}
DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={className} {...props} />;
}
DialogHeader.displayName = "DialogHeader";

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}
DialogFooter.displayName = "DialogFooter";

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}
DialogTitle.displayName = "DialogTitle";

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
