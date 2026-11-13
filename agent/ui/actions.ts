export type UIAction =
  | { type: "open_product"; link: string; title: string }
  | { type: "open_link"; link: string }
  | { type: "answer"; questionId: string; optionIds: string[] };

export type ActionHandler = (action: UIAction) => void;

/** For now every click just logs. Swap this one function later (navigate, sendMessage, ...). */
export const logAction: ActionHandler = (action) => {
  console.log("[shopping-ui]", action);
};