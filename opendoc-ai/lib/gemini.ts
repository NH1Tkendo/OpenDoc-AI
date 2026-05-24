import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Initialize with a fallback to avoid empty key errors during build
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
You are a Senior Technical Writer. Your task is to generate a high-quality README.md for a software project based on the provided repository structure and core file contents.

The README.md must follow this exact structure:
1.  **Badges**: Include relevant badges (e.g., build status, license, version).
2.  **Project Title & Description**: A clear title and a concise, compelling description.
3.  **Tech Stack**: List the main technologies, frameworks, and libraries used.
4.  **Architecture**: Briefly explain the project structure and key components.
5.  **Installation**: Step-by-step instructions on how to set up the project locally.
6.  **Usage**: Clear examples and instructions on how to use the project.
7.  **Contributing**: Guidelines for contributing to the project.

Guidelines:
- Use professional, clear, and concise language.
- Ensure all technical terms are used correctly.
- If certain information is not explicitly available in the context, make reasonable assumptions based on standard practices for the detected tech stack, but prioritize accuracy.
- Use clean Markdown formatting.
- DO NOT include internal file paths unless necessary for usage/installation.
- Focus on what the project DOES and HOW to use it.
`;

export async function generateDocumentationStream(
  repoInfo: { owner: string; repo: string; fullName: string },
  tree: { path: string; type: string }[],
  priorityFiles: { path: string; content: string }[],
  userApiKey?: string,
) {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY || "";
  const genAIInstance = new GoogleGenerativeAI(apiKey);

  const model = genAIInstance.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const contextParts: Part[] = [
    { text: `System Instruction: ${SYSTEM_PROMPT}\n\n` },
    { text: `Repository: ${repoInfo.fullName}\n\n` },
    { text: `Project Structure:\n${tree.map((f) => f.path).join("\n")}\n\n` },
    { text: `Core File Contents:\n` },
    ...priorityFiles.map((file) => ({
      text: `--- File: ${file.path} ---\n${file.content}\n\n`,
    })),
  ];

  const result = await model.generateContentStream(contextParts);
  return result.stream;
}
