import * as vscode from "vscode";
import path from "node:path";
import fs from "node:fs";
import * as jsonc from "jsonc-parser";
import { EXTENSION_ID, EXTENSION_NAME } from "./constants";
import selectWorkspaceThenDo from "./selectWorkspaceThenDo";

const addToRecommendations = (folderPath: string) => {
  const vscodeDirPath = path.join(folderPath, ".vscode");
  const extensionsJsonPath = path.join(vscodeDirPath, "extensions.json");
  let extensionsJson: { recommendations?: string[] } = {};
  let errors: jsonc.ParseError[] = [];
  let content = "{}";
  if (!fs.existsSync(vscodeDirPath)) {
    fs.mkdirSync(vscodeDirPath);
  }
  if (fs.existsSync(extensionsJsonPath)) {
    content = fs.readFileSync(extensionsJsonPath, "utf-8");
    extensionsJson = jsonc.parse(content, errors);
    if (errors.length > 0) {
      vscode.window.showErrorMessage(
        `Error parsing extensions.json: ${
          jsonc.printParseErrorCode(errors[0].error)
        }`,
      );
      return;
    }
  }
  if (!Array.isArray(extensionsJson.recommendations)) {
    extensionsJson.recommendations = [];
  }
  if (!extensionsJson.recommendations.includes(EXTENSION_ID)) {
    extensionsJson.recommendations.push(EXTENSION_ID);
    const edits = jsonc.modify(
      content,
      ["recommendations"],
      extensionsJson.recommendations,
      { formattingOptions: {} },
    );
    const updatedContent = jsonc.applyEdits(content, edits);
    fs.writeFileSync(
      extensionsJsonPath,
      updatedContent,
      "utf8",
    );
    vscode.window.showInformationMessage(
      `Added ${EXTENSION_NAME} to workspace recommendations.
      Make sure .vscode/extensions.json remains version controlled.`,
    );
  } else {
    vscode.window.showInformationMessage(
      `${EXTENSION_NAME} is already in workspace recommendations.`,
    );
  }
};

const addToWorkspaceRecommendations = () => {
  selectWorkspaceThenDo(
    `add ${EXTENSION_NAME} to recommendations`,
    addToRecommendations,
  );
};

export default addToWorkspaceRecommendations;
