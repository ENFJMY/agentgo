import { useMemo } from "react";

const DEFAULT_THEME = {
  workspaceBackground: "#f4f6fb",
  surface: "#ffffff",
  border: "#dbe2ef",
  borderSoft: "#e8edf5",
  primaryText: "#17223b",
  secondaryText: "#4f5c78",
  accent: "#2f6fff",
  mutedBackground: "#f1f4fa",
  warning: "#f5a623",
  success: "#23a55a",
};

const DEFAULT_SUMMARY_DATA = {
  schedule: [],
  mails: [],
  news: {
    sections: [],
    categoryLabel: "IT",
    extraCategories: [],
  },
  todos: [],
};

function formatToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Icon({ name, size = 16, color = "currentColor" }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  switch (name) {
    case "calendar":
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="15" rx="2.5" stroke={color} strokeWidth="1.8" />
          <path d="M4 9.5h16" stroke={color} strokeWidth="1.8" />
          <path d="M8 3.8v3.4M16 3.8v3.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="3.5" y="5" width="17" height="14" rx="2.5" stroke={color} strokeWidth="1.8" />
          <path d="m4.5 7 7.5 5.8L19.5 7" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "news":
      return (
        <svg {...props}>
          <rect x="4" y="4.5" width="16" height="15" rx="2.5" stroke={color} strokeWidth="1.8" />
          <path d="M8 9h8M8 12h8M8 15h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "todo":
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="15" rx="2.5" stroke={color} strokeWidth="1.8" />
          <path d="m8 12 2.2 2.2L16 8.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8" />
          <path d="M12 8v4l2.8 1.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8.5" r="2.5" fill={color} />
          <path d="M7.5 18a4.5 4.5 0 0 1 9 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "info":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
          <path d="M12 10.1v6M12 7.2h.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...props}>
          <path d="m7 10 5 5 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="m6 6 12 12M18 6 6 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function SummaryBox({ theme, icon, title, children, boxStyle = null }) {
  return (
    <section
      style={{
        ...styles.box,
        ...(boxStyle || {}),
        backgroundColor: theme.surface,
        border: `1px solid ${theme.border}`,
      }}
    >
      <header style={{ ...styles.boxHeader, borderBottom: `1px solid ${theme.borderSoft}` }}>
        <div style={styles.boxHeaderLeft}>
          <span
            style={{
              ...styles.iconBadge,
              backgroundColor: theme.mutedBackground,
              color: theme.accent,
            }}
          >
            <Icon name={icon} size={14} />
          </span>
          <h3 style={{ ...styles.boxTitle, color: theme.primaryText }}>{title}</h3>
        </div>
        <button type="button" style={{ ...styles.moreButton, color: theme.accent }}>
          + 더보기
        </button>
      </header>
      {children}
    </section>
  );
}

export default function WorksummaryPage({ theme = DEFAULT_THEME, summaryData = null }) {
  const mergedTheme = { ...DEFAULT_THEME, ...theme };
  const data = summaryData ? { ...DEFAULT_SUMMARY_DATA, ...summaryData } : DEFAULT_SUMMARY_DATA;

  const todoCounts = useMemo(() => {
    return {
      dueToday: (data.todos || []).filter((item) => item.status === "오늘까지").length,
      planned: (data.todos || []).filter((item) => item.status === "예정").length,
      done: (data.todos || []).filter((item) => item.status === "완료").length,
    };
  }, [data.todos]);

  const todayLabel = formatToday();
  const newsSections = data.news?.sections || [];
  const newsCategoryLabel = data.news?.categoryLabel || "IT";
  const newsExtraCategories = data.news?.extraCategories || [];

  return (
    <main style={{ ...styles.page, backgroundColor: mergedTheme.workspaceBackground }}>
      <section
        style={{
          ...styles.topBanner,
          background: "linear-gradient(135deg, #b9cdf3 0%, #cad7f1 100%)",
          border: `1px solid ${mergedTheme.border}`,
        }}
      >
        <span style={styles.topBannerIcon}>🗂️</span>
        <strong style={{ ...styles.topBannerText, color: mergedTheme.primaryText }}>
          오늘의 업무 요약
        </strong>
      </section>

      <div style={styles.grid}>
        <SummaryBox theme={mergedTheme} icon="calendar" title="오늘의 일정">
          <div style={styles.scrollArea}>
            {(data.schedule || []).map((item, idx) => (
              <article
                key={`schedule-${idx}`}
                style={{
                  ...styles.innerCard,
                  backgroundColor: mergedTheme.mutedBackground,
                }}
              >
                <p style={{ ...styles.innerTitle, color: mergedTheme.primaryText }}>{item.title}</p>
                <p style={{ ...styles.innerMeta, color: mergedTheme.secondaryText }}>
                  <Icon name="clock" size={12} />
                  <span>{item.time}</span>
                </p>
              </article>
            ))}
          </div>
        </SummaryBox>

        <SummaryBox theme={mergedTheme} icon="mail" title="오늘의 메일">
          <div style={styles.scrollArea}>
            {(data.mails || []).map((item, idx) => (
              <article
                key={`mail-${idx}`}
                style={{
                  ...styles.innerCard,
                  backgroundColor: mergedTheme.mutedBackground,
                  borderLeft: `2px solid ${mergedTheme.accent}`,
                }}
              >
                <p style={{ ...styles.innerSender, color: mergedTheme.primaryText }}>
                  <Icon name="user" size={11} />
                  <span>{item.sender}</span>
                </p>
                <p style={{ ...styles.innerTitle, color: mergedTheme.primaryText }}>{item.subject}</p>
                <p style={{ ...styles.innerMeta, color: mergedTheme.secondaryText }}>
                  <Icon name="clock" size={12} />
                  <span>{item.time}</span>
                </p>
              </article>
            ))}
          </div>
        </SummaryBox>

        <SummaryBox theme={mergedTheme} icon="news" title="오늘의 뉴스 요약" boxStyle={styles.tallBox}>
          <div
            style={{
              ...styles.newsContentWrap,
              borderTop: `1px solid ${mergedTheme.borderSoft}`,
            }}
          >
            <div style={styles.newsToolbar}>
              <span style={{ ...styles.newsToolbarIcon, color: mergedTheme.secondaryText }}>
                <Icon name="info" size={14} />
              </span>
              <button
                type="button"
                style={{
                  ...styles.newsDateButton,
                  border: `1px solid ${mergedTheme.border}`,
                  color: mergedTheme.primaryText,
                  backgroundColor: mergedTheme.surface,
                }}
              >
                <span>{todayLabel}</span>
                <Icon name="chevron-down" size={12} color={mergedTheme.secondaryText} />
              </button>
              <button type="button" style={{ ...styles.newsCloseButton, color: mergedTheme.secondaryText }}>
                <Icon name="close" size={14} />
              </button>
            </div>

            <div style={styles.newsScroll}>
              <div
                style={{
                  ...styles.newsBody,
                  backgroundColor: mergedTheme.mutedBackground,
                }}
              >
                <div style={styles.newsCategoryBlock}>
                  <span
                    style={{
                      ...styles.newsChip,
                      color: mergedTheme.accent,
                      border: `1px solid ${mergedTheme.accent}`,
                      backgroundColor: "rgba(47,111,255,0.08)",
                    }}
                  >
                    {newsCategoryLabel}
                  </span>

                  {newsSections.map((section, idx) => (
                    <div key={`news-section-${idx}`} style={styles.newsSection}>
                      <h4 style={{ ...styles.newsSectionTitle, color: mergedTheme.primaryText }}>{section.title}</h4>
                      {(section.lines || []).map((line, lineIdx) => (
                        <p
                          key={`news-line-${idx}-${lineIdx}`}
                          style={{ ...styles.newsLine, color: mergedTheme.primaryText }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                {newsExtraCategories.map((category, categoryIdx) => (
                  <div key={`news-category-${categoryIdx}`} style={styles.newsCategoryBlock}>
                    <span
                      style={{
                        ...styles.newsChip,
                        color: mergedTheme.accent,
                        border: `1px solid ${mergedTheme.accent}`,
                        backgroundColor: "rgba(47,111,255,0.08)",
                      }}
                    >
                      {category.label}
                    </span>

                    {(category.sections || []).map((section, idx) => (
                      <div key={`news-extra-${categoryIdx}-${idx}`} style={styles.newsSection}>
                        <h4 style={{ ...styles.newsSectionTitle, color: mergedTheme.primaryText }}>{section.title}</h4>
                        {(section.lines || []).map((line, lineIdx) => (
                          <p
                            key={`news-extra-line-${categoryIdx}-${idx}-${lineIdx}`}
                            style={{ ...styles.newsLine, color: mergedTheme.primaryText }}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SummaryBox>

        <SummaryBox theme={mergedTheme} icon="todo" title="할 일" boxStyle={styles.tallBox}>
          <div style={{ ...styles.todoStatusRow, borderBottom: `1px solid ${mergedTheme.borderSoft}` }}>
            <button type="button" style={{ ...styles.todoStatusButton, color: mergedTheme.accent }}>
              오늘까지 <strong>{todoCounts.dueToday}</strong>
            </button>
            <button type="button" style={{ ...styles.todoStatusButton, color: mergedTheme.warning }}>
              예정 <strong>{todoCounts.planned}</strong>
            </button>
            <button type="button" style={{ ...styles.todoStatusButton, color: mergedTheme.success }}>
              완료 <strong>{todoCounts.done}</strong>
            </button>
          </div>

          <div style={styles.scrollArea}>
            {(data.todos || []).map((item, idx) => (
              <article
                key={`todo-${idx}`}
                style={{
                  ...styles.innerCard,
                  backgroundColor: mergedTheme.mutedBackground,
                }}
              >
                <p style={{ ...styles.innerTitle, color: mergedTheme.primaryText }}>{item.title}</p>
                <div style={styles.todoMetaRow}>
                  <span
                    style={{
                      ...styles.todoBadge,
                      color:
                        item.status === "완료"
                          ? mergedTheme.success
                          : item.status === "예정"
                            ? mergedTheme.warning
                            : mergedTheme.accent,
                    }}
                  >
                    {item.status}
                  </span>
                  <span style={{ ...styles.todoDue, color: mergedTheme.secondaryText }}>{item.due}</span>
                </div>
              </article>
            ))}
          </div>
        </SummaryBox>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    padding: "18px 16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "left",
  },
  topBanner: {
    height: "56px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 18px",
  },
  topBannerIcon: {
    fontSize: "18px",
    lineHeight: 1,
  },
  topBannerText: {
    fontSize: "18px",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px",
  },
  box: {
    borderRadius: "6px",
    height: "350px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    textAlign: "left",
  },
  tallBox: {
    height: "430px",
  },
  boxHeader: {
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
  },
  boxHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },
  iconBadge: {
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  boxTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  moreButton: {
    border: "none",
    background: "transparent",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minHeight: 0,
  },
  innerCard: {
    borderRadius: "5px",
    padding: "9px 10px",
    minHeight: "92px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "5px",
    textAlign: "left",
  },
  innerTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 700,
    lineHeight: 1.4,
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  innerMeta: {
    margin: 0,
    fontSize: "15px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  innerSender: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  newsContentWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  newsToolbar: {
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "0 10px",
  },
  newsToolbarIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  newsDateButton: {
    borderRadius: "5px",
    height: "30px",
    minWidth: "140px",
    padding: "0 10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  newsCloseButton: {
    border: "none",
    background: "transparent",
    width: "18px",
    height: "18px",
    padding: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  newsScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "8px",
  },
  newsBody: {
    minHeight: "100%",
    borderRadius: "6px",
    padding: "18px 18px 20px",
    textAlign: "left",
  },
  newsChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    padding: "3px 10px",
    fontSize: "15px",
    fontWeight: 700,
    marginBottom: "10px",
  },
  newsSection: {
    marginBottom: "14px",
  },
  newsCategoryBlock: {
    marginBottom: "14px",
  },
  newsSectionTitle: {
    margin: "0 0 4px",
    fontSize: "15px",
    fontWeight: 800,
    letterSpacing: "-0.01em",
    textAlign: "left",
  },
  newsLine: {
    margin: "0 0 2px",
    fontSize: "15px",
    lineHeight: 1.5,
    textAlign: "left",
  },
  todoStatusRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px 4px",
  },
  todoStatusButton: {
    border: "none",
    background: "transparent",
    fontSize: "15px",
    fontWeight: 700,
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },
  todoMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  todoBadge: {
    fontSize: "15px",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "999px",
    background: "rgba(47, 111, 255, 0.1)",
  },
  todoDue: {
    fontSize: "15px",
    fontWeight: 600,
    textAlign: "left",
  },
};
