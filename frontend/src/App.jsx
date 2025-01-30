import { useState } from "react";
import "./App.css";

function App() {
  const [book, setBook] = useState(null);
  const [bookName, setBookName] = useState("");
  const [loading, setLoading] = useState(false); 

  const fetchBookSummary = async () => {
    if (!bookName.trim()) {
      alert("Please enter a book name!");
      return;
    }

    setLoading(true); 

    try {
      const response = await fetch(`http://localhost:4000/summarize/${encodeURIComponent(bookName)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }

      const data = await response.json();

      const summary =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";

      setBook({ title: bookName, summary });
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching summary. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  const suggestBookName = async () => {
    try {
      const response = await fetch(`http://localhost:4000/suggest`);

      if (!response.ok) {
        throw new Error("Failed to fetch bookname");
      }

      const data = await response.json();
      setBookName(data.title);
    } catch (error) {
      console.error("Error fetching bookname:", error);
    } finally {
      setLoading(false); 
    }
  }

  const handleSearchAgain = () => {
    setBook(null)
    setBookName("")
  }

  return (
    <div className="App">
      <h1>Book Summary</h1>

      {!book ? (
        <>
          <input
            placeholder="Enter book name"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
          />
          <button onClick={fetchBookSummary} disabled={loading}>
            {loading ? "Loading..." : "Get Summary"}
          </button>

          <p>Want a suggestion?</p>
          <button onClick={suggestBookName}>Suggest Book Name</button>
        </>
      ) : (
        <>
          <h2>{book.title}</h2>
          <p>{book.summary}</p>
          <button onClick={handleSearchAgain}>Search Again</button>
        </>
      )}
    </div>
  );
}

export default App;
