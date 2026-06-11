"use client";

/** ACE-backed shim — field trigger + radio list (LabSelect pattern) via Radix. */

import * as React from "react";
import { useMemo } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "./utils";

type SelectItemConfig = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectConfig = {
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
  triggerSize?: "sm" | "default";
  placeholder?: string;
  items: SelectItemConfig[];
};

const fieldTriggerBase = cn(
  "inline-flex w-[var(--ace-dropdown-trigger-width)] max-w-[var(--ace-dropdown-trigger-width)] shrink-0 cursor-pointer items-center justify-between gap-[var(--space-2)] rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-strong)] bg-[var(--screening-surface)] font-semibold leading-[1.65] text-[var(--screening-text-primary)] outline-none transition-colors [font-family:var(--font-screening)]",
  "hover:bg-[var(--screening-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
  "data-[state=open]:bg-[var(--screening-surface-hover)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--screening-primary-ring)] data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-[var(--screening-primary-ring-offset)]",
  "disabled:pointer-events-none disabled:opacity-50",
);

const fieldSizeClass = {
  sm: "gap-[var(--ace-button-gap-sm)] px-[var(--ace-button-px-sm)] py-[var(--ace-button-py-sm)] text-xs",
  md: "gap-[var(--ace-button-gap-md)] px-[var(--ace-button-px-md)] py-[var(--ace-button-py-md)] text-sm",
} as const;

const selectPanelClass = cn(
  "z-[250] min-w-[11.5rem] overflow-hidden rounded-[4px] border border-solid p-1 shadow-[var(--ace-drop-shadow-xs)]",
  "border-[#cfd2d9] bg-white dark:border-[#38414a] dark:bg-[#22272b]",
);

const radioItemClass = cn(
  "[font:var(--ace-type-paragraph-p1-regular)] [letter-spacing:var(--ace-type-paragraph-p1-regular-tracking)]",
  "relative flex cursor-pointer select-none items-center rounded-[var(--radius-sm)] px-[var(--space-3)] py-[var(--space-2)] pl-8 text-[var(--screening-text-primary)] outline-none",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  "data-[highlighted]:bg-[var(--screening-surface-hover)] data-[highlighted]:text-[var(--screening-text-primary)]",
);

function childText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(childText).join("");
  if (React.isValidElement(node)) return childText(node.props.children);
  return "";
}

function componentName(type: unknown): string | null {
  if (typeof type !== "function") return null;
  const fn = type as { displayName?: string; name?: string };
  return fn.displayName ?? fn.name ?? null;
}

function isComponentType(
  child: React.ReactElement,
  component: { displayName?: string; name?: string },
) {
  return child.type === component || componentName(child.type) === componentName(component);
}

function collectSelectItems(node: React.ReactNode, items: SelectItemConfig[]) {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    if (isComponentType(child, SelectItem)) {
      items.push({
        value: String(child.props.value ?? ""),
        label: childText(child.props.children),
        disabled: child.props.disabled,
      });
      return;
    }
    if (isComponentType(child, SelectGroup)) {
      collectSelectItems(child.props.children, items);
    }
  });
}

function parseSelectChildren(children: React.ReactNode): SelectConfig {
  const config: SelectConfig = { items: [] };

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (isComponentType(child, SelectTrigger)) {
      config.triggerClassName = child.props.className;
      config.triggerStyle = child.props.style;
      config.triggerSize = child.props.size ?? "default";
      React.Children.forEach(child.props.children, (triggerChild) => {
        if (React.isValidElement(triggerChild) && isComponentType(triggerChild, SelectValue)) {
          config.placeholder = triggerChild.props.placeholder;
        }
      });
      return;
    }

    if (isComponentType(child, SelectContent)) {
      collectSelectItems(child.props.children, config.items);
    }
  });

  return config;
}

function Select({
  value,
  onValueChange,
  disabled,
  children,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const config = useMemo(() => parseSelectChildren(children), [children]);

  const selectedLabel = useMemo(() => {
    const match = config.items.find((item) => item.value === value);
    return match?.label ?? config.placeholder ?? "Select";
  }, [config.items, config.placeholder, value]);

  const fullWidth =
    config.triggerClassName?.includes("w-full") ||
    config.triggerClassName?.includes("max-w-full");

  const size = config.triggerSize === "sm" ? "sm" : "md";

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          type="button"
          style={config.triggerStyle}
          className={cn(
            fieldTriggerBase,
            fieldSizeClass[size],
            config.triggerClassName,
            fullWidth && "!w-full !max-w-full",
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{selectedLabel}</span>
          <ChevronDown className="ml-auto size-4 opacity-70" aria-hidden />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={selectPanelClass}
          align="start"
          sideOffset={4}
          collisionPadding={8}
        >
          <DropdownMenu.RadioGroup
            value={value ?? ""}
            onValueChange={(next) => onValueChange?.(next)}
            className="flex flex-col"
          >
            {config.items.map((item) => (
              <DropdownMenu.RadioItem
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                className={radioItemClass}
              >
                <span className="absolute left-2 top-1/2 size-4 -translate-y-1/2">
                  <DropdownMenu.ItemIndicator className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="block size-2 rounded-full bg-[var(--screening-primary)]" />
                  </DropdownMenu.ItemIndicator>
                </span>
                <span className="min-w-0 truncate">{item.label}</span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function SelectGroup({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
SelectGroup.displayName = "SelectGroup";

function SelectValue(_props: { placeholder?: string }) {
  return null;
}
SelectValue.displayName = "SelectValue";

function SelectTrigger(_props: {
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "default";
  children?: React.ReactNode;
}) {
  return null;
}
SelectTrigger.displayName = "SelectTrigger";

function SelectContent({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
SelectContent.displayName = "SelectContent";

function SelectLabel(_props: React.ComponentProps<"div">) {
  return null;
}
SelectLabel.displayName = "SelectLabel";

function SelectItem(_props: {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return null;
}
SelectItem.displayName = "SelectItem";

function SelectSeparator() {
  return null;
}
SelectSeparator.displayName = "SelectSeparator";

function SelectScrollUpButton() {
  return null;
}
SelectScrollUpButton.displayName = "SelectScrollUpButton";

function SelectScrollDownButton() {
  return null;
}
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
