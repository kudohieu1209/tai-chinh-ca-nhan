import os
import re

def sync():
    files_order = [
        ("icons.jsx", "icons.jsx — Apple SF Symbols-inspired SVG icon set"),
        ("charts.jsx", "charts.jsx — Custom SVG charts"),
        ("components.jsx", "components.jsx — Shared building blocks"),
        ("overview.jsx", "overview.jsx"),
        ("transactions.jsx", "transactions.jsx"),
        ("debts.jsx", "debts.jsx"),
        ("budget.jsx", "budget.jsx"),
        ("notes.jsx", "notes.jsx — Financial notes"),
        ("app.jsx", "Root app — Firebase connection + state management\n// (useState, useEffect, useMemo, useRef, useCallback are globally declared in components.jsx)")
    ]

    print("Reading JSX source files...")
    combined_jsx = "\n"
    for filename, comment in files_order:
        filepath = os.path.join("src", filename)
        if not os.path.exists(filepath):
            print(f"Error: File {filepath} not found.")
            return
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read().strip()
        combined_jsx += f"// ============================================================\n// {comment}\n// ============================================================\n\n{content}\n\n"

    print("Reading index.html...")
    with open("index.html", "r", encoding="utf-8") as f:
        html_content = f.read()

    # Match the <script type="text/babel" data-presets="react">...</script> block
    pattern = r'(<script type="text/babel" data-presets="react">)(.*?)(</script>)'
    
    # We use re.DOTALL to match across multiple lines
    new_html, count = re.subn(pattern, lambda m: f"{m.group(1)}{combined_jsx}{m.group(3)}", html_content, flags=re.DOTALL)
    
    if count == 0:
        print("Error: Could not find <script type=\"text/babel\" data-presets=\"react\"> block in index.html.")
        return

    print("Writing updated index.html...")
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_html)
    
    print("Synchronization complete!")

if __name__ == "__main__":
    sync()
