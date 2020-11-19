/**
 * FileSystemHandleのinterface
 * @see https://wicg.github.io/file-system-access/#api-filesystemfilehandle
 * @typedef {Object} FileSystemHandle
 * @property {()=> Promise<File>} getFile
 * @property {(options?:FileSystemCreateWritableOptions = {}) => Promise<FileSystemWritableFileStream>} createWritable
 *
 * ファイル展開時の返却オブジェクト
 * @typedef {Object} FileOpenResult
 * @property {FileSystemHandle} handle
 * @property {String} text
 */

/**
 * ファイル書き込み
 *
 * @param {FileSystemFileHandle} fileHandle
 * @param {String|BufferSource|Blob} contents 書き込み内容
 */
async function _writeFile(fileHandle, contents) {
  // writer作成 (パーミッションが必要なときもある)
  const writable = await fileHandle.createWritable();
  // // [optional] 空のファイルを用意 Make sure we start with an empty file
  // await writable.truncate(0);
  // コンテンツを書き込む Write the full length of the contents
  await writable.write(contents);
  // ファイル閉じる Close the file and write the contents to disk
  await writable.close();
}

/**
 * ファイル保存処理
 *
 * @param {FileSystemFileHandle} [handle] 処理ハンドル：指定した場合は「上書き」、無い場合は「名前を付けて保存」
 * @param {string} contents 書き込み内容
 * @return {FileSystemHandle|false} 失敗時にfalseを返す
 */
export async function saveFile(handle = null, contents) {
  try {
    if (!handle) {
      // 名前を付けて保存
      handle = await window.showSaveFilePicker({
        types: [
          {
            description: "Text Files",
            accept: {
              "text/plain": [".txt"],
            },
          },
        ],
      });
    }
    await _writeFile(handle, contents);
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
  const result = {
    handle: null,
    text: ""
  };

  /** @type FileSystemHandle */
  let fileHandle;
  try {
    // showOpenFilePickerはファイルハンドルの配列を返すため、Destructuring assignmentを使って最初のファイルハンドルだけ変数代入
    [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Text Files",
          accept: {
            "text/plain": [".txt", ".text"],
          },
        },
      ],
    });
    result.handle = fileHandle;
  } catch (ex) {
    console.error("ファイル取得に失敗しました", ex);
    return false;
  }

  // 内容取得
  const file = await fileHandle.getFile();
  try {
    const text = await file.text();
    result.text = text;
    return result;
  } catch (ex) {
    console.error("テキスト取得に失敗しました", ex);
    return false;
  }
}

/**
 * Native File System APIがサポートされているかどうか
 * APIはいくつかあるが、基本的なshowOpenFilePickerの存在を確認する
 */
export function isNativeFileSystemSupported() {
  // eslint-disable-next-line no-undef
  return "showOpenFilePicker" in window;
}
