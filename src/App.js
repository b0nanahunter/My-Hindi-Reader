
import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [selectedWords, setSelectedWords] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setText(reader.result);
      };
      reader.readAsText(file);
    }
  };

  const handleWordClick = (word) => {
    if (!selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const renderText = () => {
    return text.split(/\s+/).map((word, idx) => (
      <span
        key={idx}
        onClick={() => handleWordClick(word)}
        style={{
          cursor: "pointer",
          backgroundColor: selectedWords.includes(word) ? "yellow" : "transparent",
        }}
      >
        {word + " "}
      </span>
    ));
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>My Hindi Reader</h1>
      <input type="file" accept=".txt" onChange={handleFileUpload} />
      <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc", minHeight: 200 }}>
        {renderText()}
      </div>
      <div style={{ marginTop: 20 }}>
        <h2>📘 Словарь</h2>
        <ul>
          {selectedWords.map((word, index) => (
            <li key={index}>{word}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
