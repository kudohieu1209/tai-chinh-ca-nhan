// Notes — freeform financial reminders and decisions

function Notes({ notes = "", onSaveNotes }) {
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
  const savedLabel = savedAt
    ? `Đã lưu ${savedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
    : "Tự lưu khi bạn nhập";

  return (
    <div className="page fade-in notes-page">
      <PageHeader greet="Note" title="Ghi chú tài chính">
        <span className="note-save-status">{savedLabel}</span>
      </PageHeader>

      <section className="note-editor card">
        <textarea
          className="note-textarea"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Ghi lại những việc cần nhớ: tiền trọ, khoản sắp phải trả, quyết định chi tiêu, mục tiêu tiết kiệm..."
          spellCheck={false}
        />
        <div className="note-footer">
          <span>{noteLength} ký tự</span>
          <span>Được lưu cùng dữ liệu tài chính của bạn</span>
        </div>
      </section>
    </div>
  );
}
