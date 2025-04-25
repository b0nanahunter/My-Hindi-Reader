
import { useState } from "react";
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";

function App() {
  const [text, setText] = useState("");
  const [words, setWords] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      alert("Ошибка чтения буфера обмена");
    }
  };

  const handleWordSelect = () => {
    const selected = window.getSelection().toString().trim();
    if (selected && !words.includes(selected)) {
      setWords([...words, selected]);
    }
  };

  const handleDownloadDocx = async () => {
    const rows = words.map(word => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(word)] }),
        new TableCell({ children: [new Paragraph("Перевод")] }),
        new TableCell({ children: [new Paragraph("Предложение из текста")] }),
        new TableCell({ children: [new Paragraph("Источник")] })
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
          ]
        }),
        ...rows
      ]
    });

    const doc = new Document({ sections: [{ children: [table] }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "словари.docx");
  };

  return (
    <div>
      <h1>My Hindi Reader (Локальная версия)</h1>
      <button onClick={handlePaste}>📋 Вставить текст из буфера</button>
      <input type="file" accept=".txt,.docx" onChange={handleFileUpload} />
      <textarea
        value={text}
        onMouseUp={handleWordSelect}
        onChange={(e) => setText(e.target.value)}
        placeholder="Здесь будет ваш текст..."
      />
      <div>
        <h3>Выбранные слова:</h3>
        <ul>
          {words.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>
      <button onClick={handleDownloadDocx} disabled={words.length === 0}>
        📥 Скачать словарь (.docx)
      </button>
    </div>
  );
}

export default App;
