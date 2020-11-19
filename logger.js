const LOG_LIMIT = 16;
const logList = document.getElementById("logList");

/**
 * ログ表示処理
 * @param {string} line
 */
export function addLog(line) {
  const li = document.createElement("li");
  li.innerText = `${line} [${new Date().toString()}]`;
  logList.appendChild(li);
  if (LOG_LIMIT <= logList.childElementCount) {
    logList.removeChild(logList.childNodes[0]);
  }
}
