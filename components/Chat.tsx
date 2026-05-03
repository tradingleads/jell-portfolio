"use client";

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

const TypingDots = memo(function TypingDots() {
  return (
    <motion.div
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "12px 16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        borderBottomLeftRadius: 5,
        width: "fit-content",
        backdropFilter: "blur(16px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.22 }}
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.75, 1, 0.75] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22 }}
        />
      ))}
    </motion.div>
  );
});

const Chat = memo(function Chat({ onOrbStateChange }: ChatProps) {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usedChips, setUsedChips] = useState<Set<string>>(new Set());

  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const abortRef     = useRef<AbortController | null>(null);
  const messagesRef  = useRef<Message[]>([]);
  const loadingRef   = useRef(false);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { loadingRef.current  = isLoading; }, [isLoading]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
  }, [input]);

  const submit = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loadingRef.current) return;

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const assistantId = uid();
    const history = messagesRef.current;

    setMessages(p => [...p, userMsg]);
    setInput("");
    setIsLoading(true);
    loadingRef.current = true;
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

      // Add full response only after API completes
      setMessages(p => [...p, { id: assistantId, role: "assistant", content: fullText }]);

    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setMessages(p => [...p, { id: assistantId, role: "assistant", content: "Something went wrong. Please try again." }]);
        onOrbStateChange("idle");
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
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
            onClick={() => { setMessages([]); onOrbStateChange("idle"); }}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px",
              borderRadius: "100px",
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
            whileHover={{ borderColor: "var(--border-accent)", color: "var(--accent)" }}
            whileTap={{ scale: 0.96 }}
          >
            <RotateCcw size={11} strokeWidth={2} />
            Clear
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 12px", display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
        <AnimatePresence>
          {!hasMessages && (
            <motion.div
              style={{ textAlign: "center", padding: "40px 0 16px" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <p style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                Start a conversation
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isUser = msg.role === "user";
            const text   = stripTags(msg.content);
            const showP  = !isUser && hasProjectsTag(msg.content);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 8 }}
              >
                {text && (
                  <div
                    style={isUser ? {
                      maxWidth: "82%",
                      padding: "14px 20px",
                      borderRadius: "20px",
                      borderBottomRightRadius: 6,
                      background: "linear-gradient(135deg, var(--accent) 0%, #0891b2 100%)",
                      color: "#fff",
                      fontSize: "1rem",
                      lineHeight: 1.65,
                      boxShadow: "0 4px 24px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.18)",
                    } : {
                      maxWidth: "88%",
                      padding: "16px 20px",
                      borderRadius: "20px",
                      borderBottomLeftRadius: 6,
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      backdropFilter: "blur(16px)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.12)",
                    }}
                  >
                    {isUser
                      ? <p style={{ lineHeight: 1.65, fontSize: "1rem" }}>{text}</p>
                      : <div className="message-prose">{renderMarkdown(text)}</div>
                    }
                  </div>
                )}
                {showP && <div style={{ width: "100%", maxWidth: "92%" }}><ProjectCards /></div>}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={bottomRef} style={{ height: 4 }} />
      </div>

      {/* Chips */}
      <AnimatePresence>
        {!hasMessages && (
          <motion.div
            style={{ padding: "8px 24px 16px", display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {CHIPS.filter(c => !usedChips.has(c)).map((chip, i) => (
              <motion.button
                key={chip}
                type="button"
                onClick={() => sendChip(chip)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 + i * 0.07, duration: 0.35 }}
                whileHover={{ y: -2, transition: { type: "spring", stiffness: 360, damping: 24 } }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: "10px 18px",
                  borderRadius: "100px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  fontFamily: "var(--font-display)",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  transition: "all 0.18s ease",
                }}
                onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, {
                  background: "var(--surface-glow)", borderColor: "var(--border-accent)", color: "var(--accent)",
                })}
                onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, {
                  background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)",
                })}
              >
                {chip}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div style={{ padding: "0 20px 24px" }}>
        <motion.div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            padding: "14px 16px",
            borderRadius: "20px",
            background: "var(--bg-glass)",
            backdropFilter: "blur(24px)",
            border: "1px solid var(--border)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 20px rgba(0,0,0,0.12)",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          animate={{
            borderColor: input ? "var(--border-accent)" : "var(--border)",
            boxShadow: input
              ? "inset 0 1px 0 rgba(255,255,255,0.09), 0 0 0 3px var(--accent-glow), 0 4px 20px rgba(0,0,0,0.14)"
              : "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 20px rgba(0,0,0,0.12)",
          }}
          transition={{ duration: 0.22 }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about pricing, services, systems, or how I can automate your business…"
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              background: "transparent",
              resize: "none",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              lineHeight: "1.6",
              color: "var(--text-primary)",
              fontFamily: "var(--font-geist-sans)",
              minHeight: "26px",
              maxHeight: "140px",
              opacity: isLoading ? 0.6 : 1,
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 2 }}>
            <motion.button
              type="button"
              onClick={() => submit(input)}
              disabled={!input.trim() || isLoading}
              whileHover={input.trim() ? { scale: 1.08 } : {}}
              whileTap={input.trim() ? { scale: 0.93 } : {}}
              style={{
                width: 36, height: 36,
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: input.trim() ? "var(--accent)" : "var(--border)",
                color: input.trim() ? "#fff" : "var(--text-muted)",
                border: "none",
                cursor: input.trim() ? "pointer" : "default",
                opacity: (!input.trim() || isLoading) ? 0.4 : 1,
                transition: "background 0.18s ease, color 0.18s ease, opacity 0.18s ease",
                boxShadow: input.trim() ? "0 2px 12px var(--accent-glow)" : "none",
                flexShrink: 0,
              }}
            >
              <ArrowUp size={15} strokeWidth={2.5} />
            </motion.button>
          </div>
        </motion.div>

        <p style={{
          marginTop: 7,
          textAlign: "center",
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          letterSpacing: "0.02em",
        }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
});

export default Chat;
