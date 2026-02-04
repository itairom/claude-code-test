# Claude Code Learning Project

A learning project for exploring Claude Code capabilities, specifically **Subagents** and **Skills**.

## Overview

This project demonstrates the use of specialized AI assistants (subagents) and custom capabilities (skills) within Claude Code. It serves as both a learning resource and a practical example of how to leverage these features.

### What You'll Learn

1. **Subagents** - Specialized AI assistants with custom prompts, tools, and permissions
2. **Skills** - Custom capabilities you create as folders with instructions

## Project Structure

```
subagents-test/
├── .claude/
│   ├── agents/              # Project-specific subagents
│   └── skills/              # Project-specific skills
├── src/
│   ├── components/          # React components
│   ├── services/            # API services
│   └── utils/               # Utility functions
├── PLAN.md                  # Detailed learning plan and reference
└── README.md                # This file
```

## Subagents

Subagents are specialized AI assistants that:
- Run in their own context window
- Have custom system prompts
- Have specific tool access (allowlist/denylist)
- Have independent permission modes

### Available Subagents

| Subagent | Purpose | Tools Available |
|----------|---------|-----------------|
| **Bash** | Command execution, git operations, terminal tasks | Bash |
| **Explore** | Fast codebase exploration, finding files, searching | All tools except Task, ExitPlanMode, Edit, Write, NotebookEdit |
| **Plan** | Software architecture, implementation planning | All tools except Task, ExitPlanMode, Edit, Write, NotebookEdit |
| **general-purpose** | Complex research, multi-step tasks, searching code | All tools (*) |
| **claude-code-guide** | Questions about Claude Code CLI, Agent SDK, hooks, MCP | Glob, Grep, Read, WebFetch, WebSearch |
| **statusline-setup** | Configure Claude Code status line setting | Read, Edit |

### Creating Custom Subagents

Create a `.md` file in `.claude/agents/` with YAML frontmatter:

```yaml
---
name: my-agent
description: When to use this agent
tools: Read, Grep, Glob
model: sonnet
---

You are a specialized assistant. Your task is...
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase, hyphens) |
| `description` | Yes | When Claude should delegate to this agent |
| `tools` | No | Tools agent can use (inherits all if omitted) |
| `disallowedTools` | No | Tools to deny |
| `model` | No | `sonnet`, `opus`, `haiku`, or `inherit` |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `skills` | No | Skills to preload into agent context |
| `hooks` | No | Lifecycle hooks scoped to this agent |

## Skills

Skills are folders with instructions that teach Claude specific tasks. They live in:
```
.claude/skills/your-skill-name/skill.md
```

### Skill Structure

```yaml
---
name: skill-name
description: Brief description of what this skill does
---

# Skill Title

Detailed instructions for Claude on how to handle this skill.
```

### Skills Paths by Tool

| Tool | Project Path | Global Path |
|------|--------------|-------------|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| Codex | `.codex/skills/` | `~/.codex/skills/` |

### Popular Official Skills

From the [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) repo:

**By Anthropic:**
- `anthropics/pdf` - PDF manipulation
- `anthropics/mcp-builder` - Create MCP servers
- `anthropics/skill-creator` - Guide for creating skills

**By Vercel:**
- `vercel-labs/react-best-practices` - React patterns
- `vercel-labs/next-best-practices` - Next.js patterns

**By Trail of Bits (Security):**
- `trailofbits/audit-context-building` - Deep code analysis
- `trailofbits/static-analysis` - CodeQL, Semgrep

## Source Code

The project includes example TypeScript/React code:

- **src/components/Button.tsx** - A reusable React button component with variants
- **src/services/api.ts** - Generic API fetch wrapper with TypeScript types
- **src/utils/helpers.ts** - Utility functions (formatDate, debounce)

## Examples to Try

### 1. Explore Agent - Quick Search
```
Find all TypeScript files with "interface" keyword
```

### 2. General Purpose - Research
```
Research best practices for error handling in Node.js
```

### 3. Plan Agent - Architecture
```
Design a REST API for a todo application
```

### 4. Parallel Agents
Run multiple agents simultaneously by sending multiple tool calls in a single message.

## Progress

- [x] Create plan file
- [x] Run Explore agent example (found 2 interfaces)
- [x] Demonstrate parallel subagents (3 agents at once)
- [x] Run general-purpose agent example (code pattern analysis)
- [ ] Run Plan agent example
- [ ] Experiment with background agents
- [ ] Try resuming an agent

## Resources

- [Claude Code Documentation](https://claude.ai/code)
- [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) - Community-maintained list of agent skills
- [PLAN.md](./PLAN.md) - Detailed learning plan and reference guide

## License

MIT
