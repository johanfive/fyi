import * as vscode from "vscode";
import path from "node:path";
import fs from "node:fs";
import { EXTENSION_ID, EXTENSION_NAME } from "./constants";

const addToWorkspaceRecommendations = () => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return;
  }

  const vscodeDirPath = path.join(workspaceFolder.uri.fsPath, ".vscode");
  const extensionsJsonPath = path.join(vscodeDirPath, "extensions.json");
  let extensionsJson: { recommendations?: string[] } = {};

  if (!fs.existsSync(vscodeDirPath)) {
    fs.mkdirSync(vscodeDirPath);
  }

  if (fs.existsSync(extensionsJsonPath)) {
    const content = fs.readFileSync(extensionsJsonPath, "utf-8");
    extensionsJson = JSON.parse(content);
  }

  if (!extensionsJson.recommendations) {
    extensionsJson.recommendations = [];
  }

  if (!extensionsJson.recommendations.includes(EXTENSION_ID)) {
    extensionsJson.recommendations.push(EXTENSION_ID);
    fs.writeFileSync(
      extensionsJsonPath,
      JSON.stringify(extensionsJson, null, 2),
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

export default addToWorkspaceRecommendations;
