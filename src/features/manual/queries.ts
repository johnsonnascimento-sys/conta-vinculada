import { readFile } from "node:fs/promises";
import path from "node:path";

export interface UserManualBlockParagraph {
  type: "paragraph";
  text: string;
}

export interface UserManualBlockList {
  type: "list";
  items: string[];
}

export interface UserManualBlockSubheading {
  type: "subheading";
  text: string;
}

export type UserManualBlock =
  | UserManualBlockParagraph
  | UserManualBlockList
  | UserManualBlockSubheading;

export interface UserManualSection {
  id: string;
  title: string;
  blocks: UserManualBlock[];
}

export interface UserManualData {
  title: string;
  sections: UserManualSection[];
}

const manualPath = path.join(process.cwd(), "docs", "MANUAL_DO_USUARIO.md");

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeInlineMarkdown(value: string) {
  return value.replace(/`([^`]+)`/g, "$1").trim();
}

function pushParagraph(
  section: UserManualSection | null,
  paragraphLines: string[],
) {
  if (!section || paragraphLines.length === 0) {
    return;
  }

  section.blocks.push({
    type: "paragraph",
    text: normalizeInlineMarkdown(paragraphLines.join(" ")),
  });
  paragraphLines.length = 0;
}

function pushList(section: UserManualSection | null, listItems: string[]) {
  if (!section || listItems.length === 0) {
    return;
  }

  section.blocks.push({
    type: "list",
    items: listItems.map(normalizeInlineMarkdown),
  });
  listItems.length = 0;
}

export async function getUserManual(): Promise<UserManualData> {
  const content = await readFile(manualPath, "utf8");
  const lines = content.split(/\r?\n/);
  const sections: UserManualSection[] = [];
  let currentSection: UserManualSection | null = null;
  const paragraphLines: string[] = [];
  const listItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      continue;
    }

    if (trimmed.startsWith("## ")) {
      pushParagraph(currentSection, paragraphLines);
      pushList(currentSection, listItems);

      const title = normalizeInlineMarkdown(trimmed.slice(3));
      currentSection = {
        id: slugify(title),
        title,
        blocks: [],
      };
      sections.push(currentSection);
      continue;
    }

    if (!currentSection) {
      continue;
    }

    if (trimmed.startsWith("### ")) {
      pushParagraph(currentSection, paragraphLines);
      pushList(currentSection, listItems);
      currentSection.blocks.push({
        type: "subheading",
        text: normalizeInlineMarkdown(trimmed.slice(4)),
      });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      pushParagraph(currentSection, paragraphLines);
      listItems.push(trimmed.slice(2));
      continue;
    }

    if (trimmed.length === 0) {
      pushParagraph(currentSection, paragraphLines);
      pushList(currentSection, listItems);
      continue;
    }

    paragraphLines.push(trimmed);
  }

  pushParagraph(currentSection, paragraphLines);
  pushList(currentSection, listItems);

  return {
    title: "Manual do Usuario",
    sections,
  };
}
