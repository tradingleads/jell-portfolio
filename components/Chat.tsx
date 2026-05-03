"use client";
// v3 — no typing effect, no placeholder, instant response
import {
  memo, useCallback, useEffect, useRef, useState, KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, RotateCcw, Sparkles } from "lucide-react";
import ProjectCards from "./ProjectCards";
import type { OrbState } from "./AIOrb";

interface ChatProps { onOrbStateChange: (s: OrbState) => void; }
interface Message   { id: string; role: "user" | "assistant"; content: string; }

const CHIPS = [
  "What do you actually build?",
  "How does pricing work?",
  "Show me real examples",
  "Could this work for my business?",
];

function uid() { return Math.random().toString(36).slice(2, 10); }
function stripTags(c: string) { return c.replace(/\[SHOW_PROJECTS\]/g, "").trim(); }
function hasProjectsTag(c: string) { return c.includes("[SHOW_PROJECTS]"); }

function renderMarkdown(text: string) {
  const out: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  function flush() {
    if (listItems.length) {
      out.push(<ul key={`ul-${out.length}`} style={{ listStyle: "disc", paddingLeft: "1.2rem", marginBottom: "0.5rem" }}>{listItems}</ul>);
      listItems = [];
    }
  }

  text.split("\n").forEach((line, i) => {
    const t = line.trim();
    if (/^[-•*]\s/.test(t)) {
      listItems.push(<li key={i} style={{ marginBottom: "0.25rem" }}>{bold(t.replace(/^[-•*]\s/, ""))}</li>);
      return;
    }
    flush();
    if (t === "") { out.push(<br key={`br-${i}`} />); }
    else out.push(<p key={i} style={{ marginBottom: "0.45rem" }}>{bold(t)}</p>);
  });
  flush();
  return out;
}

function bold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

const Chat = memo(function Chat({ onOrbStateChange }: ChatProps) {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [usedChips, setUsedChips] = useState<Set<string>>(new Set());

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const busyRef     = useRef(false);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
  }, [input]);

  const submit = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const history = messagesRef.current;

    setMessages(p => [...p, userMsg]);
    setInput("");
    busyRef.current = true;
    onOrbStateChange("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: trimmed },
          ],
        }),
        signal: abort.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const fullText: string = data.text ?? "Sorry, I couldn't generate a response.";

      if (abort.signal.aborted) return;

      onOrbStateChange("speaking");
      setMessages(p => [...p, { id: uid(), role: "assistant", content: fullText }]);

    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setMessages(p => [...p, { id: uid(), role: "assistant", content: "Something went wrong. Please try again." }]);
        onOrbStateChange("idle");
      }
    } finally {
      busyRef.current = false;
      setTimeout(() => onOrbStateChange("idle"), 600);
    }
  }, [onOrbStateChange]);

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); }
  }, [input, submit]);

  const sendChip = useCallback((chip: string) => {
    setUsedChips(p => new Set([...Array.from(p), chip]));
    submit(chip);
  }, [submit]);

  const hasMessages = messages.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>

      {/* Chat header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={14} strokeWidth={1.5} style={{ color: "var(--accent)", opacity: 0.8 }} />
          <span style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            color: "var(--text-secondary)",
            letterSpacing: "0.01em",
          }}>
            Ask Jell&apos;s AI
          </span>
        </div>
        {hasMessages && (
          <motion.button
            type="button"
            onClick={() => { setMessages([]); setUsedChips(new Set()); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 10px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 100,
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              fontWeight: 500,
              transition: "all 0.18s ease",
            }}
          >
            <RotateCcw size={11} strokeWidth={2} />
            Clear
          </motion.button>
        )}
      </div>

      {/* Chips — shown only when no messages */}
      {!hasMessages && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: "flex", flexWrap: "wrap", gap: 8,
            padding: "0 20px 20px",
            justifyContent: "center",
          }}
        >
          <p style={{
            width: "100%", textAlign: "center",
            fontSize: "0.72rem", fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--text-muted)", marginBottom: 12,
          }}>
            Start a conversation
          </p>
          {CHIPS.map(chip => (
            <motion.button
              key={chip}
              type="button"
              onClick={() => sendChip(chip)}
              disabled={usedChips.has(chip)}
              whileHover={!usedChips.has(chip) ? { scale: 1.03, borderColor: "var(--border-accent)" } : {}}
              whileTap={!usedChips.has(chip) ? { scale: 0.97 } : {}}
              style={{
                padding: "8px 16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 100,
                cursor: usedChips.has(chip) ? "default" : "pointer",
                color: usedChips.has(chip) ? "var(--text-muted)" : "var(--text-secondary)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                opacity: usedChips.has(chip) ? 0.45 : 1,
                transition: "all 0.18s ease",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {chip}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Messages */}
      <div
        className="message-prose"
        style={{
          flex: 1, overflowY: "auto", padding: "0 20px",
          display: "flex", flexDirection: "column", gap: 16,
          scrollbarWidth: "none",
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isUser = msg.role === "user";
            const showProjects = !isUser && hasProjectsTag(msg.content);
            const displayContent = stripTags(msg.content);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 10 }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "11px 16px",
                    borderRadius: isUser ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
                    background: isUser ? "var(--accent)" : "var(--bg-card)",
                    border: isUser ? "none" : "1px solid var(--border)",
                    color: isUser ? "#fff" : "var(--text-primary)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.65,
                    boxShadow: isUser
                      ? "0 2px 16px var(--accent-glow)"
                      : "inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.08)",
                    backdropFilter: isUser ? "none" : "blur(16px)",
                  }}
                >
                  {isUser ? msg.content : renderMarkdown(displayContent)}
                </div>
                {showProjects && <ProjectCards />}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={bottomRef} style={{ height: 4 }} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px 20px 20px" }}>
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 10,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "12px 14px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 0.2s ease",
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about pricing, services, systems, or how I can automate your business…"
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              resize: "none",
              border: "none",
              outline: "none",
              fontSize: "0.9375rem",
              lineHeight: 1.55,
              color: "var(--text-primary)",
              fontFamily: "var(--font-geist-sans)",
              minHeight: "26px",
              maxHeight: "140px",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 2 }}>
            <motion.button
              type="button"
              onClick={() => submit(input)}
              disabled={!input.trim()}
              whileHover={input.trim() ? { scale: 1.08 } : {}}
              whileTap={input.trim() ? { scale: 0.93 } : {}}
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: input.trim() ? "var(--accent)" : "var(--border)",
                color: input.trim() ? "#fff" : "var(--text-muted)",
                border: "none",
                cursor: input.trim() ? "pointer" : "default",
                opacity: !input.trim() ? 0.4 : 1,
                transition: "background 0.18s ease, color 0.18s ease, opacity 0.18s ease",
                boxShadow: input.trim() ? "0 2px 12px var(--accent-glow)" : "none",
                flexShrink: 0,
              }}
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
        <p style={{
          textAlign: "center", marginTop: 8,
          fontSize: "0.7rem", color: "var(--text-muted)", opacity: 0.55,
        }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
});

export default Chat;
