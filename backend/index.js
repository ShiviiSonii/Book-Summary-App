import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

// GraphQL schema and resolvers
const typeDefs = `
  type Book {
    title: String!
  }

  type Query {
    suggestBook: Book
  }
`;

const books = [
  {
    title: "The Silent Echo",
  },
  {
    title: "Beyond the Horizon",
  },
  {
    title: "Echoes of Eternity",
  },
  {
    title: "Whispers in the Dark",
  },
  {
    title: "The Lost Manuscript",
  },
  {
    title: "Parallel Lives",
  },
  {
    title: "The Last Alchemist",
  },
  {
    title: "Beneath the Ice",
  },
  {
    title: "Shadows of the Forgotten",
  },
  {
    title: "Neon Nights",
  },
];

const resolvers = {
  Query: {
    suggestBook: () => books[Math.floor(Math.random() * books.length)],
  },
};

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start Apollo Server
async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  // ✅ Express route to fetch a random book using GraphQL
  app.get("/suggest", async (req, res) => {
    try {
      const book = resolvers.Query.suggestBook();
      res.json(book);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Something went wrong!" });
    }
  });

  app.post("/summarize/:title/:wordLen/:summaryType", async (req, res) => {
    try {
      const { title, wordLen, summaryType } = req.params;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Give the summary of the book: ${title} in ${wordLen} simple words on the ${summaryType}-Based Summary`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Something went wrong!" });
    }
  });

  app.post("/suggestNextSummary/:bookName", async (req, res) => {
    try {
      const { bookName } = req.params;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Suggest only one book name in which story is similar to this book: ${bookName}`,
                  },
                ],
              },
            ],
          }),
        }
      );
      // console.log(response);
      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Something went wrong!" });
    }
  });

  app.get("/coverImage/:bookName", async (req, res) => {
    try {
      const { bookName } = req.params;

      // Step 1: Fetch Book Data from Open Library API using the book title
      const openLibraryUrl = `https://openlibrary.org/search.json?title=${bookName}`;
      const response = await fetch(openLibraryUrl);
      const data = await response.json();

      // Check if there are any books returned and extract the cover image URL
      const bookCoverImage =
        data.docs && data.docs[0].cover_i
          ? `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`
          : "No cover found"; // Fallback message if no cover found

      // Step 2: Return the cover image URL as a JSON response
      res.json({ coverImage: bookCoverImage });
    } catch (error) {
      console.error("Error fetching book cover:", error);
      res.status(500).json({ error: "Error fetching cover image" });
    }
  });

  app.get("/findAnswer/:bookName/:summary/:question", async (req, res) => {
    try {
      const { bookName, summary, question } = req.params;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Tell me the answer of this question: ${question} which was taken from the summary: ${summary} of the ${bookName}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Something went wrong!" });
    }
  });

  // Start Express server
  app.listen(4000, () => {
    console.log("🚀 Server ready at http://localhost:4000");
    console.log(`🚀 GraphQL endpoint at http://localhost:4000/graphql`);
    console.log(`📖 Suggested book endpoint: http://localhost:4000/suggest`);
  });
}

startServer();
