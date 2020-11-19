import { openFile, saveFile, isNativeFileSystemSupported } from "./nfs-utils.js";
import { addLog } from "./logger.js";

const nativeFSSupported = isNativeFileSystemSupported();
let globalFSHandle;

// キーボードイベント定義
document.addEventListener("keydown", async (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyS") {
    /* 名前を付けて保存 */
    e.preventDefault();
    if (!nativeFSSupported) {
      alert("Native File Systemがサポートされてません");
      return;
    }

    const fsHandle = await saveFile(
      null,
      document.getElementById("content").value
    );
    if (fsHandle) {
      globalFSHandle = fsHandle;
      addLog("新規保存しました");
    } else {
      addLog("保存できませんでした");
    }
  } else if (e.ctrlKey && e.code === "KeyS") {
    /* （上書き）保存 */
    e.preventDefault();
    if (!nativeFSSupported) {
      alert("Native File Systemがサポートされてません");
      return;
    }

    const fsHandle = await saveFile(
      globalFSHandle,
      document.getElementById("content").value
    );
    if (fsHandle) {
      globalFSHandle = fsHandle;
      addLog("保存しました");
    } else {
      addLog("保存できませんでした");
    }
  } else if (e.ctrlKey && e.code === "KeyO") {
    /* ファイルを開く */
    e.preventDefault();
    if (!nativeFSSupported) {
      alert("Native File Systemがサポートされてません");
      return;
    }

    const res = await openFile();
    if (res) {
      globalFSHandle = res.handle;
      document.getElementById("content").value = res.text;
      addLog("ファイルを開きました");
    } else {
      addLog("ファイルを開けませんでした");
    }
  }
});

// サポート状況をログで表示
addLog(`お使いのブラウザはNative File Systemをサポートして${(nativeFSSupported) ? "います！" : "いません..."}`);
