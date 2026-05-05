import { config} from "@/config"
import app from "./app";
import wsManager from "./websockets/connectionManager";
import http from "http";
import { startScheduledCleanup } from "./cleanup/scheduledCleanup";

const PORT = config.SERVER_PORT;

const server = http.createServer(app);

wsManager.init(server);

const cleanupTimer = startScheduledCleanup();

server.listen(PORT, () => {
  console.log(`HookCatcher server listening on port ${PORT}`);
});

process.on("SIGTERM", () => {
  clearInterval(cleanupTimer);
  server.close(() => {
    console.log("Server shut down gracefully.");
    process.exit(0);
  });
});
