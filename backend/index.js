const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/client_management")
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

// User Model (Company or Normal)
// User Model for MongoDB
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    userType: { type: String, enum: ["company", "normal"], required: true },
    companyName: { type: String },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["companyUser", "normalUser"], required: true },
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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // To link client to user
  })
);

const Project = mongoose.model(
  "Project",
  new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["pending", "in-progress", "done", "Not Started"],
      default: "pending",
    },
    startDate: String,
    endDate: String,
    priority: String,
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // To link project to user
  })
);

// Middleware to check JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
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
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// GraphQL Schema
const typeDefs = gql`
  type User {
    id: ID!
    name: String
    companyName: String
    email: String!
    userType: String!
    userId: ID!
  }

  type Client {
    id: ID!
    name: String!
    email: String!
    projects: [Project!]!
    clientType: String!
    userId: ID!
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
    user: User!
  }

  type User {
    userId: ID!
    name: String!
    email: String!
  }

  type Query {
    clients: [Client]
    projects: [Project]
    currentUser: User
  }

  type Mutation {
    registerUser(
      name: String
      companyName: String
      email: String!
      password: String!
    ): User
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
    editClient(id: ID!, name: String, email: String, clientType: String): Client
    editProject(
      id: ID!
      name: String
      description: String
      status: String
      startDate: String
      endDate: String
      priority: String
    ): Project
    updateProjectStatus(id: ID!, status: String!): Project
    deleteClient(id: ID!): String
    deleteProject(id: ID!): String
  }
`;

// Resolvers
const resolvers = {
  Query: {
    clients: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Unauthorized: User not logged in.");
      }
      try {
        console.log("user1458", user);
        // Fetch clients associated with the logged-in user's userId
        return await Client.find({ userId: user.id })
          .populate("projects")
          .limit();
      } catch (err) {
        throw new Error("Error fetching clients: " + err.message);
      }
    },

    projects: async (_, __, { user }) => {
      return Project.find({ userId: user.id });
    },
    currentUser: async (_, __, { user }) => {
      return User.findById(user.id);
    },
  },
  Mutation: {
    registerUser: async (_, { name, companyName, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        companyName,
        email,
        password: hashedPassword,
        userType: companyName ? "company" : "normal",
      });
      await user.save();
      return user;
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new Error("Invalid password");
      console.log("user", user);
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "24h" }
      );

      return {
        token,
        user: {
          userId: user._id.toString(),
          name: user.name || "N/A",
          userType: user.userType,
          companyName: user.companyName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    },
    addClient: async (_, { name, email, clientType }, { user }) => {
      if (!user) {
        throw new Error("Unauthorized");
      }
      const existingClient = await Client.findOne({ email });
      if (existingClient) {
        throw new Error("Client with this email already exists.");
      }
      const client = new Client({
        name,
        email,
        clientType,
        userId: user.id,
      });
      await client.save();
      return client;
    },
    addProject: async (
      _,
      { name, description, status, startDate, endDate, priority, clientId },
      { user }
    ) => {
      const project = new Project({
        name,
        description,
        status,
        startDate,
        endDate,
        priority,
        clientId,
        userId: user.id,
      });
      await project.save();
      return project;
    },

    editClient: async (_, { id, name, email, clientType }, { user }) => {
      console.log("clientId", id);
      if (!user) {
        throw new Error("Unauthorized");
      }
      const client = await Client.findOneAndUpdate(
        { _id: id, userId: user.id },
        { name, email, clientType },
        { new: true }
      );
      if (!client) {
        throw new Error("Client not found or unauthorized");
      }
      return client;
    },
    editProject: async (
      _,
      { id, name, description, status, startDate, endDate, priority },
      { user }
    ) => {
      const project = await Project.findOne({ _id: id, userId: user.id });
      if (!project)
        throw new Error(
          "Project not found or you do not have permission to edit"
        );

      project.name = name || project.name;
      project.description = description || project.description;
      project.status = status || project.status;
      project.startDate = startDate || project.startDate;
      project.endDate = endDate || project.endDate;
      project.priority = priority || project.priority;

      await project.save();
      return project;
    },

    deleteClient: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error("Authentication required");
      }

      try {
        // Find the client and ensure it belongs to the authenticated user
        const client = await Client.findOne({ _id: id, userId: user.id });
        console.log("client", client);
        if (!client) {
          throw new Error("Client not found or unauthorized");
        }

        // Delete the client
        await Client.deleteOne({ _id: id });

        return "Client deleted successfully";
      } catch (error) {
        throw new Error(error.message || "Error deleting client");
      }
    },

    deleteProject: async (_, { id }, { user }) => {
      // Ensure the user is authenticated
      console.log("id897456", id);
      if (!user) {
        throw new Error("Authentication required");
      }

      try {
        // Find the project by ID and ensure it belongs to the authenticated user
        console.log(
          " const project = await ProjectModel.findById(id);",
          Project.findById(id)
        );
        const project = await Project.findOne({ _id: id, createdBy: user.id });

        if (!project) {
          throw new Error("Project not found or not authorized");
        }

        // Delete the project
        await project.remove();
        return "Project deleted successfully";
      } catch (error) {
        throw new Error(error.message || "Error deleting project");
      }
    },

    updateProjectStatus: async (_, { id, status }, { user }) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      if (
        !["pending", "in-progress", "completed", "pushed", "closed"].includes(
          status
        )
      ) {
        throw new Error("Invalid status value");
      }

      const project = await Project.findOneAndUpdate(
        { _id: id, userId: user.id },
        { status },
        { new: true }
      );

      if (!project) {
        throw new Error("Project not found or unauthorized");
      }

      return project;
    },
  },
};

