import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

const MODEL = "claude-haiku-4-5";

export class MockLanguageModel {
  readonly specificationVersion = "v2" as const;
  readonly provider = "mock";
  readonly modelId: string;
  readonly supportedUrls: Record<string, RegExp[]> = {};

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extractUserPrompt(messages: any[]): string {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "user") {
        const content = message.content;
        if (Array.isArray(content)) {
          const textParts = content
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text);
          return textParts.join(" ");
        } else if (typeof content === "string") {
          return content;
        }
      }
    }
    return "";
  }

  private async *generateMockStream(
    messages: any[],
    userPrompt: string
  ): AsyncGenerator<any> {
    const toolMessageCount = messages.filter((m: any) => m.role === "tool").length;

    const promptLower = userPrompt.toLowerCase();
    let componentType = "counter";
    let componentName = "Counter";

    if (promptLower.includes("form")) {
      componentType = "form";
      componentName = "ContactForm";
    } else if (promptLower.includes("card")) {
      componentType = "card";
      componentName = "Card";
    }

    yield { type: "stream-start", warnings: [] };

    if (toolMessageCount === 1) {
      const text = `I'll create a ${componentName} component for you.`;
      yield { type: "text-start", id: "text-1" };
      for (const char of text) {
        yield { type: "text-delta", id: "text-1", delta: char };
        await this.delay(25);
      }
      yield { type: "text-end", id: "text-1" };

      const toolArgs = {
        command: "create",
        path: `/components/${componentName}.jsx`,
        file_text: this.getComponentCode(componentType),
      };
      yield { type: "tool-input-start", id: "call_1", toolName: "str_replace_editor" };
      yield { type: "tool-input-delta", id: "call_1", delta: JSON.stringify(toolArgs) };
      yield { type: "tool-input-end", id: "call_1" };
      yield { type: "tool-call", toolCallId: "call_1", toolName: "str_replace_editor", input: JSON.stringify(toolArgs) };

      yield { type: "finish", finishReason: "tool-calls", usage: { inputTokens: 50, outputTokens: 30 } };
      return;
    }

    if (toolMessageCount === 2) {
      const text = `Now let me enhance the component with better styling.`;
      yield { type: "text-start", id: "text-2" };
      for (const char of text) {
        yield { type: "text-delta", id: "text-2", delta: char };
        await this.delay(25);
      }
      yield { type: "text-end", id: "text-2" };

      const toolArgs = {
        command: "str_replace",
        path: `/components/${componentName}.jsx`,
        old_str: this.getOldStringForReplace(componentType),
        new_str: this.getNewStringForReplace(componentType),
      };
      yield { type: "tool-input-start", id: "call_2", toolName: "str_replace_editor" };
      yield { type: "tool-input-delta", id: "call_2", delta: JSON.stringify(toolArgs) };
      yield { type: "tool-input-end", id: "call_2" };
      yield { type: "tool-call", toolCallId: "call_2", toolName: "str_replace_editor", input: JSON.stringify(toolArgs) };

      yield { type: "finish", finishReason: "tool-calls", usage: { inputTokens: 50, outputTokens: 30 } };
      return;
    }

    if (toolMessageCount === 0) {
      const text = `This is a static response. You can place an Anthropic API key in the .env file to use the Anthropic API for component generation. Let me create an App.jsx file to display the component.`;
      yield { type: "text-start", id: "text-3" };
      for (const char of text) {
        yield { type: "text-delta", id: "text-3", delta: char };
        await this.delay(15);
      }
      yield { type: "text-end", id: "text-3" };

      const toolArgs = { command: "create", path: "/App.jsx", file_text: this.getAppCode(componentName) };
      yield { type: "tool-input-start", id: "call_3", toolName: "str_replace_editor" };
      yield { type: "tool-input-delta", id: "call_3", delta: JSON.stringify(toolArgs) };
      yield { type: "tool-input-end", id: "call_3" };
      yield { type: "tool-call", toolCallId: "call_3", toolName: "str_replace_editor", input: JSON.stringify(toolArgs) };

      yield { type: "finish", finishReason: "tool-calls", usage: { inputTokens: 50, outputTokens: 30 } };
      return;
    }

    if (toolMessageCount >= 3) {
      const text = `Perfect! I've created:\n\n1. **${componentName}.jsx** - A fully-featured ${componentType} component\n2. **App.jsx** - The main app file that displays the component\n\nThe component is now ready to use. You can see the preview on the right side of the screen.`;

      yield { type: "text-start", id: "text-4" };
      for (const char of text) {
        yield { type: "text-delta", id: "text-4", delta: char };
        await this.delay(30);
      }
      yield { type: "text-end", id: "text-4" };

      yield { type: "finish", finishReason: "stop", usage: { inputTokens: 50, outputTokens: 50 } };
      return;
    }
  }

  private getComponentCode(componentType: string): string {
    switch (componentType) {
      case "form":
        return `import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight leading-none">Get in touch</h2>
        <p className="text-zinc-500 mt-2 text-sm">We'll get back to you within 24 hours.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
        <textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Your message..." className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none" />
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25">Send message →</button>
      </form>
    </div>
  );
};

export default ContactForm;`;

      case "card":
        return `import React from 'react';

const Card = ({ name = "Alex Rivera", role = "Product Designer", bio = "Crafting digital experiences that feel human.", followers = 2400, following = 180, works = 42 }) => {
  return (
    <div className="relative bg-zinc-900 rounded-3xl overflow-hidden p-8 w-80 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/10 pointer-events-none" />
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 mb-6 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/30">
          {name[0]}
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">{name}</h2>
        <p className="text-violet-400 text-sm font-medium mb-4">{role}</p>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">{bio}</p>
        <div className="flex gap-6 mb-6">
          <div><div className="text-white font-bold text-lg leading-none">{followers.toLocaleString()}</div><div className="text-zinc-500 text-xs mt-1">Followers</div></div>
          <div><div className="text-white font-bold text-lg leading-none">{following}</div><div className="text-zinc-500 text-xs mt-1">Following</div></div>
          <div><div className="text-white font-bold text-lg leading-none">{works}</div><div className="text-zinc-500 text-xs mt-1">Works</div></div>
        </div>
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25">Follow</button>
      </div>
    </div>
  );
};

export default Card;`;

      default:
        return `import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-zinc-900 rounded-3xl p-10 flex flex-col items-center shadow-2xl w-72">
      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-6">Counter</span>
      <div className={\`text-8xl font-bold tracking-tighter leading-none mb-8 bg-gradient-to-br \${count >= 0 ? 'from-violet-400 to-cyan-400' : 'from-rose-400 to-orange-400'} bg-clip-text text-transparent transition-all\`}>
        {count}
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => setCount(c => c - 1)} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 transition-colors">−</button>
        <button onClick={() => setCount(0)} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-semibold hover:bg-zinc-700 transition-colors">reset</button>
        <button onClick={() => setCount(c => c + 1)} className="flex-1 py-3 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25">+</button>
      </div>
    </div>
  );
};

export default Counter;`;
    }
  }

  private getOldStringForReplace(componentType: string): string {
    switch (componentType) {
      case "form": return "    console.log('Form submitted:', formData);";
      case "card": return "        <button className=\"w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25\">Follow</button>";
      default: return "        <button onClick={() => setCount(0)} className=\"flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-semibold hover:bg-zinc-700 transition-colors\">reset</button>";
    }
  }

  private getNewStringForReplace(componentType: string): string {
    switch (componentType) {
      case "form": return "    console.log('Form submitted:', formData);\n    alert('Message sent!');";
      case "card": return "        <button className=\"w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25\">Following ✓</button>";
      default: return "        <button onClick={() => setCount(0)} className=\"flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-semibold hover:bg-zinc-700 transition-colors\">↺</button>";
    }
  }

  private getAppCode(componentName: string): string {
    return `import ${componentName} from '@/components/${componentName}';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <${componentName} />
    </div>
  );
}`;
  }

  async doGenerate(options: any): Promise<any> {
    const userPrompt = this.extractUserPrompt(options.prompt);

    const parts: any[] = [];
    for await (const part of this.generateMockStream(options.prompt, userPrompt)) {
      parts.push(part);
    }

    const content: any[] = [];
    let currentTextId: string | null = null;
    let currentText = "";

    for (const part of parts) {
      if (part.type === "text-start") {
        currentTextId = part.id;
        currentText = "";
      } else if (part.type === "text-delta" && part.id === currentTextId) {
        currentText += part.delta;
      } else if (part.type === "text-end" && currentText) {
        content.push({ type: "text", text: currentText });
        currentTextId = null;
        currentText = "";
      } else if (part.type === "tool-call") {
        content.push(part);
      }
    }

    const finishPart = parts.find((p) => p.type === "finish") as any;

    return {
      content,
      finishReason: finishPart?.finishReason ?? "stop",
      usage: { inputTokens: 100, outputTokens: 200 },
      warnings: [],
      rawCall: { rawPrompt: options.prompt, rawSettings: {} },
    };
  }

  async doStream(options: any): Promise<any> {
    const userPrompt = this.extractUserPrompt(options.prompt);
    const self = this;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of self.generateMockStream(options.prompt, userPrompt)) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return {
      stream,
      warnings: [],
      rawCall: { rawPrompt: options.prompt, rawSettings: {} },
    };
  }
}

export function getLanguageModel(): LanguageModel {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.log("No ANTHROPIC_API_KEY found, using mock provider");
    return new MockLanguageModel("mock-claude-sonnet-4-0") as unknown as LanguageModel;
  }

  return anthropic(MODEL);
}
