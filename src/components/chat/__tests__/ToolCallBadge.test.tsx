import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";
import type { DynamicToolUIPart } from "ai";

afterEach(() => {
  cleanup();
});

// ── getToolCallLabel unit tests ────────────────────────────────────────────────

test("getToolCallLabel: str_replace_editor create", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create", path: "/src/App.jsx" })
  ).toBe("Creating App.jsx");
});

test("getToolCallLabel: str_replace_editor str_replace", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/src/components/Card.tsx" })
  ).toBe("Editing Card.tsx");
});

test("getToolCallLabel: str_replace_editor insert", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "insert", path: "/src/utils/helpers.ts" })
  ).toBe("Editing helpers.ts");
});

test("getToolCallLabel: str_replace_editor view", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "view", path: "/README.md" })
  ).toBe("Viewing README.md");
});

test("getToolCallLabel: str_replace_editor undo_edit", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/src/index.ts" })
  ).toBe("Undoing edit in index.ts");
});

test("getToolCallLabel: file_manager delete", () => {
  expect(
    getToolCallLabel("file_manager", { command: "delete", path: "/src/old.tsx" })
  ).toBe("Deleting old.tsx");
});

test("getToolCallLabel: file_manager rename", () => {
  expect(
    getToolCallLabel("file_manager", {
      command: "rename",
      path: "/src/Foo.tsx",
      new_path: "/src/Bar.tsx",
    })
  ).toBe("Renaming Foo.tsx to Bar.tsx");
});

test("getToolCallLabel: fallback capitalises snake_case tool name", () => {
  expect(getToolCallLabel("some_unknown_tool", {})).toBe("Some Unknown Tool");
});

test("getToolCallLabel: known tool with unknown command falls back", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "unknown_cmd", path: "/src/x.ts" })
  ).toBe("Str Replace Editor");
});

test("getToolCallLabel: path without leading slash", () => {
  expect(
    getToolCallLabel("str_replace_editor", { command: "create", path: "src/App.jsx" })
  ).toBe("Creating App.jsx");
});

// ── ToolCallBadge component tests ─────────────────────────────────────────────

test("ToolCallBadge renders complete state with green dot and human-readable label", () => {
  const toolInvocation = {
    type: "dynamic-tool",
    toolCallId: "abc",
    toolName: "str_replace_editor",
    input: { command: "create", path: "/src/App.jsx" },
    state: "output-available",
    output: "Success",
  } as DynamicToolUIPart;

  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge renders loading state with spinner for in-progress call", () => {
  const toolInvocation = {
    type: "dynamic-tool",
    toolCallId: "abc",
    toolName: "str_replace_editor",
    input: { command: "str_replace", path: "/src/components/Card.tsx" },
    state: "input-available",
  } as DynamicToolUIPart;

  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows spinner when result is falsy", () => {
  const toolInvocation = {
    type: "dynamic-tool",
    toolCallId: "abc",
    toolName: "file_manager",
    input: { command: "delete", path: "/src/legacy.tsx" },
    state: "output-available",
    output: "",
  } as DynamicToolUIPart;

  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Deleting legacy.tsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge renders fallback label for unknown tool", () => {
  const toolInvocation = {
    type: "dynamic-tool",
    toolCallId: "xyz",
    toolName: "some_other_tool",
    input: {},
    state: "output-available",
    output: "done",
  } as DynamicToolUIPart;

  render(<ToolCallBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Some Other Tool")).toBeDefined();
});

test("ToolCallBadge applies correct container classes", () => {
  const toolInvocation = {
    type: "dynamic-tool",
    toolCallId: "abc",
    toolName: "str_replace_editor",
    input: { command: "view", path: "/src/main.ts" },
    state: "input-available",
  } as DynamicToolUIPart;

  const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);
  const badge = container.firstChild as HTMLElement;

  expect(badge.className).toContain("inline-flex");
  expect(badge.className).toContain("items-center");
  expect(badge.className).toContain("font-mono");
  expect(badge.className).toContain("border-neutral-200");
});
