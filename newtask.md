
## Project Plan: Add Context Feature to Discord Translation Bot

**Goal:** Implement a feature that allows users to provide translation context to the bot using the `!c` command, improving translation accuracy and relevance.

**User Story:** As a user communicating in a multilingual Discord channel, I want to be able to provide context to the translation bot so that translations are more accurate and relevant to the ongoing conversation.

**Technical Breakdown:**

1.  **Command Creation (`!c` Context Command):**
    *   Create a new command file (e.g., `src/commands/context.js`) to handle the `!c` command.
    *   This command will parse user input following `!c` as the translation context.
    *   Implement logic to store this context associated with the specific Discord channel where the command is issued.
    *   Provide user feedback upon successful context addition, confirming what context has been set.

2.  **Context Storage:**
    *   Decide where to store the context. Options include:
        *   **`client.activeSessions` Map:**  Extend the existing `activeSessions` map in `src/index.js` to store context per channel. This is good for session-based context.
        *   **`serverConfig` (`data/servers/[serverId].json`):** Store context within the server configuration for persistent, server-wide context (less suitable for channel-specific context).
        *   **Separate Context Storage:** Create a new data structure (e.g., a `Map` in `src/index.js` or a dedicated JSON file) specifically for context.
        *   **For this plan, let's use `client.activeSessions` for simplicity and session-based context.**

3.  **System Prompt Modification in Translation Service:**
    *   Modify `src/services/translationService.js` to:
        *   Retrieve the stored context associated with the channel before initiating a translation.
        *   Incorporate this context into the system prompt sent to the LLM.
        *   The system prompt should be dynamically constructed to include both the base system prompt from `config/default.json` and the user-provided context.

4.  **Handling Multiple Context Additions:**
    *   Implement logic in `src/commands/context.js` to handle subsequent `!c` commands.
    *   When a user issues `!c` again:
        *   **Option 1 (Replace):**  Replace the existing context with the new context. Simpler, but might lose previous context.
        *   **Option 2 (Append):** Append the new context to the existing context. Might lead to very long prompts if context is added excessively.
        *   **Option 3 (Conversation History - User Role):** Treat each `!c` command as a new "user" message in a conversation history. This is closer to your idea and allows for evolving context. **Let's choose Option 3 for this plan.**
            *   Store context as an array of strings in `activeSessions`.
            *   Each `!c` adds a new string to this array.
            *   When constructing the system prompt:
                *   Start with the base system prompt.
                *   Append each context string from the array, perhaps with a separator or in a structured format (e.g., "Context provided by user: [context string]").

5.  **Testing and Refinement:**
    *   Thoroughly test the `!c` command in various scenarios:
        *   Adding context before starting a translation session.
        *   Adding context during an ongoing session.
        *   Adding multiple context messages.
        *   Translations with and without context to compare quality.
    *   Refine the system prompt construction and context handling based on testing results to optimize translation quality and API usage.

6.  **Documentation and User Help:**
    *   Update the `help.js` command to include information and usage instructions for the `!c` command.
    *   Update `README.md` and `INSTALL.md` to document the new context feature and `!c` command for users and potential contributors.

**Milestones & Tasks:**

*   **Milestone 1: Command Structure and Context Storage**
    *   [ ] Create `src/commands/context.js` file.
    *   [ ] Implement basic command parsing for `!c [context]`.
    *   [ ] Modify `client.activeSessions` in `src/index.js` to include a `context` property (initially an empty array).
    *   [ ] Implement context storage in `client.activeSessions` within `context.js`.
    *   [ ] Add confirmation message in `context.js` when context is set.
    *   [ ] Test `!c` command to ensure context is stored in `activeSessions`.

*   **Milestone 2: System Prompt Integration**
    *   [ ] Modify `src/services/translationService.js` to retrieve context from `client.activeSessions`.
    *   [ ] Construct a dynamic system prompt that includes the base prompt and user context.
    *   [ ] Pass the modified system prompt to the translation model in `openaiModel.js`, `anthropicModel.js`, and `googleModel.js`.
    *   [ ] Test translations with context to see if it's being applied (basic test).

*   **Milestone 3: Handling Multiple Contexts & Refinement**
    *   [ ] Update `context.js` to append new context to the `context` array in `activeSessions`.
    *   [ ] Refine the system prompt construction in `translationService.js` to properly format and include multiple context strings (e.g., iterate through the `context` array).
    *   [ ] Implement detailed testing with various context examples and language pairs.
    *   [ ] Optimize system prompt formatting for better LLM performance.

*   **Milestone 4: Documentation and Help**
    *   [ ] Update `src/commands/help.js` to include `!c` command documentation.
    *   [ ] Update `README.md` to document the new context feature and `!c` command.
    *   [ ] Update `INSTALL.md` if necessary (unlikely for this feature).
    *   [ ] Final testing and cleanup.

**Timeline (Estimated):**

*   Milestone 1: 1-2 days
*   Milestone 2: 1-2 days
*   Milestone 3: 2-3 days (depending on testing and refinement needed)
*   Milestone 4: 1 day

**Total Estimated Time: 5-8 days** (This is an estimate and can vary based on your development speed and complexity encountered.)

**Dependencies:**

*   Completion of previous bot features (core translation, command system, etc.).
*   Access to LLM APIs (OpenAI, Anthropic, Google) is assumed.

**Success Criteria:**

*   Users can successfully use the `!c` command to provide translation context.
*   Context is correctly stored and retrieved by the bot.
*   Translations are demonstrably improved in accuracy and relevance when context is provided.
*   The `!c` command is documented in the help command and README.