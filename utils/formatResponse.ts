export const formatResponse = (text: string) => {
  const paragraphs = text.split("\n\n").map((p) => p.trim());

  return paragraphs
    .map((paragraph) => {
      if (paragraph.includes("1.") || paragraph.includes("-")) {
        const listItems = paragraph
          .split(/(?:\d+\.\s|-)/)
          .map((item) => item.trim())
          .filter((item) => item);

        return listItems.map((item) => `- ${item}`).join("\n");
      } else if (paragraph.length > 200) {
        const sentences = paragraph
          .split(/(?<=[.!?])\s+/)
          .map((sentence) => sentence.trim())
          .filter((sentence) => sentence);

        return sentences.join(" ");
      }

      return paragraph;
    })
    .join("\n\n");
};
