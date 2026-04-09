import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import WorksummaryPage from "./WorksummaryPage";

const HOME_TABS = ["빠른 작업", "업무 자동화", "외부 도구"];

const QUICK_ACTIONS = [
  { id: "work-time", label: "근로 시간 등록해줘", icon: "clock" },
  { id: "schedule", label: "오늘 일정 알려줘", icon: "calendar" },
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
  session,
  currentClient,
  fallbackLogo,
  onLogout,
  agentsSeed,
  findBotAnswer,
  getChatStorageKey,
  getAgentStorageKey,
  workSummaryData,
  quickQuestionList = [],
}) {
  const [activeMenu, setActiveMenu] = useState("home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeHomeTab, setActiveHomeTab] = useState("빠른 작업");
  const [messages, setMessages] = useState([]);
  const [composerText, setComposerText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isMicActive, setIsMicActive] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  const filteredAgents = useMemo(() => {
    return agentsSeed.filter((agent) => 
      (session.visibleAgents || []).includes(agent.id)
    );
  }, [agentsSeed, session.visibleAgents]);

  const [agentStates, setAgentStates] = useState(filteredAgents);

  const topRightRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageBottomRef = useRef(null);

  const chatStorageKey = getChatStorageKey(session);
  const agentStorageKey = getAgentStorageKey(session);

  useEffect(() => {
    const savedAgentStates = readStorage(agentStorageKey, []);
    const mergedAgentStates = filteredAgents.map((agent) => {
      const saved = savedAgentStates.find((s) => s.id === agent.id);
      return saved ? { ...agent, enabled: saved.enabled } : agent;
    });
    setAgentStates(mergedAgentStates);
    setMessages(readStorage(chatStorageKey, []));
    setActiveMenu("home");
    setComposerText("");
    setAttachedFiles([]);
    setOpenDropdown(null);
    setIsMicActive(false);
  }, [chatStorageKey, agentStorageKey, filteredAgents]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const quickQuestions = useMemo(() => {
    return Array.isArray(quickQuestionList) ? quickQuestionList : [];
  }, [quickQuestionList]);
  const [copiedKey, setCopiedKey] = useState("");

  const markCopied = (key) => {
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? "" : prev));
    }, 1200);
  };

  const copyTextToClipboard = async (text, key) => {
    const value = String(text || "");
    if (!value.trim()) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      markCopied(key);
    } catch {
      // Ignore clipboard errors in unsupported environments.
    }
  };

  const handleCopyAllQuestions = () => {
    copyTextToClipboard(quickQuestions.join("\n"), "all");
  };

  const handleCopyQuestion = (question, index) => {
    copyTextToClipboard(question, `q-${index}`);
  };

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

    const replyPayload = findBotAnswer(session.clientId, rawText);
    const delaySeconds = Math.max(0, parseFloat(replyPayload.delay) || 3);
    const targetAgent = replyPayload.agentId
      ? agentStates.find((item) => item.id === replyPayload.agentId)
      : null;
    const answerText = targetAgent && !targetAgent.enabled
      ? `${targetAgent.label} 에이전트가 비활성화되어 있어, 도움을 드리기 어렵습니다.\n${targetAgent.label} 에이전트를 활성화하거나 관리자에게 문의해주세요.`
      : replyPayload.answer;

    // 로딩 메시지를 먼저 표시
    setTimeout(() => {
      const loadingMessage = {
        id: makeId("loading"),
        role: "assistant",
        content: "답변을 생성 중입니다...",
        isLoading: true,
        attachments: [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, loadingMessage]);

      // delaySeconds 후 실제 답변으로 교체
      setTimeout(() => {
        const botMessage = {
          id: makeId("assistant"),
          role: "assistant",
          content: answerText,
          richHtml: replyPayload.richHtml || null,
          isLoading: false,
          attachments: [],
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.isLoading) {
            newMessages[newMessages.length - 1] = botMessage;
          }
          return newMessages;
        });
      }, delaySeconds * 1000);
    }, 350);
  };

  const handleQuickAction = (text) => {
    setComposerText(text);
    setTimeout(() => {
      sendMessage(text);
    }, 0);
  };

  const appendAttachedFiles = (fileList) => {
    const files = Array.from(fileList || []).map((file) => ({
      id: makeId("file"),
      name: file.name,
    }));

    if (files.length > 0) {
      setAttachedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileSelect = (event) => {
    appendAttachedFiles(event.target.files);

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

  // 반응형 스타일 계산
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;
  const responsiveStyles = {
    workspaceBodyPadding: "72px 16px 32px 16px",
    homePanelPadding: isMobile ? "0 16px" : isTablet ? "0 20px" : "0 24px",
    quickActionGridColumns: isMobile ? "1fr" : "1fr 1fr",
    homePanelGap: isMobile ? "12px" : "18px",
  };

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
        {activeMenu === "home" ? (
        <div style={styles.workspaceTopBar} ref={topRightRef}>
          <div style={styles.dropdownWrap}>
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((prev) => (prev === "help" ? null : "help"))
              }
              style={{
                ...styles.helpIconButton,
                backgroundColor: theme.surface,
                color: theme.secondaryText,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.softShadow,
              }}
              aria-label="빠른 작업 도움말"
            >
              <Icon name="help" size={14} />
            </button>

            {openDropdown === "help" ? (
              <div
                style={{
                  ...styles.dropdownPanel,
                  left: "auto",
                  right: 0,
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.dropdownShadow,
                  maxHeight: "342px",
                }}
              >
                <div style={styles.quickDropdownScroll}>
                  <div
                    style={{
                      ...styles.quickDropdownHeader,
                      borderBottom: `1px solid ${theme.borderSoft}`,
                    }}
                  >
                    <span
                      style={{
                        ...styles.quickHeaderLabel,
                        color: theme.primaryText,
                      }}
                    >
                      전체
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAllQuestions}
                      title={copiedKey === "all" ? "전체 복사됨" : "전체 리스트 복사"}
                      aria-label={copiedKey === "all" ? "전체 복사됨" : "전체 리스트 복사"}
                      style={{
                        ...styles.quickCopyAllButton,
                        ...(copiedKey === "all" ? styles.quickCopyDoneButton : null),
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.surface,
                        color: copiedKey === "all" ? theme.accent : theme.primaryText,
                      }}
                    >
                      {copiedKey === "all" ? (
                        <span style={styles.quickCopyDoneLabel}>복사됨</span>
                      ) : (
                        <Icon name="copy" size={14} />
                      )}
                    </button>
                  </div>

                  {quickQuestions.length > 0 ? (
                    quickQuestions.map((question, index) => (
                      <div
                        key={`quick-question-${index}`}
                        style={{
                          ...styles.quickQuestionRow,
                          borderBottom: `1px solid ${theme.borderSoft}`,
                          color: theme.primaryText,
                        }}
                      >
                        <span
                          style={{
                            ...styles.quickQuestionBullet,
                            color: theme.accent,
                          }}
                        >
                          •
                        </span>
                        <span style={styles.quickQuestionText}>{question}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyQuestion(question, index)}
                          title={copiedKey === `q-${index}` ? "복사됨" : "복사"}
                          aria-label={copiedKey === `q-${index}` ? "복사됨" : "복사"}
                          style={{
                            ...styles.quickCopyItemButton,
                            ...(copiedKey === `q-${index}` ? styles.quickCopyDoneButton : null),
                            border: `1px solid ${theme.border}`,
                            backgroundColor: theme.surface,
                            color: copiedKey === `q-${index}` ? theme.accent : theme.primaryText,
                          }}
                        >
                          {copiedKey === `q-${index}` ? (
                            <span style={styles.quickCopyDoneLabel}>복사됨</span>
                          ) : (
                            <Icon name="copy" size={13} />
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        ...styles.quickQuestionEmpty,
                        color: theme.secondaryText,
                      }}
                    >
                      등록된 질문이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

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
        ) : null}

        <div
          style={{
            ...styles.workspaceBody,
            padding: activeMenu === "daily-summary"
              ? "18px 12px 24px"
              : responsiveStyles.workspaceBodyPadding,
          }}
        >
          <div style={styles.workspaceContent}>
            {activeMenu === "daily-summary" ? (
              <div style={styles.summaryPageWrap}>
                <WorksummaryPage theme={theme} summaryData={workSummaryData} />
              </div>
            ) : activeMenu !== "home" ? (
              <div
                style={{
                  ...styles.placeholderCard,
                  backgroundColor: theme.surface,
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
              <div style={{ ...styles.homePanel, maxWidth: "1126px", gap: responsiveStyles.homePanelGap, padding: responsiveStyles.homePanelPadding }}>
                <div style={isHomeEmpty ? styles.homeContentEmpty : styles.homeContent}>
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
                      style={styles.chatArea}
                    >
                      <div style={styles.chatScroll}>
                        {messages.map((message) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            theme={theme}
                            assistantIcon={fallbackLogo}
                          />
                        ))}
                        <div ref={messageBottomRef} />
                      </div>
                    </div>
                  )}
                </div>

                {isHomeEmpty ? (
                  <div
                    style={{
                      ...styles.homeQuickSection,
                      marginTop: isMobile ? "56px" : "clamp(120px, 22vh, 260px)",
                    }}
                  >
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
                            border: "none",
                          }}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ ...styles.quickActionGrid, gridTemplateColumns: responsiveStyles.quickActionGridColumns }}>
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleQuickAction(action.label)}
                        style={{
                          ...styles.quickActionCard,
                          backgroundColor: theme.surface,
                          border: "none",
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
                </div>
              ) : null}
            </div>
          )}
        </div>

        {activeMenu === "home" ? (
          <>
            <Composer
              theme={theme}
              text={composerText}
              setText={setComposerText}
              attachedFiles={attachedFiles}
              onAttachClick={() => fileInputRef.current?.click()}
              onDropFiles={appendAttachedFiles}
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
          </>
        ) : null}
        </div>
      </main>
    </div>
  );
}

