---
title: Building a Natural Language-Powered MCP SSE Server with Node.js
categories:
 - llm
tags:
 - ai, llm, mcp, agent, ai-agent, agentic-ai, agentic
---

Recently, I built a custom MCP (Model Context Protocol) server using Node.js that supports Server-Sent Events (SSE) and an array of practical tools — including a powerful Natural Language to SQL (NL2SQL) converter. The final result was a lightweight yet extensible backend service that can be integrated with Claude Desktop, Windsurf AI, or any other MCP-compatible interface.

> 📌 Full source code available on [GitHub](https://github.com/rusyasoft/mcp-sse-calculator)

---

## 🔧 Why I Built This

I started off with some open-source examples for MCP servers (mainly focused on calculator tools), but many didn’t work out of the box. After trial and error, I landed on a minimal structure that worked and then began extending it. The most exciting addition? A tool that transforms natural language questions into executable SQL queries using Google’s Gemini API.

## ⚙️ What the MCP Server Can Do

Once set up, the server provides the following capabilities out of the box:

* 📐 **Mathematical Expression Evaluation**: Simple calculator that evaluates expressions like `2 + 2 * 3`
* 🔁 **Unit Conversion**: Temperature, distance, and weight conversions between common units
* 📆 **Date Formatting**: Format dates using flexible patterns
* 🧠 **Natural Language to SQL**: Describe what data you want, and it returns a SQL query

## 🌐 Endpoints

| Type | URL    | Description                                |
| ---- | ------ | ------------------------------------------ |
| REST | `/mcp` | Main entrypoint for MCP protocol traffic   |
| SSE  | `/sse` | Server-Sent Events endpoint (MCP over SSE) |

## 🧠 Natural Language to SQL with Gemini

One of the key tools in this project is `nl-to-sql`. You describe your query in plain English, and it generates valid SQL based on pre-loaded schemas.

### 🧪 Example:

```javascript
const result = await nlToSql({
  query: "Find all employees in the IT department with salary greater than 70000"
});
```

Under the hood:

1. Server loads all table schemas from `/src/schemas/*.sql`
2. Your query and schema info are packed into a prompt
3. The prompt is sent to Gemini API
4. The resulting SQL is parsed and returned

### ✅ Supported Tables

* `employees`
* `departments`
* `projects`
* `employee_projects`

This tool is especially handy for building AI interfaces that connect natural language to real data.

---

## 🖥️ Claude Desktop Integration

You can connect this server to Claude Desktop by editing your configuration like this:

```json
{
  "mcpServers": {
    "RustamMCP-Server": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:3000/mcp"]
    }
  }
}
```

After restarting Claude, your tools (like `calculate`, `convert`, `nl-to-sql`) will show up.

> ✅ Tested with Windsurf AI, which recognized and used the tools successfully

---

## 🛠️ Local Setup

Clone the repo and run:

```bash
npm install
cp .env.example .env
# Add your GEMINI_API_KEY in the .env file
npm run dev
```

Server starts on `http://localhost:3000`.

---

## 💡 What's Next?

Some next steps or ideas:

* ✅ More schemas and domain-specific NL2SQL patterns
* 🔍 Logging and analytics of tool usage
* 🔐 Rate limiting and authentication for hosted setups
* 🧩 Adding custom AI model backends (e.g. Claude or local LLMs)

---

## 📂 Final Thoughts

Building this project helped me appreciate the modularity of MCP and the power of Gemini’s generative models. What started as a calculator became an AI-powered backend for natural language interfaces.

Feel free to fork the [GitHub repo](https://github.com/rusyasoft/mcp-sse-calculator), experiment with your own tools, or deploy a custom version.

Stay tuned for more features and real-world integrations.

---

🚀 *Built with Node.js, Express, Gemini API, and the MCP SDK*

