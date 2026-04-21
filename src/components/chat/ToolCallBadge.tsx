"use client";

import { type DynamicToolUIPart } from "ai";
import { Loader2 } from "lucide-react";

export function getToolCallLabel(
  toolName: string,
  args: Record<string, unknown>
): string {
  const filename =
    typeof args.path === "string"
      ? args.path.split("/").filter(Boolean).at(-1) ?? args.path
      : undefined;

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return `Editing ${filename}`;
      case "view":
        return `Viewing ${filename}`;
      case "undo_edit":
        return `Undoing edit in ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete":
        return `Deleting ${filename}`;
      case "rename": {
        const newFilename =
          typeof args.new_path === "string"
            ? args.new_path.split("/").filter(Boolean).at(-1) ?? args.new_path
            : undefined;
        return `Renaming ${filename} to ${newFilename}`;
      }
    }
  }

  return toolName
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface ToolCallBadgeProps {
  toolInvocation: DynamicToolUIPart;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const input = (toolInvocation.input as Record<string, unknown>) ?? {};
  const label = getToolCallLabel(toolInvocation.toolName, input);
  const isComplete =
    toolInvocation.state === "output-available" &&
    "output" in toolInvocation &&
    toolInvocation.output;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