function Composer({
  theme,
  text,
  setText,
  attachedFiles,
  onAttachClick,
  onDropFiles,
  onRemoveFile,
  onSend,
  onToggleMic,
  isMicActive,
  canSend,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event) => {
    const next = event.relatedTarget;
    if (next && event.currentTarget.contains(next)) {
      return;
    }
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    onDropFiles(event.dataTransfer?.files);
  };

  return (
    <div
      style={{
        ...styles.composerWrap,
        backgroundColor: theme.surface,
        border: `1px solid ${isDragOver ? theme.accent : theme.border}`,
        boxShadow: theme.cardShadow,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
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

function MessageBubble({ message, theme, assistantIcon }) {
  const isUser = message.role === "user";
  const isLoading = message.isLoading;

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
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <img
              src={assistantIcon}
              alt="AgentGo"
              style={styles.assistantLogo}
            />
            <span style={styles.loadingText}>{message.content}</span>
          </div>
        ) : isUser ? (
          <div style={styles.messageText}>{message.content}</div>
        ) : (
          <div style={styles.assistantMessageInner}>
            <img
              src={assistantIcon}
              alt="AgentGo"
              style={styles.assistantLogo}
            />
            <div style={styles.messageText}>
              {message.richHtml ? (
                <div
                  style={styles.richHtmlContent}
                  dangerouslySetInnerHTML={{ __html: message.richHtml }}
                />
              ) : (
                message.content
              )}
            </div>
          </div>
        )}
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
    case "contract_review":
      return "policy";
    case "meeting_summary":
    case "document_summary":
    case "revenue_checklist":
      return "summary";
    case "corporate_card":
      return "policy";
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
    case "help":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9.5 9.8a2.5 2.5 0 1 1 4.2 1.8c-.8.7-1.7 1.2-1.7 2.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="16.9" r="1" fill="currentColor" />
        </svg>
      );
    case "copy":
      return (
        <svg {...props}>
          <rect x="9" y="8" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="5" y="4" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
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
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    position: "relative",
    height: "100vh",
    overflow: "hidden",
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
  helpIconButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
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
  quickDropdownScroll: {
    maxHeight: "342px",
    overflowY: "auto",
    textAlign: "left",
  },
  quickDropdownHeader: {
    padding: "8px 10px",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "8px",
  },
  quickHeaderLabel: {
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1,
  },
  quickCopyAllButton: {
    width: "30px",
    height: "30px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    padding: 0,
    cursor: "pointer",
  },
  quickQuestionRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    lineHeight: 1.45,
    textAlign: "left",
  },
  quickQuestionBullet: {
    lineHeight: 1.2,
    fontWeight: 800,
    paddingTop: "1px",
  },
  quickQuestionText: {
    flex: 1,
    minWidth: 0,
    textAlign: "left",
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
  quickCopyItemButton: {
    width: "28px",
    height: "28px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    padding: 0,
    cursor: "pointer",
    flexShrink: 0,
  },
  quickCopyDoneButton: {
    width: "auto",
    minWidth: "58px",
    padding: "0 8px",
  },
  quickCopyDoneLabel: {
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: 1,
  },
  quickQuestionEmpty: {
    padding: "14px 12px",
    fontSize: "13px",
    textAlign: "left",
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
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: 0,
    overflow: "hidden",
  },
  workspaceContent: {
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: 0,
    overflowY: "auto",
  },
  summaryPageWrap: {
    width: "100%",
    maxWidth: "100%",
    minHeight: 0,
  },
  homePanel: {
    width: "100%",
    maxWidth: "1126px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    flex: 1,
    minHeight: 0,
    position: "relative",
    overflow: "visible",
  },
  homeContent: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "visible",
  },
  homeContentEmpty: {
    display: "flex",
    flexDirection: "column",
    overflow: "visible",
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
    maxWidth: "1126px",
    margin: "0 auto",
    borderRadius: "16px",
    padding: "12px 12px 0 12px",
    position: "sticky",
    bottom: 0,
    zIndex: 12,
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
  homeQuickSection: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
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
    border: "none",
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
    borderRadius: "0",
    padding: "0",
    marginTop: "14px",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "visible",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
  chatScroll: {
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
    textAlign: "left",
  },
  richHtmlContent: {
    whiteSpace: "normal",
    wordBreak: "normal",
  },
  assistantMessageInner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  assistantLogo: {
    width: "32px",
    height: "32px",
    borderRadius: "12px",
    objectFit: "cover",
    marginTop: "2px",
    flexShrink: 0,
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  loadingIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  loadingText: {
    fontSize: "15px",
    lineHeight: 1.65,
    animation: "agentgoBlinking 1.2s infinite ease-in-out",
  },
};