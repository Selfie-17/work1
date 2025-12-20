export function exec(command, value = null) {
    document.execCommand(command, false, value);
}

export function insertHTML(html) {
    exec("insertHTML", html);
}

export function setBlock(tag) {
    exec("formatBlock", tag);
}
