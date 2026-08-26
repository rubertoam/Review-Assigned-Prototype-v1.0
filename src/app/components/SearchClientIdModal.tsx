import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AceInputField } from "@ace-ds/components/atoms/AceInputField";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";

export type SearchClientIdModalProps = {
  open: boolean;
  onClose: () => void;
  /** Currently applied case-list Client ID filter (shown when reopening). */
  initialQuery?: string;
  /** Commit search — empty string clears the case-list filter. */
  onSearch: (clientIdQuery: string) => void;
};

export function SearchClientIdModal({
  open,
  onClose,
  initialQuery = "",
  onSearch,
}: SearchClientIdModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  // DialogModal focuses the primary button on open; pull focus into the field afterward.
  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const commitSearch = useCallback(() => {
    // Read from the DOM so paste → immediate Search isn't lost to a stale React state.
    const value = (inputRef.current?.value ?? query).trim();
    onSearch(value);
    onClose();
  }, [onClose, onSearch, query]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    commitSearch();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitSearch();
    }
  };

  const secondaryAction = useMemo(
    () => ({ label: "Cancel", onClick: onClose }),
    [onClose],
  );
  const primaryAction = useMemo(
    () => ({ label: "Search", onClick: commitSearch }),
    [commitSearch],
  );

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      title="Search Client ID"
      size="md"
      fitContent
      bodyClassName="flex flex-col gap-4"
      secondaryAction={secondaryAction}
      primaryAction={primaryAction}
    >
      <form onSubmit={handleSubmit}>
        <AceInputField
          ref={inputRef}
          id="search-client-id"
          label={undefined}
          aria-label="Client ID"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search"
          autoComplete="off"
          fieldSize="md"
          icon="left"
          onClear={query ? () => setQuery("") : undefined}
        />
      </form>
    </DialogModal>
  );
}
