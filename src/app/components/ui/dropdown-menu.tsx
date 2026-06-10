"use client";

/** ACE-backed shim — composable Radix API with ACE menu variants (compact overflow + primary). */

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRightIcon } from "lucide-react";
import { aceDropdownMenuPanelClass } from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { Checkbox } from "@ace-ds/components/atoms/Checkbox/Checkbox";
import { cn } from "./utils";

export type DropdownMenuPanelVariant = "default" | "compact" | "primary";

const DropdownMenuVariantContext = React.createContext<DropdownMenuPanelVariant>("default");

const itemType =
  "[font:var(--ace-type-paragraph-p1-regular)] [letter-spacing:var(--ace-type-paragraph-p1-regular-tracking)]";

const itemClass = cn(
  itemType,
  "relative flex cursor-pointer select-none items-center rounded-[var(--radius-sm)] text-[var(--screening-text-primary)] outline-none",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  "data-[highlighted]:bg-[var(--screening-surface-hover)] data-[highlighted]:text-[var(--screening-text-primary)]",
);

const compactItemClass = cn(itemClass, "px-3 py-1");

const defaultItemClass = cn(itemClass, "px-[var(--space-3)] py-[var(--space-2)]");

const primaryItemClass = cn(
  itemClass,
  "group gap-0 px-0 py-2",
);

const menuHeaderClass = cn(
  itemType,
  "px-[var(--space-3)] pb-[var(--space-2)] pt-[var(--space-3)] font-bold text-[var(--screening-text-primary)]",
);

const menuLabelClass =
  "[font:var(--ace-type-label-bold)] [letter-spacing:var(--ace-type-label-bold-tracking)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--screening-text-muted)]";

const checkboxRowClass = cn(
  itemType,
  "flex w-full cursor-pointer select-none items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--screening-text-primary)] outline-none",
  "data-[highlighted]:bg-[var(--screening-surface-hover)]",
);

function panelClassForVariant(variant: DropdownMenuPanelVariant, className?: string) {
  return cn(
    aceDropdownMenuPanelClass,
    "z-[250]",
    variant === "compact" && "w-[6.75rem] py-2 p-1",
    variant === "primary" && "w-[16.5rem] py-2 p-1",
    variant === "default" && "min-w-[11.5rem] p-1",
    className,
  );
}

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root modal={false} data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  variant?: DropdownMenuPanelVariant;
}) {
  return (
    <DropdownMenuVariantContext.Provider value={variant}>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          data-slot="dropdown-menu-content"
          sideOffset={sideOffset}
          collisionPadding={8}
          className={panelClassForVariant(variant, className)}
          {...props}
        />
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuVariantContext.Provider>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant: itemVariant = "default",
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  const panelVariant = React.useContext(DropdownMenuVariantContext);

  if (panelVariant === "primary") {
    return (
      <DropdownMenuPrimitive.Item
        data-slot="dropdown-menu-item"
        data-variant={itemVariant}
        className={cn(
          primaryItemClass,
          itemVariant === "destructive" && "text-[var(--dialog-modal-danger)]",
          className,
        )}
        {...props}
      >
        <span
          className="w-[3px] shrink-0 self-stretch bg-transparent group-data-[highlighted]:bg-[var(--ace-dropdown-menu-primary)]"
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate px-2">{children}</span>
      </DropdownMenuPrimitive.Item>
    );
  }

  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={itemVariant}
      className={cn(
        panelVariant === "compact" ? compactItemClass : defaultItemClass,
        inset && "pl-8",
        itemVariant === "destructive" &&
          "text-[var(--dialog-modal-danger)] data-[highlighted]:text-[var(--dialog-modal-danger)]",
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-checkbox-item"
      className={cn(checkboxRowClass, className)}
      onSelect={(event) => {
        event.preventDefault();
        onCheckedChange?.(checked === true ? false : true);
      }}
      {...props}
    >
      <Checkbox
        size="sm"
        checked={checked === true}
        tabIndex={-1}
        className="pointer-events-none"
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-left">{children}</span>
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  const panelVariant = React.useContext(DropdownMenuVariantContext);

  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        panelVariant === "compact" ? compactItemClass : defaultItemClass,
        "pl-8",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-3 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <span className="size-2 rounded-full bg-[var(--screening-primary)]" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  const panelVariant = React.useContext(DropdownMenuVariantContext);

  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        panelVariant === "primary" ? menuHeaderClass : menuLabelClass,
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("my-1 h-px bg-[var(--screening-border-row)]", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-[var(--screening-text-muted)]",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  const panelVariant = React.useContext(DropdownMenuVariantContext);

  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        panelVariant === "compact" ? compactItemClass : defaultItemClass,
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4 opacity-70" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> & {
  variant?: DropdownMenuPanelVariant;
}) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={panelClassForVariant(variant, className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
