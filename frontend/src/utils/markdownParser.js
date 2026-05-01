/**
 * Simple Markdown Parser Utility
 * Converts basic markdown syntax to formatted text
 * Supports: **bold**, *italic*, # headers
 */

export function parseMarkdown(text) {
  if (!text) return text;

  // Convert **bold** to <strong>
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert *italic* to <em>
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convert - list items to proper format
  text = text.replace(/^- /gm, "• ");

  return text;
}

/**
 * Parse markdown and return JSX-safe HTML
 * Used for displaying narrative text with formatting
 */
export function renderMarkdown(text) {
  if (!text) return text;

  const formatted = parseMarkdown(text);

  // Split by newlines and render as paragraphs
  const lines = formatted.split("\n").filter((line) => line.trim());

  return lines.map((line, idx) => {
    // If line starts with #, it's a header
    if (line.startsWith("# ")) {
      return {
        type: "h3",
        content: line.replace(/^# /, ""),
        id: idx,
      };
    }

    // If line starts with ##, it's a smaller header
    if (line.startsWith("## ")) {
      return {
        type: "h4",
        content: line.replace(/^## /, ""),
        id: idx,
      };
    }

    // Otherwise it's a paragraph
    return {
      type: "p",
      content: line,
      id: idx,
    };
  });
}

/**
 * Parse and split narrative text into sections
 * Handles scene descriptions with context
 */
export function parseNarrativeText(text) {
  if (!text) return { main: "", context: "" };

  // Check if text contains **Qual é o seu objetivo?** or similar context markers
  const contextMatch = text.match(
    /\*\*(.*?objetivo.*?)\*\*(.*?)(?=\n\*\*|$)/is,
  );

  if (contextMatch) {
    const main = text.substring(0, contextMatch.index).trim();
    const context = text.substring(contextMatch.index).trim();
    return { main, context };
  }

  return { main: text, context: "" };
}
