import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./Sidebar";

const HOME_TABS = ["빠른 작업", "업무 자동화", "외부 도구"];

const QUICK_ACTIONS = [
  { id: "work-time", label: "근로 시간 등록해줘", icon: "clock" },
  { id: "schedule", label: "오늘 일정 요약해줘", icon: "calendar" },
  { id: "mail-summary", label: "이번 주 내가 받은 메일 요약해줘", icon: "mail" },
  { id: "policy", label: "내년 인사 관리 규정 알려줘", icon: "policy" },
];

function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function normalizeQuestion(text) {
  return text.replace(/\s+/g, " ").trim();
}

export default function WorkspacePage({
  theme,
  isDarkMode,
  onToggleTheme,
  session,
  currentClient,
  fallbackLogo,
  onLogout,
  agentsSeed,
  findBotAnswer,
  getChatStorageKey,
  getAgentStorageKey,
}) {
  const [activeMenu, setActiveMenu] = useState("home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeHomeTab, setActiveHomeTab] = useState("빠른 작업");
  const [messages, setMessages] = useState([]);
  const [composerText, setComposerText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isMicActive, setIsMicActive] = useState(false);
  const [agentStates, setAgentStates] = useState(agentsSeed);

  const topRightRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageBottomRef = useRef(null);

  const chatStorageKey = getChatStorageKey(session);
  const agentStorageKey = getAgentStorageKey(session);

  useEffect(() => {
    setMessages(readStorage(chatStorageKey, []));
    setAgentStates(readStorage(agentStorageKey, agentsSeed));
    setActiveMenu("home");
    setComposerText("");
    setAttachedFiles([]);
    setOpenDropdown(null);
    setIsMicActive(false);
  }, [chatStorageKey, agentStorageKey, agentsSeed]);

  useEffect(() => {
    localStorage.setItem(chatStorageKey, JSON.stringify(messages));
  }, [chatStorageKey, messages]);

  useEffect(() => {
    localStorage.setItem(agentStorageKey, JSON.stringify(agentStates));
  }, [agentStorageKey, agentStates]);

  useEffect(() => {
    if (messageBottomRef.current) {
      messageBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topRightRef.current && !topRightRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const enabledAgentCount = useMemo(() => {
    return agentStates.filter((item) => item.enabled).length;
  }, [agentStates]);

  const normalizedComposer = normalizeQuestion(composerText);

  const sendMessage = (directText = null) => {
    const rawText = directText ?? composerText;
    const normalized = normalizeQuestion(rawText);

    if (!normalized) return;

    const userMessage = {
      id: makeId("user"),
      role: "user",
      content: rawText.trim(),
      attachments: attachedFiles.map((file) => file.name),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setComposerText("");
    setAttachedFiles([]);

    const reply = findBotAnswer(session.clientId, rawText);

    setTimeout(() => {
      const botMessage = {
        id: makeId("assistant"),
        role: "assistant",
        content: reply,
        attachments: [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 350);
  };

  const handleQuickAction = (text) => {
    setComposerText(text);
    setTimeout(() => {
      sendMessage(text);
    }, 0);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []).map((file) => ({
      id: makeId("file"),
      name: file.name,
    }));

    if (files.length > 0) {
      setAttachedFiles((prev) => [...prev, ...files]);
    }

    event.target.value = "";
  };

  const removeAttachedFile = (fileId) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const toggleAgent = (agentId) => {
    setAgentStates((prev) =>
      prev.map((item) =>
        item.id === agentId ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const isHomeEmpty = activeMenu === "home" && messages.length === 0;

  return (
    <div style={styles.workspaceShell}>
      <Sidebar
        theme={theme}
        session={session}
        currentClient={currentClient}
        fallbackLogo={fallbackLogo}
        onLogout={onLogout}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <main
        style={{
          ...styles.workspaceMain,
          backgroundColor: theme.workspaceBackground,
        }}
      >
        <div style={styles.workspaceTopBar} ref={topRightRef}>
          <ThemeToggle
            isDarkMode={isDarkMode}
            theme={theme}
            onToggle={onToggleTheme}
          />

          <div style={styles.dropdownWrap}>
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((prev) => (prev === "quick" ? null : "quick"))
              }
              style={{
                ...styles.topActionButton,
                backgroundColor: theme.surface,
                color: theme.primaryText,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.softShadow,
              }}
            >
              <span style={styles.topActionButtonInner}>
                <Icon name="quick" size={15} />
                <span>빠른 작업 설정</span>
                <Icon name="chevron" size={14} />
              </span>
            </button>

            {openDropdown === "quick" ? (
              <div
                style={{
                  ...styles.dropdownPanel,
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.dropdownShadow,
                  minHeight: "88px",
                }}
              />
            ) : null}
          </div>

          <div style={styles.dropdownWrap}>
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((prev) => (prev === "agents" ? null : "agents"))
              }
              style={{
                ...styles.topActionButton,
                backgroundColor: theme.surface,
                color: theme.primaryText,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.softShadow,
              }}
            >
              <span style={styles.topActionButtonInner}>
                <Icon name="settings" size={15} />
                <span>활성 에이전트 {enabledAgentCount}개</span>
                <Icon name="chevron" size={14} />
              </span>
            </button>

            {openDropdown === "agents" ? (
              <div
                style={{
                  ...styles.dropdownPanel,
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.dropdownShadow,
                }}
              >
                <div style={styles.agentDropdownScroll}>
                  {agentStates.map((agent) => (
                    <div
                      key={agent.id}
                      style={{
                        ...styles.agentRow,
                        borderBottom: `1px solid ${theme.borderSoft}`,
                      }}
                    >
                      <div style={styles.agentLeft}>
                        <span
                          style={{
                            ...styles.agentIconBox,
                            backgroundColor: theme.iconSoftBackground,
                            color: theme.accent,
                          }}
                        >
                          <Icon name={resolveAgentIcon(agent.id)} size={14} />
                        </span>
                        <span
                          style={{
                            ...styles.agentLabel,
                            color: theme.primaryText,
                          }}
                        >
                          {agent.label}
                        </span>
                      </div>

                      <div style={styles.agentRight}>
                        <span
                          style={{
                            ...styles.agentStateText,
                            color: theme.accent,
                          }}
                        >
                          {agent.enabled ? "활성" : "비활성"}
                        </span>
                        <ToggleSwitch
                          checked={agent.enabled}
                          onChange={() => toggleAgent(agent.id)}
                          theme={theme}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div style={styles.workspaceBody}>
          {activeMenu !== "home" ? (
            <div
              style={{
                ...styles.placeholderCard,
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.cardShadow,
              }}
            >
              <div
                style={{
                  ...styles.placeholderTitle,
                  color: theme.primaryText,
                }}
              >
                해당 화면은 추후 개발 예정입니다.
              </div>
              <div
                style={{
                  ...styles.placeholderSub,
                  color: theme.secondaryText,
                }}
              >
                현재는 Hi, AgentGo 화면만 1차 구현되었습니다.
              </div>
            </div>
          ) : (
            <div style={styles.homePanel}>
              {isHomeEmpty ? (
                <div style={styles.emptyHero}>
                  <img
                    src={fallbackLogo}
                    alt="AgentGo"
                    style={styles.emptyHeroLogo}
                  />
                  <h1
                    style={{
                      ...styles.emptyHeroTitle,
                      color: theme.primaryText,
                    }}
                  >
                    무엇을 도와드릴까요?
                  </h1>
                  <p
                    style={{
                      ...styles.emptyHeroSub,
                      color: theme.secondaryText,
                    }}
                  >
                    원하는 작업을 선택하거나 입력해보세요.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    ...styles.chatArea,
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    boxShadow: theme.cardShadow,
                  }}
                >
                  <div style={styles.chatScroll}>
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        theme={theme}
                      />
                    ))}
                    <div ref={messageBottomRef} />
                  </div>
                </div>
              )}

              <Composer
                theme={theme}
                text={composerText}
                setText={setComposerText}
                attachedFiles={attachedFiles}
                onAttachClick={() => fileInputRef.current?.click()}
                onRemoveFile={removeAttachedFile}
                onSend={() => sendMessage()}
                onToggleMic={() => setIsMicActive((prev) => !prev)}
                isMicActive={isMicActive}
                canSend={Boolean(normalizedComposer)}
              />

              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />

              {isHomeEmpty ? (
                <>
                  <div style={styles.homeTabs}>
                    {HOME_TABS.map((tab) => {
                      const isActive = activeHomeTab === tab;

                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveHomeTab(tab)}
                          style={{
                            ...styles.homeTabButton,
                            backgroundColor: isActive
                              ? theme.tabActiveBackground
                              : theme.tabBackground,
                            color: isActive
                              ? theme.tabActiveText
                              : theme.tabText,
                            border: `1px solid ${
                              isActive ? theme.accent : theme.border
                            }`,
                          }}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  <div style={styles.quickActionGrid}>
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleQuickAction(action.label)}
                        style={{
                          ...styles.quickActionCard,
                          backgroundColor: theme.surface,
                          border: `1px solid ${theme.border}`,
                          boxShadow: theme.softShadow,
                        }}
                      >
                        <span
                          style={{
                            ...styles.quickActionIcon,
                            backgroundColor: theme.iconSoftBackground,
                            color: theme.accent,
                          }}
                        >
                          <Icon name={action.icon} size={18} />
                        </span>
                        <span
                          style={{
                            ...styles.quickActionText,
                            color: theme.primaryText,
                          }}
                        >
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ThemeToggle({ isDarkMode, onToggle, theme }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="테마 전환"
      title="테마 전환"
      style={{
        ...styles.themeToggleButton,
        backgroundColor: isDarkMode
          ? theme.toggleTrackDark
          : theme.toggleTrackLight,
        border: `1px solid ${
          isDarkMode ? theme.toggleBorderDark : theme.toggleBorderLight
        }`,
        boxShadow: theme.softShadow,
        justifyContent: isDarkMode ? "flex-end" : "flex-start",
      }}
    >
      <span
        style={{
          ...styles.themeToggleThumb,
          backgroundColor: isDarkMode
            ? theme.toggleThumbDark
            : theme.toggleThumbLight,
          color: isDarkMode ? theme.toggleIconDark : theme.toggleIconLight,
        }}
      />
    </button>
  );
}

function Composer({
  theme,
  text,
  setText,
  attachedFiles,
  onAttachClick,
  onRemoveFile,
  onSend,
  onToggleMic,
  isMicActive,
  canSend,
}) {
  return (
    <div
      style={{
        ...styles.composerWrap,
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
        boxShadow: theme.cardShadow,
      }}
    >
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="AgentGo에게 물어보세요."
        style={{
          ...styles.composerTextarea,
          color: theme.primaryText,
          backgroundColor: "transparent",
        }}
      />

      {attachedFiles.length > 0 ? (
        <div style={styles.attachmentList}>
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              style={{
                ...styles.attachmentChip,
                backgroundColor: theme.fileChipBackground,
                border: `1px solid ${theme.border}`,
                color: theme.primaryText,
              }}
            >
              <span style={styles.attachmentChipName}>{file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveFile(file.id)}
                style={{
                  ...styles.attachmentChipRemove,
                  color: theme.secondaryText,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div
        style={{
          ...styles.composerBottomBar,
          borderTop: `1px solid ${theme.borderSoft}`,
        }}
      >
        <div style={styles.composerLeftActions}>
          <button
            type="button"
            onClick={onAttachClick}
            style={{
              ...styles.composerIconButton,
              backgroundColor: theme.iconSoftBackground,
              color: theme.secondaryText,
            }}
          >
            <Icon name="attach" size={18} />
          </button>
        </div>

        <div style={styles.composerRightActions}>
          <button
            type="button"
            onClick={onToggleMic}
            style={{
              ...styles.composerIconButton,
              backgroundColor: isMicActive
                ? theme.micActiveBackground
                : theme.iconSoftBackground,
              color: isMicActive ? theme.accent : theme.secondaryText,
              animation: isMicActive
                ? "agentgoMicPulse 1.2s infinite ease-in-out"
                : "none",
            }}
          >
            <Icon name="mic" size={18} />
          </button>

          <button
            type="button"
            style={{
              ...styles.recordButton,
              backgroundColor: theme.surface,
              color: theme.primaryText,
              border: `1px solid ${theme.border}`,
            }}
          >
            녹음
          </button>

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            style={{
              ...styles.sendButton,
              backgroundColor: canSend
                ? theme.sendButtonBackground
                : theme.sendButtonDisabled,
              color: canSend ? theme.sendButtonText : theme.sendButtonDisabledText,
              cursor: canSend ? "pointer" : "not-allowed",
            }}
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, theme }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        ...styles.messageRow,
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          ...styles.messageBubble,
          backgroundColor: isUser
            ? theme.userBubbleBackground
            : theme.assistantBubbleBackground,
          color: isUser ? theme.userBubbleText : theme.assistantBubbleText,
          border: `1px solid ${
            isUser ? theme.userBubbleBorder : theme.assistantBubbleBorder
          }`,
        }}
      >
        <div style={styles.messageText}>{message.content}</div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, theme }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        ...styles.inlineToggle,
        backgroundColor: checked
          ? theme.toggleMiniTrackActive
          : theme.toggleMiniTrackInactive,
      }}
    >
      <span
        style={{
          ...styles.inlineToggleThumb,
          transform: checked ? "translateX(18px)" : "translateX(2px)",
          backgroundColor: theme.toggleMiniThumb,
        }}
      />
    </button>
  );
}

function resolveAgentIcon(id) {
  switch (id) {
    case "mail_receive":
    case "mail_send":
      return "mail";
    case "calendar":
      return "calendar";
    case "ai_web_search":
      return "summary";
    case "todo":
      return "activity";
    default:
      return "settings";
  }
}

function Icon({ name, size = 18 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  switch (name) {
    case "summary":
      return (
        <svg {...props}>
          <path d="M7 4.5h8l3 3v12H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M15 4.5v3h3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M10 12h5M10 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "activity":
      return (
        <svg {...props}>
          <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 16V11M12 16V7M16 16V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M19 12a7 7 0 0 0-.08-1l1.72-1.34-1.5-2.6-2.05.54a7.2 7.2 0 0 0-1.72-1L15 4h-3l-.37 2.6a7.2 7.2 0 0 0-1.72 1l-2.05-.54-1.5 2.6L8.08 11a7 7 0 0 0 0 2l-1.72 1.34 1.5 2.6 2.05-.54c.53.42 1.1.76 1.72 1L12 20h3l.37-2.6c.62-.24 1.2-.58 1.72-1l2.05.54 1.5-2.6L18.92 13c.05-.33.08-.66.08-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      );
    case "attach":
      return (
        <svg {...props}>
          <path d="M9 12.5 14.8 6.7a3 3 0 0 1 4.2 4.2l-7.6 7.6a5 5 0 0 1-7.1-7.1l7.2-7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "mic":
      return (
        <svg {...props}>
          <rect x="9" y="4" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3M9 20h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "send":
      return (
        <svg {...props}>
          <path d="M12 5v14M12 5l-5 5M12 5l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...props}>
          <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "quick":
      return (
        <svg {...props}>
          <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="4.5" y="6" width="15" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m5.5 8 6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="4.5" y="5.5" width="15" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 4.5v3M16 4.5v3M4.5 9.5h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "policy":
      return (
        <svg {...props}>
          <path d="M6 5.5h11a2 2 0 0 1 2 2v11H8a2 2 0 0 0-2 2V5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 8.5h7M8 12h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
}

const styles = {
  workspaceShell: {
    minHeight: "100vh",
    display: "flex",
  },
  workspaceMain: {
    flex: 1,
    minWidth: 0,
    position: "relative",
  },
  workspaceTopBar: {
    position: "absolute",
    top: "8px",
    right: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    zIndex: 15,
  },
  dropdownWrap: {
    position: "relative",
  },
  topActionButton: {
    height: "38px",
    borderRadius: "10px",
    padding: "0 12px",
    cursor: "pointer",
  },
  topActionButtonInner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 700,
  },
  dropdownPanel: {
    position: "absolute",
    top: "46px",
    right: 0,
    width: "286px",
    borderRadius: "14px",
    overflow: "hidden",
  },
  agentDropdownScroll: {
    maxHeight: "342px",
    overflowY: "auto",
  },
  agentRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
  },
  agentLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },
  agentIconBox: {
    width: "24px",
    height: "24px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  agentLabel: {
    fontSize: "14px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "160px",
  },
  agentRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  agentStateText: {
    fontSize: "12px",
    fontWeight: 700,
  },
  inlineToggle: {
    width: "44px",
    height: "24px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    padding: 0,
  },
  inlineToggleThumb: {
    width: "20px",
    height: "20px",
    borderRadius: "999px",
    position: "absolute",
    top: "2px",
    left: 0,
    transition: "transform 0.2s ease",
  },
  workspaceBody: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    padding: "72px 24px 32px 24px",
  },
  homePanel: {
    width: "100%",
    maxWidth: "760px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
  },
  emptyHero: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "80px",
    marginBottom: "4px",
  },
  emptyHeroLogo: {
    width: "78px",
    height: "78px",
    objectFit: "contain",
    marginBottom: "18px",
  },
  emptyHeroTitle: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 800,
    lineHeight: 1.2,
  },
  emptyHeroSub: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "18px",
    fontWeight: 600,
  },
  composerWrap: {
    width: "100%",
    borderRadius: "16px",
    padding: "12px 12px 0 12px",
  },
  composerTextarea: {
    width: "100%",
    minHeight: "88px",
    maxHeight: "220px",
    border: "none",
    resize: "vertical",
    fontSize: "16px",
    lineHeight: 1.6,
    outline: "none",
    fontFamily: '"SUIT", Arial, sans-serif',
  },
  attachmentList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "10px",
  },
  attachmentChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    borderRadius: "999px",
    fontSize: "13px",
  },
  attachmentChipName: {
    maxWidth: "260px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  attachmentChipRemove: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    lineHeight: 1,
  },
  composerBottomBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "54px",
    marginTop: "6px",
  },
  composerLeftActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  composerRightActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  composerIconButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  recordButton: {
    minWidth: "52px",
    height: "34px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
  },
  sendButton: {
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  homeTabs: {
    width: "100%",
    display: "flex",
    gap: "8px",
    marginTop: "4px",
  },
  homeTabButton: {
    height: "32px",
    padding: "0 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  quickActionGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  quickActionCard: {
    height: "62px",
    borderRadius: "14px",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    cursor: "pointer",
  },
  quickActionIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  quickActionText: {
    fontSize: "15px",
    fontWeight: 700,
    lineHeight: 1.4,
  },
  placeholderCard: {
    width: "100%",
    maxWidth: "720px",
    borderRadius: "18px",
    padding: "40px 28px",
    marginTop: "90px",
    textAlign: "center",
  },
  placeholderTitle: {
    fontSize: "24px",
    fontWeight: 800,
    marginBottom: "10px",
  },
  placeholderSub: {
    fontSize: "15px",
  },
  chatArea: {
    width: "100%",
    borderRadius: "18px",
    minHeight: "420px",
    padding: "18px",
    marginTop: "14px",
  },
  chatScroll: {
    maxHeight: "calc(100vh - 330px)",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    paddingRight: "4px",
  },
  messageRow: {
    display: "flex",
    width: "100%",
  },
  messageBubble: {
    maxWidth: "78%",
    borderRadius: "18px",
    padding: "14px 16px",
  },
  messageText: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "15px",
    lineHeight: 1.65,
  },
  themeToggleButton: {
    width: "78px",
    height: "44px",
    borderRadius: "999px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
    transition: "all 0.2s ease",
  },
  themeToggleThumb: {
    width: "36px",
    height: "36px",
    borderRadius: "999px",
    transition: "all 0.2s ease",
  },
};