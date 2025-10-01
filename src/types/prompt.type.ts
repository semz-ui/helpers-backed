export type promptType = "formal" | "casual" | "persuasive" | "apologetic" | "follow_up" | "aggressive" | "friendly" | "pidgin";

export type PromptTypes = {
    label: string;
    value: string;
}

export type PromptHelper = {
    [key in promptType]: string
}