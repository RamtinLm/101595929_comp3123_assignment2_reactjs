/*
Purpose:
Escape special regex characters in user text before using it in a $regex query
Without this, input like ".*" would match everything and "(" would crash the query
*/

const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

module.exports = escapeRegex
