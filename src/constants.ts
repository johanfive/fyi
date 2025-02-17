import { join } from "node:path";

export const EXTENSION_NAME = "FYI";
export const FILE_NAME = "FYI.md";
export const TEMPLATE_FILE_PATH = join(__dirname, FILE_NAME);
export const DISMISS_PERMANENTLY = "Got it";
export const DISMISS_TEMPORARILY = "Not now";
export const LEARN_MORE = "Learn More";
export const CRUCIAL_PREFIX = "(!)";
export const ANCHOR_REGEX = /#([a-zA-Z0-9-_]+)$/;
export const GENERATE_MD_CMD = "fyi.generateMdFile";
export const RESET_DISSMISSED_CMD = "fyi.resetDismissedNotifications";

interface QuoteState {
  dismissedPermanently: boolean;
}

export interface FolderState {
  quotesHash: string;
  quotes: Record<string, QuoteState>;
}

export type Action = (folderPath: string) => void;
