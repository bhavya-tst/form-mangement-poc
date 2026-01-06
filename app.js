import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import sequelize from './configs/db.js';
import readline from 'readline';
const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Import models to ensure relations are registered
import "./modules/forms/model.js";
import "./modules/websites/model.js";

// Routes
app.use('/', routes);


// DB Connection
const force = false;

if (force) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    `💀 Are you sure? You want to force database synchronization??? (yes/y) 
`,
    (input) => {
      if (input.toLowerCase() === "yes" || input.toLowerCase() === "y") {
        sequelize
          .sync({ force: true })
          .then((result) => {
            console.log(`✔ Database connected successfully! 🎯`);
            rl.close(); // Close the readline interface after the user's response
          })
          .catch((error) => {
            console.error("Error while creating tables...", error);
          });
      } else {
        console.log("Force true prevented, reconnect the DB.");
        process.exit(0);
      }
    }
  );
} else {
  sequelize
    .sync({ alter: true })
    .then(async (result) => {
      console.log(`✔ Database connection successful! 🎯`);
    })
    .catch((error) => {
      console.error("Error while creating tables...", error);
    });
}

// Error handler
app.use((err, req, res, next) => {
  // Handle Sequelize errors
  if (err.name === "SequelizeUniqueConstraintError") {
    // Handle unique constraint errors (e.g., duplicate data)
    err.status = 409;
    let msg = "";

    err.errors.map((el) => {
      msg += `${el.path} '${el?.value?.split("-")?.[0]}' already registered`;
    });

    err.message = msg;
  } else if (err.name === "SequelizeValidationError") {
    // Handle validation errors
    err.status = 400;
    let msg = "";

    err.errors.map((el) => {
      if (el.type === "notNull Violation") {
        msg += `${el.path} is required. `;
      } else {
        msg += el.message;
      }
    });

    err.message = msg;
  }

  // Handle other errors
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Unknown Error",
    stack:
      process.env.NODE_ENV === "development" || process.env.NODE_ENV === "staging"
        ? err?.stack || undefined
        : undefined,
  });
});

export default app;
