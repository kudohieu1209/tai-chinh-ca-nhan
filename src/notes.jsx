// ============================================================
// notes.jsx — Financial notes
// ============================================================

// Notes — freeform financial reminders and decisions

function Notes({ notes = "", onSaveNotes }) {
  const t = useT();
  const [draft, setDraft] = useState(notes || "");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    setDraft(notes || "");
  }, [notes]);

  useEffect(() => {
    const next = draft || "";
    if (next === (notes || "")) return;

    const timer = setTimeout(() => {
      onSaveNotes(next);
      setSavedAt(new Date());
    }, 650);

    return () => clearTimeout(timer);
  }, [draft, notes, onSaveNotes]);

  const noteLength = draft.trim().length;
  const savedTime = savedAt
    ? savedAt.toLocaleTimeString(t.lang === "en" ? "en-US" : "vi-VN", { hour: "2-digit", minute: "2-digit" })
    : null;
  const savedLabel = savedTime
    ? t(`Đã lưu ${savedTime}`, `Saved ${savedTime}`)
    : t("Tự lưu khi bạn nhập", "Auto-saves as you type");

  return (
    <div className="page fade-in notes-page">
      <PageHeader greet="Note" title={t("Ghi chú tài chính", "Financial notes")}>
        <span className="note-save-status">{savedLabel}</span>
      </PageHeader>

      <section className="note-editor card">
        <textarea
          className="note-textarea"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={t("Ghi lại những việc cần nhớ: tiền trọ, khoản sắp phải trả, quyết định chi tiêu, mục tiêu tiết kiệm...", "Jot down what to remember: rent, upcoming payments, spending decisions, savings goals...")}
          spellCheck={false}
        />
        <div className="note-footer">
          <span>{noteLength} {t("ký tự", "characters")}</span>
          <span>{t("Được lưu cùng dữ liệu tài chính của bạn", "Saved alongside your financial data")}</span>
        </div>
      </section>
    </div>
  );
}