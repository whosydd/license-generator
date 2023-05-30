import * as vscode from 'vscode'

export default (folder?: vscode.Uri): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // 获取工作区路径
    let workspace = ''
    if (folder && Object.keys(folder).length > 0) {
      // 使用菜单
      workspace = folder.fsPath
    } else {
      // 使用命令
      let rootPath = ''
      const tmp = vscode.workspace.workspaceFolders
      if (tmp === undefined) {
        reject('Please open a workspace!')
      } else {
        // 如果工作区中存在的多个文件夹，显示选择框
        if (tmp.length > 1) {
          const pick = await vscode.window.showWorkspaceFolderPick()
          if (!pick) {
            return
          }
          rootPath = pick.uri.fsPath
        } else {
          const pick = tmp[0]
          rootPath = pick.uri.fsPath
        }
        workspace = rootPath
      }
    }
    resolve(workspace)
  })
}
