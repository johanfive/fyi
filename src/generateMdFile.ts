import * as vscode from "vscode";
import { copyFile } from "node:fs/promises";
import {
  Action,
  EXTENSION_NAME,
  FILE_NAME,
  RECOMMEND_CMD,
  TEMPLATE_FILE_PATH,
} from "./constants";
import { getFilePath } from "./utils";
import selectWorkspaceThenDo from "./selectWorkspaceThenDo";

const copyTemplateMdFile: Action = (folderPath) => {
  const filePath = getFilePath(folderPath);
  const fileAtLocation = `${FILE_NAME} file in workspace at ${folderPath}.`;
  return copyFile(TEMPLATE_FILE_PATH, filePath)
    .then(() => {
      vscode.window.showInformationMessage(
        `${EXTENSION_NAME} created.
        By clicking "Recommend", your team will be recommended this extension
        the next time they open this project.
        `,
        "Recommend",
      ).then((selection) => {
        if (selection === "Recommend") {
          vscode.commands.executeCommand(RECOMMEND_CMD);
        }
      });
    })
    .catch((error) => {
      console.error(error);
      vscode.window.showErrorMessage(`Unable to create ${fileAtLocation}`);
    });
};

const generateMdFile = (folderPath: string | undefined) => {
  if (folderPath) {
    copyTemplateMdFile(folderPath);
  } else {
    selectWorkspaceThenDo("create markdown file", copyTemplateMdFile);
  }
};

export default generateMdFile;
