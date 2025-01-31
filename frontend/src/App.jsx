import { useState } from "react";
import "./App.css";

function App() {
  const [book, setBook] = useState(null);
  const [bookName, setBookName] = useState("");
  const [loading, setLoading] = useState(false);
  const [wordLen, setWordLen] = useState(250);
  const [summaryType, setSummaryType] = useState("Purpose");
  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [imageUrl, setImageUrl] = useState();
  const [question, setQuestion] = useState(" ");
  const [answer, setAnswer] = useState([])

  const fetchBookSummary = async () => {
    if (!bookName.trim()) {
      alert("Please enter a book name!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:4000/summarize/${bookName}/${wordLen}/${summaryType}`, {
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
      getCoverImage();
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
  };

  const findSimilarBookName = async () => {
    try {
      const response = await fetch(`http://localhost:4000/suggestNextSummary/${bookName}`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch similar bookname");
      }

      const data = await response.json();
      setBookName("");
      setImageUrl("");
      setBookName(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error("Error fetching similar bookname:", error);
    } finally {
      setLoading(false);
      setBook(null);
    }
  };

  const getCoverImage = async () => {
    try {
      const response = await fetch(`http://localhost:4000/coverImage/${bookName}`);

      if (!response.ok) {
        throw new Error("Failed to fetch cover image");
      }

      const data = await response.json();
      setImageUrl(data.coverImage)
    } catch (error) {
      console.error("Error fetching cover image:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchAgain = () => {
    stopSpeech();
    setBook(null);
    setBookName("");
    setImageUrl("")
  };

  const startSpeech = () => {
    if (!book) return;

    const utterance = new SpeechSynthesisUtterance(book.summary);
    utterance.onend = () => setIsSpeaking(false); 

    speechSynthesis.speak(utterance);
    setIsSpeaking(true); 
  };

  const stopSpeech = () => {
    speechSynthesis.cancel(); 
    setIsSpeaking(false); 
  };

  const findAnswer = async () => {
    try {
      const response = await fetch(`http://localhost:4000/findAnswer/${bookName}/${book.summary}/${question}`);

      if (!response.ok) {
        throw new Error("Failed to find answer of your question.");
      }

      const data = await response.json();
      // console.log(data.candidates[0].content.parts[0].text)
      setAnswer("")
      setAnswer(data.candidates[0].content.parts[0].text)
    } catch (error) {
      console.error("Error fetching answer of your question:", error);
    } finally {
      setLoading(false);
      setQuestion("");
    }
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
          <select onChange={(e) => setWordLen(e.target.value)} value={wordLen}>
            <option value="250">Short</option>
            <option value="500">Medium</option>
            <option value="1000">Long</option>
          </select>
          <select onChange={(e) => setSummaryType(e.target.value)} value={summaryType}>
            <option value="purpose">Purpose</option>
            <option value="concept">Concept</option>
            <option value="plot">Plot</option>
          </select>
          <button onClick={fetchBookSummary} disabled={loading}>
            {loading ? "Loading..." : "Get Summary"}
          </button>

          <p>Want a suggestion?</p>
          <button onClick={suggestBookName}>Suggest Book Name</button>
        </>
      ) : (
        <>
          <h2>{book.title}</h2>
          <img src={imageUrl} alt="cover-img"/>
          <p>{book.summary}</p>
          <button onClick={handleSearchAgain}>Search Again</button>
          <button onClick={findSimilarBookName}>Find Similar</button>

          {!isSpeaking ? (
            <button onClick={startSpeech}>Start Reading</button>
          ) : (
            <button onClick={stopSpeech}>Stop Reading</button>
          )}

          <h2>Do you have any questioons?</h2>
          <p>Please ask below.</p>
          <input type="text" placeholder="Enter you question here" value={question} onChange={(e) => setQuestion(e.target.value)}/>
          <button onClick={findAnswer}>Find Answer</button>

          {
            answer && 
            <>
             <p>{answer}</p>
            </>
          }
        </>
      )}
    </div>
  );
}

export default App;
