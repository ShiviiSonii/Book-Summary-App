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

  app.post("/summarize/:title", async (req, res) => {
    try {
      const { title } = req.params;

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
                    text: `Give a summary of the book: ${title} in simple words`,
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
