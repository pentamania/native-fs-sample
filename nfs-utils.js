/**
 * ファイル展開時の返却オブジェクト
 * @typedef {Object} FileOpenResult
 * @property {FileSystemHandle} handle
 * @property {String} text
 */

/**
 * ファイル書き込み
 * 
 * @param {FileSystemFileHandle} fileHandle @see https://wicg.github.io/file-system-access/#api-filesystemfilehandle
 * @param {String|BufferSource|Blob} contents 書き込み内容
 */
async function writeFile(fileHandle, contents) {
  // writer作成 (パーミッションが必要なときもある)
  const writer = await fileHandle.createWriter();
  // 空のファイルを用意 Make sure we start with an empty file
  await writer.truncate(0);
  // コンテンツを書き込む Write the full length of the contents
  await writer.write(0, contents);
  // ファイル閉じる Close the file and write the contents to disk
  await writer.close();
}

/**
 * ファイル保存処理
 * 
 * @param {FileSystemFileHandle} [handle] 処理ハンドル：指定した場合は「上書き」、無い場合は「名前を付けて保存」
 * @param {string} contents 書き込み内容
 * @return {FileSystemHandle|false} 失敗時にfalseを返す
 */
export async function saveFile(handle=null, contents) {
  try {
    if (!handle) {
      // 名前を付けて保存
      handle = await window.chooseFileSystemEntries({
        type: "saveFile", // "openFile"=def, "saveFile", "openDirectory"
        accepts: [
          {
            description: "テキストファイル",
            mimeTypes: ["text/plain"],
            extensions: ["txt"],
          },
        ],
      });
    }
    await writeFile(handle, contents);
    return handle;
  } catch (ex) {
    const msg = "保存に失敗しました";
    console.error(msg, ex);
    return false;
  }
}

/**
 * ファイルを開く
 * 
 * @return {FileOpenResult|false} 失敗時にfalseを返す
 */
export async function openFile() {
  const result = {};
  let handle;
  let file;
  try {
    handle = await window.chooseFileSystemEntries({
      accepts: [
        {
          description: "Text file",
          mimeTypes: ["text/plain"],
          extensions: ["txt"],
        },
      ],
    });
    file = await handle.getFile();
    result["handle"] = handle;
  } catch (ex) {
    console.error("ファイル取得に失敗しました", ex);
    return false;
  }

  // 内容取得
  try {
    const text = await file.text();
    result["text"] = text;
    return result;
  } catch (ex) {
    console.error("テキスト取得に失敗しました", ex);
    return false;
  }
}
