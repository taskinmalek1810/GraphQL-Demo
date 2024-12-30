const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/client_management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Admin Model for MongoDB
const Admin = mongoose.model(
  "Admin",
  new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
  })
);

// Client and Project Models
const Client = mongoose.model(
  "Client",
  new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    clientType: { type: String, required: true },
  })
);

const Project = mongoose.model(
  "Project",
  new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    priority: { type: String },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  })
);

// Middleware to check JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from "Authorization: Bearer <token>"
  if (!token) {
    return res
      .status(401)
      .json({ error: "No token provided, authorization denied" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    req.user = decoded; // Attach the decoded user information to the request object
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// GraphQL Schema
const typeDefs = gql`
  type Client {
    id: ID!
    name: String!
    email: String!
    projects: [Project]
    clientType: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    status: String
    startDate: String
    endDate: String
    priority: String
    clientId: ID!
  }

  type LoginResponse {
    token: String!
  }

  type Query {
    clients: [Client]
    projects: [Project]
  }

  type Mutation {
    login(email: String!, password: String!): LoginResponse
    addClient(name: String!, email: String!, clientType: String!): Client
    addProject(
      name: String!
      description: String
      status: String
      startDate: String
      endDate: String
      priority: String
      clientId: ID!
    ): Project
  }
`;

// Resolvers for Queries and Mutations
const resolvers = {
  Query: {
    clients: () => Client.find().populate("projects"),
    projects: () => Project.find(),
  },
  Mutation: {
    login: async (_, { email, password }) => {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        throw new Error("Admin not found");
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" }
      );
      return { token };
    },
    addClient: async (_, { name, email, clientType }) => {
      const client = new Client({ name, email, clientType });
      return client.save();
    },
    addProject: async (
      _,
      { name, description, status, startDate, endDate, priority, clientId }
    ) => {
      const project = new Project({
        name,
        description,
        status,
        startDate,
        endDate,
        priority,
        clientId,
      });
      return project.save();
    },
  },
};

// Express Setup
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Apollo Server Setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      return { user: decoded };
    } catch (err) {
      throw new Error("Unauthorized");
    }
  },
});

// Start Apollo Server and Apply to Express
(async () => {
  await server.start();
  server.applyMiddleware({ app });

  // Custom REST-like API Endpoints

  // Add Admin User Endpoint (POST /createAdmin)
  app.post("/createAdmin", async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = new Admin({ email, password: hashedPassword });
      await admin.save();
      res.status(201).json({ message: "Admin user created" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Login API Route
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ error: "Admin not found" });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password" });
      }

      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" }
      );

      return res.json({ token });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add Client API Route (POST /api/addClient)
  app.post("/api/addClient", authenticate, async (req, res) => {
    const { name, email, clientType } = req.body;
    try {
      const client = new Client({ name, email, clientType });
      await client.save();
      res.status(200).json(client);
    } catch (error) {
      res.status(500).json({ error: "Error creating client" });
    }
  });

  // Add Project API Route (POST /api/addProject)
  app.post("/api/addProject", authenticate, async (req, res) => {
    const {
      name,
      description,
      status,
      startDate,
      endDate,
      priority,
      clientId,
    } = req.body;
    try {
      const project = new Project({
        name,
        description,
        status,
        startDate,
        endDate,
        priority,
        clientId,
      });
      await project.save();
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ error: "Error creating project" });
    }
  });

  // Get Client List Endpoint (GET /api/clients)
  app.get("/api/clients", authenticate, async (req, res) => {
    try {
      const clients = await Client.find().populate("projects");
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ error: "Error fetching clients" });
    }
  });

  // Get Project List Endpoint (GET /api/projects)
  app.get("/api/projects", authenticate, async (req, res) => {
    try {
      const projects = await Project.find();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ error: "Error fetching projects" });
    }
  });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
})();
