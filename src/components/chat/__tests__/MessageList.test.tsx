import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MessageList, MessageListEmptyState } from "../MessageList";
import type { UIMessage } from "ai";

// Mock the MarkdownRenderer component
vi.mock("../MarkdownRenderer", () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

afterEach(() => {
  cleanup();
});

test("MessageListEmptyState shows empty state content", () => {
  render(<MessageListEmptyState />);

  expect(
    screen.getByText("Generate React components with AI")
  ).toBeDefined();
  expect(
    screen.getByText("Describe a UI — buttons, forms, cards, layouts — and see it render live")
  ).toBeDefined();
});

test("MessageList renders user messages", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "Create a button component" }],
    },
  ];

  render(<MessageList messages={messages} />);

  expect(screen.getByText("Create a button component")).toBeDefined();
});

test("MessageList renders assistant messages", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "assistant",
      parts: [{ type: "text", text: "I'll help you create a button component." }],
    },
  ];

  render(<MessageList messages={messages} />);

  expect(
    screen.getByText("I'll help you create a button component.")
  ).toBeDefined();
});

test("MessageList renders messages with parts", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "assistant",
      parts: [
        { type: "text", text: "Creating your component..." },
        {
          type: "dynamic-tool",
          toolCallId: "asdf",
          toolName: "str_replace_editor",
          input: {},
          state: "output-available",
          output: "Success",
        } as any,
      ],
    },
  ];

  render(<MessageList messages={messages} />);

  expect(screen.getByText("Creating your component...")).toBeDefined();
  expect(screen.getByText("Str Replace Editor")).toBeDefined();
});

test("MessageList shows loading for last assistant message without text parts", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "assistant",
      parts: [],
    },
  ];

  render(<MessageList messages={messages} isLoading={true} />);

  expect(screen.getByText("Generating…")).toBeDefined();
});

test("MessageList shows content for assistant message with text", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "assistant",
      parts: [{ type: "text", text: "Generating your component..." }],
    },
  ];

  render(<MessageList messages={messages} isLoading={true} />);

  expect(screen.getByText("Generating your component...")).toBeDefined();
  expect(screen.queryByText("Generating…")).toBeNull();
});

test("MessageList doesn't show loading state for non-last messages", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "assistant",
      parts: [{ type: "text", text: "First response" }],
    },
    {
      id: "2",
      role: "user",
      parts: [{ type: "text", text: "Another request" }],
    },
  ];

  render(<MessageList messages={messages} isLoading={true} />);

  expect(screen.queryByText("Generating…")).toBeNull();
});

test("MessageList renders reasoning parts", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "assistant",
      parts: [
        { type: "text", text: "Let me analyze this." },
        {
          type: "reasoning",
          text: "The user wants a button component with specific styling.",
        } as any,
      ],
    },
  ];

  render(<MessageList messages={messages} />);

  expect(screen.getByText("Reasoning")).toBeDefined();
  expect(
    screen.getByText("The user wants a button component with specific styling.")
  ).toBeDefined();
});

test("MessageList renders multiple messages in correct order", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "First user message" }],
    },
    {
      id: "2",
      role: "assistant",
      parts: [{ type: "text", text: "First assistant response" }],
    },
    {
      id: "3",
      role: "user",
      parts: [{ type: "text", text: "Second user message" }],
    },
    {
      id: "4",
      role: "assistant",
      parts: [{ type: "text", text: "Second assistant response" }],
    },
  ];

  const { container } = render(<MessageList messages={messages} />);

  const messageContainers = container.querySelectorAll(".rounded-2xl");

  expect(messageContainers).toHaveLength(4);

  expect(messageContainers[0].textContent).toContain("First user message");
  expect(messageContainers[1].textContent).toContain(
    "First assistant response"
  );
  expect(messageContainers[2].textContent).toContain("Second user message");
  expect(messageContainers[3].textContent).toContain(
    "Second assistant response"
  );
});

test("MessageList handles step-start parts", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "assistant",
      parts: [
        { type: "text", text: "Step 1 content" },
        { type: "step-start" } as any,
        { type: "text", text: "Step 2 content" },
      ],
    },
  ];

  render(<MessageList messages={messages} />);

  expect(screen.getByText("Step 1 content")).toBeDefined();
  expect(screen.getByText("Step 2 content")).toBeDefined();
  const container = screen.getByText("Step 1 content").closest(".rounded-2xl");
  expect(container?.querySelector("hr")).toBeDefined();
});

test("MessageList applies correct styling for user vs assistant messages", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "User message" }],
    },
    {
      id: "2",
      role: "assistant",
      parts: [{ type: "text", text: "Assistant message" }],
    },
  ];

  render(<MessageList messages={messages} />);

  const userMessage = screen.getByText("User message").closest(".rounded-2xl");
  const assistantMessage = screen
    .getByText("Assistant message")
    .closest(".rounded-2xl");

  expect(userMessage?.className).toContain("bg-blue-600");
  expect(userMessage?.className).toContain("text-white");

  expect(assistantMessage?.className).toContain("bg-white");
  expect(assistantMessage?.className).toContain("text-neutral-800");
});

test("MessageList handles empty parts with loading", () => {
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "assistant",
      parts: [],
    },
  ];

  const { container } = render(
    <MessageList messages={messages} isLoading={true} />
  );

  const loadingText = container.querySelectorAll(".text-neutral-400");
  const generatingElements = Array.from(loadingText).filter(
    (el) => el.textContent === "Generating…"
  );
  expect(generatingElements).toHaveLength(1);
});
