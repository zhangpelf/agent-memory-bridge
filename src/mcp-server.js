#!/usr/bin/env node
/**
 * Agent Memory Bridge - Unified Memory MCP Server
 * Read-only access to OpenCode local SQLite session store.
 */
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const DB_PATH = process.env.OPENCODE_DB_PATH || path.join(process.env.HOME, ".local/share/opencode/opencode.db");

function checkDb() {
  return fs.existsSync(DB_PATH);
}

function searchMemory(query, limit = 8) {
  if (!checkDb()) return [{ error: "OpenCode DB not found at " + DB_PATH }];
  if (!query || typeof query !== "string") return [];
  const cleanQuery = query.replace(/['"\\]/g, "");
  const uriDb = `file:${DB_PATH}?mode=ro`;
  const sql = `
    SELECT 
      s.id as session_id,
      s.title,
      datetime(s.time_updated/1000, 'unixepoch', 'localtime') as updated_at,
      substr(replace(replace(m.data, char(10), ' '), char(13), ' '), 1, 280) as snippet
    FROM session_message m
    JOIN session_v2 s ON s.id = m.session_id
    WHERE m.data LIKE '%${cleanQuery}%'
    GROUP BY s.id
    ORDER BY s.time_updated DESC
    LIMIT ${parseInt(limit) || 8};
  `;
  try {
    const raw = execSync(`sqlite3 -json "${uriDb}" "${sql.replace(/\n/g, ' ')}"`, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [{ error: e.message }];
  }
}

function getSessionMessages(sessionId, limit = 15) {
  if (!checkDb()) return [{ error: "OpenCode DB not found" }];
  if (!sessionId) return [];
  const cleanId = sessionId.replace(/['"\\]/g, "");
  const uriDb = `file:${DB_PATH}?mode=ro`;
  const sql = `
    SELECT 
      id,
      datetime(json_extract(data, '$.time.created')/1000, 'unixepoch', 'localtime') as created_at,
      COALESCE(json_extract(data, '$.text'), json_extract(data, '$.content[0].text')) as text
    FROM session_message
    WHERE session_id = '${cleanId}'
    ORDER BY rowid ASC
    LIMIT ${parseInt(limit) || 15};
  `;
  try {
    const raw = execSync(`sqlite3 -json "${uriDb}" "${sql.replace(/\n/g, ' ')}"`, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [{ error: e.message }];
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on("line", (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    const { id, method, params } = req;

    if (method === "initialize") {
      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "agent-memory-bridge-mcp", version: "0.1.0" }
        }
      }) + "\n");
    } else if (method === "tools/list") {
      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "search_unified_memory",
              description: "Search historical AI conversations across OpenCode, Claude Code, and Codex.",
              inputSchema: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Search keyword" },
                  limit: { type: "number", description: "Result count limit (default 8)" }
                },
                required: ["query"]
              }
            },
            {
              name: "get_memory_session_detail",
              description: "Retrieve conversational message stream for a specific session ID.",
              inputSchema: {
                type: "object",
                properties: {
                  session_id: { type: "string", description: "Session ID (e.g. ses_xxx)" },
                  limit: { type: "number", description: "Max messages (default 15)" }
                },
                required: ["session_id"]
              }
            }
          ]
        }
      }) + "\n");
    } else if (method === "tools/call") {
      const toolName = params.name;
      const args = params.arguments || {};
      let result = null;
      if (toolName === "search_unified_memory") {
        result = searchMemory(args.query, args.limit || 8);
      } else if (toolName === "get_memory_session_detail") {
        result = getSessionMessages(args.session_id, args.limit || 15);
      } else {
        result = { error: "Unknown tool" };
      }
      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }
      }) + "\n");
    } else if (id !== undefined) {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result: {} }) + "\n");
    }
  } catch (e) {}
});
