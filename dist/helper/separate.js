"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResponse = parseResponse;
function parseResponse(input) {
    const titleMatch = input.match(/title:\s*(.+)/i);
    const descMatch = input.match(/cover_letter:\s*([\s\S]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled";
    const cover_letter = descMatch ? descMatch[1].trim() : "";
    return { title, description: cover_letter };
}
