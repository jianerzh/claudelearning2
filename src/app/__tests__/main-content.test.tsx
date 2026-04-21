import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div>{children}</div>,
  useFileSystem: vi.fn(),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div>{children}</div>,
  useChat: vi.fn(),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface" />,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree" />,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor" />,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame" />,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions" />,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

afterEach(() => {
  cleanup();
});

test("renders Preview tab as active by default", () => {
  render(<MainContent />);
  const previewTab = screen.getByRole("tab", { name: "Preview" });
  expect(previewTab.getAttribute("data-state")).toBe("active");
  const codeTab = screen.getByRole("tab", { name: "Code" });
  expect(codeTab.getAttribute("data-state")).toBe("inactive");
});

test("shows PreviewFrame when Preview tab is active", () => {
  render(<MainContent />);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("file-tree")).toBeNull();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("switches to Code view when Code tab is clicked", async () => {
  const user = userEvent.setup();
  render(<MainContent />);
  await user.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByTestId("file-tree")).toBeDefined();
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("Code tab becomes active after clicking it", async () => {
  const user = userEvent.setup();
  render(<MainContent />);
  await user.click(screen.getByRole("tab", { name: "Code" }));
  const codeTab = screen.getByRole("tab", { name: "Code" });
  expect(codeTab.getAttribute("data-state")).toBe("active");
  const previewTab = screen.getByRole("tab", { name: "Preview" });
  expect(previewTab.getAttribute("data-state")).toBe("inactive");
});

test("switches back to Preview view when Preview tab is clicked", async () => {
  const user = userEvent.setup();
  render(<MainContent />);
  await user.click(screen.getByRole("tab", { name: "Code" }));
  await user.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("file-tree")).toBeNull();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});
