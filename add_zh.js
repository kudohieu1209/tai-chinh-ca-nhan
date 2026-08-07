const fs = require('fs');
const translate = require('translate-google');

async function main() {
  const code = fs.readFileSync('index.html', 'utf-8');
  
  // Find all English strings (2nd arg to t() or tr())
  const regex = /\b(?:t|tr)\(\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)')\s*,\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)')/g;
  
  const enStrings = new Set();
  let match;
  while ((match = regex.exec(code)) !== null) {
    const en = match[3] || match[4];
    if (en) enStrings.add(en.replace(/\\"/g, '"').replace(/\\'/g, "'"));
  }
  
  console.log(`Found ${enStrings.size} unique English strings. Translating...`);
  
  const zhDict = {};
  const stringsArray = Array.from(enStrings);
  
  // Translate in batches to avoid API limits
  const batchSize = 50;
  for (let i = 0; i < stringsArray.length; i += batchSize) {
    const batch = stringsArray.slice(i, i + batchSize);
    try {
      const res = await translate(batch, { to: 'zh-cn' });
      batch.forEach((enStr, idx) => {
        zhDict[enStr] = res[idx];
      });
      console.log(`Translated batch ${i / batchSize + 1}`);
    } catch (err) {
      console.error("Translation error:", err);
    }
  }
  
  // Inject the dictionary into index.html
  const dictCode = `const zhDict = ${JSON.stringify(zhDict, null, 2)};`;
  
  let newCode = code;
  
  newCode = newCode.replace(
    /const t = useCallback\(\(vi, en\) => \(lang === "en" \? en : vi\), \[lang\]\);/g,
    `const t = useCallback((vi, en) => {
    if (lang === "en") return en;
    if (lang === "zh") return zhDict[en] || en;
    return vi;
  }, [lang]);`
  );
  
  newCode = newCode.replace(
    /const t = \(vi, en\) => \(lang === "en" \? en : vi\);/g,
    `const t = (vi, en) => {
    if (lang === "en") return en;
    if (lang === "zh") return zhDict[en] || en;
    return vi;
  };`
  );
  
  newCode = newCode.replace(
    /const tr = \(vi, en\) => \(lang === "en" \? en : vi\);/g,
    `const tr = useCallback((vi, en) => {
    if (lang === "en") return en;
    if (lang === "zh") return zhDict[en] || en;
    return vi;
  }, [lang]);`
  );
  
  newCode = newCode.replace(
    /onClick=\{\(\) => onLang\("en"\)\}>\s*\{t\([^}]*\}\s*<\/button>/,
    `onClick={() => onLang("en")}>
              {t("Tiếng Anh", "English")}
            </button>
            <button className={"settings-opt-btn" + (lang === "zh" ? " active" : "")} onClick={() => onLang("zh")}>
              {t("Tiếng Trung", "Chinese")}
            </button>`
  );
  
  // Ensure zhDict is placed at the top of the script
  if (!newCode.includes('const zhDict =')) {
     newCode = newCode.replace(/<script type="text\/babel"[^>]*>/, '<script type="text/babel" data-presets="react">\n' + dictCode);
  }
  
  fs.writeFileSync('index.html', newCode);
  console.log("Done modifying index.html");
}

main();