// Express Setup
const app = express();
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Skip context verification on login API
    if (req.body.query.includes("login")) {
      return {}; // No need to do any authentication or context here for login
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      throw new Error("Authorization header missing");
    }

    try {
      const user = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      return { user };
    } catch (error) {
      throw new Error("Invalid token: " + error.message);
    }
  },
});

// REST API Routes
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

// User Registration API
app.post("/api/registerUser", async (req, res) => {
  const { userType, companyName, name, email, password } = req.body;

  console.log("Received Data:", req.body); // Log the request payload

  // Ensure all required fields are provided
  if (!userType || !email || !password) {
    return res
      .status(400)
      .json({ error: "User type, email, and password are required" });
  }

  try {
    let newUser;

    if (userType === "company") {
      // Company User Registration
      if (!companyName) {
        return res
          .status(400)
          .json({ error: "Company name is required for company users" });
      }

      newUser = new User({
        userType,
        companyName,
        email,
        password: await bcrypt.hash(password, 10),
        role: "companyUser",
      });
    } else if (userType === "normal") {
      // Normal User Registration
      if (!name) {
        return res
          .status(400)
          .json({ error: "Name is required for normal users" });
      }

      newUser = new User({
        userType,
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: "normalUser",
      });
    } else {
      return res
        .status(400)
        .json({ error: "Invalid user type. Choose 'company' or 'normal'" });
    }

    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Error:", err); // Log any errors
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await User.findOne({ email });
    if (!admin) return res.status(400).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "2m" }
    );

    return res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Client List (only own clients)
app.get("/api/clients", authenticate, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id }).populate(
      "projects"
    );
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Project List (only own projects)
app.get("/api/projects", authenticate, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).populate(
      "clientId"
    );
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Client (only authenticated user can add)
app.post("/api/addClient", authenticate, async (req, res) => {
  const { name, email, clientType } = req.body;
  try {
    const client = new Client({
      name,
      email,
      clientType,
      userId: req.user.id,
    });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit Client (only the user who created the client can edit)
app.put("/api/editClient/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, email, clientType } = req.body;

  try {
    const client = await Client.findOne({ _id: id, userId: req.user.id });
    if (!client) {
      return res.status(404).json({
        error: "Client not found or you do not have permission to edit",
      });
    }

    client.name = name || client.name;
    client.email = email || client.email;
    client.clientType = clientType || client.clientType;

    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Project (only authenticated user can add)
app.post("/api/addProject", authenticate, async (req, res) => {
  const { name, description, status, startDate, endDate, priority, clientId } =
    req.body;
  try {
    const project = new Project({
      name,
      description,
      status,
      startDate,
      endDate,
      priority,
      clientId,
      userId: req.user.id,
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit Project (only the user who created the project can edit)
app.put("/api/editProject/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, description, status, startDate, endDate, priority } = req.body;

  try {
    const project = await Project.findOne({ _id: id, userId: req.user.id });
    if (!project) {
      return res.status(404).json({
        error: "Project not found or you do not have permission to edit",
      });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.status = status || project.status;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.priority = priority || project.priority;

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/deleteClient/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    console.log("id", id);
    const client = await Client.findOne({ _id: id, userId: userId });
    if (!client) {
      return res
        .status(404)
        .json({ error: "Client not found or not authorized" });
    }

    await client.remove();
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error deleting client" });
  }
});

// Delete a project
app.delete("/deleteProject/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the project and ensure it belongs to the authenticated user
    const project = await Project.findOne({ _id: id, createdBy: userId });
    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or not authorized" });
    }

    // Delete the project
    await project.remove();
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error deleting project" });
  }
});

// Start Server
(async () => {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
})();
