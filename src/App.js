
import { useState } from "react";
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";

function App() {
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [currentSource, setCurrentSource] = useState("");
  const [filename, setFilename] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setText(event.target.result);
      setCurrentSource(file.name);
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      setCurrentSource(clipboardText.split("\n")[0]);
    } catch (err) {
      alert("Ошибка чтения буфера обмена");
    }
  };

  const handleWordSelect = () => {
    const selected = window.getSelection().toString().trim();
    if (!selected || words.find(w => w.word === selected)) return;

    // Поиск первого предложения
    const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [];
    const example = sentences.find(s => s.includes(selected)) || "";

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const newWord = {
      word: selected,
      translation: "",
      example: example.trim(),
      source: currentSource,
      date: formattedDate,
      review7: "",
      review14: "",
      review28: ""
    };
    setWords([...words, newWord]);
  };

  const handleTranslationChange = (index, value) => {
    const updated = [...words];
    updated[index].translation = value;
    setWords(updated);
  };

  const handleDownloadDocx = async () => {
    const rows = words.map(w => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(w.word)] }),
        new TableCell({ children: [new Paragraph(w.translation)] }),
        new TableCell({ children: [new Paragraph(w.example)] }),
        new TableCell({ children: [new Paragraph(w.source)] }),
        new TableCell({ children: [new Paragraph(w.date)] }),
        new TableCell({ children: [new Paragraph("")] }),
        new TableCell({ children: [new Paragraph("")] }),
        new TableCell({ children: [new Paragraph("")] }),
      ]
    }));

    const table = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Слово")] }),
            new TableCell({ children: [new Paragraph("Перевод")] }),
            new TableCell({ children: [new Paragraph("Пример")] }),
            new TableCell({ children: [new Paragraph("Источник")] }),
            new TableCell({ children: [new Paragraph("Дата добавления")] }),
            new TableCell({ children: [new Paragraph("7 дней")] }),
            new TableCell({ children: [new Paragraph("2 неделя")] }),
            new TableCell({ children: [new Paragraph("4 неделя")] }),
          ]
        }),
        ...rows
      ]
    });

    const doc = new Document({ sections: [{ children: [table] }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "словарь.docx");
  };

  return (
    <div>
      <h1>My Hindi Reader (Финальная локальная версия)</h1>
      <button onClick={handlePaste}>📋 Вставить текст из буфера</button>
      <input type="file" accept=".txt,.docx" onChange={handleFileUpload} />
      <textarea
        value={text}
        onMouseUp={handleWordSelect}
        onChange={(e) => setText(e.target.value)}
        placeholder="Здесь будет ваш текст..."
      />
      <div>
        <h3>Выбранные слова и переводы:</h3>
        {words.map((w, i) => (
          <div key={i}>
            <b>{w.word}</b> — 
            <input
              type="text"
              value={w.translation}
              onChange={(e) => handleTranslationChange(i, e.target.value)}
              placeholder="Введите перевод"
              style={{ marginLeft: "10px" }}
            />
          </div>
        ))}
      </div>
      <button onClick={handleDownloadDocx} disabled={words.length === 0}>
        📥 Скачать словарь (.docx)
      </button>
    </div>
  );
}

export default App;
