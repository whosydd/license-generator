import * as cp from 'child_process'
import * as path from 'path'
import { TextEncoder } from 'util'
import * as vscode from 'vscode'
import { getAllLicense, getLicense } from './ajax'
import getWorkspace from './getWorkspace'
import { setTokenHandler } from './pat'
import { replaceAuthor, replaceYear } from './replace'

interface QuickpickItem extends vscode.QuickPickItem {
  key: string
}

export function activate(context: vscode.ExtensionContext) {
  // set token
  const setToken = vscode.commands.registerCommand('license-generator.setToken', () =>
    setTokenHandler('license-generator', 'License Generator')
  )

  let disposable = vscode.commands.registerCommand('license-generator.generate', async folder => {
    generator(context, folder)
  })

  let mit = vscode.commands.registerCommand('license-generator.generate-mit', async folder => {
    generator(context, folder, 'mit')
  })

  context.subscriptions.push(disposable, setToken, mit)
}

// This method is called when your extension is deactivated
export function deactivate() {}

const generator = async (
  context: vscode.ExtensionContext,
  folder: vscode.Uri,
  license?: string
) => {
  try {
    if (folder === undefined) {
      folder = vscode.Uri.file(await getWorkspace())
    }

    if (license) {
      const text = await getLicense(license)
      if (text.status !== 200) {
        throw new Error('bad request')
      }
      download(context, folder, license, text.data.body)
    } else {
      const licenses = await getAllLicense()
      if (licenses.status !== 200) {
        throw new Error('bad request')
      }

      const quickpick = vscode.window.createQuickPick()
      quickpick.busy = true
      quickpick.items = licenses.data.map(item => {
        const quickpickItem = {
          label: item.spdx_id!,
          detail: item.name,
          description: '',
          key: item.key,
        }
        // if (item.key === 'mit') {
        //   quickpickItem.description = 'Default'
        // }
        return quickpickItem
      })
      quickpick.busy = false

      quickpick.onDidAccept(async () => {
        quickpick.hide()

        const select = quickpick.selectedItems[0] as QuickpickItem
        const license = await getLicense(select.label)
        if (license.status !== 200) {
          throw new Error('bad request')
        }
        download(context, folder, select.key, license.data.body)
      })

      quickpick.onDidHide(() => {
        quickpick.dispose()
      })

      quickpick.show()
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(error.message)
  }
}

const download = async (
  context: vscode.ExtensionContext,
  folder: vscode.Uri,
  key: string,
  text: string
) => {
  let year = ''
  // context.workspaceState.update((select as QuickpickItem).key, undefined)
  let prevYear = context.workspaceState.get<number>(key)
  let currYear = new Date().getFullYear()
  if (prevYear === undefined || prevYear === currYear) {
    year = currYear + ''
  } else {
    year = `${prevYear}-${currYear}`
  }

  const yearReplacedText = replaceYear(year, key, text)

  cp.exec('git config --get user.name', { cwd: folder.fsPath }, async (err, stdout, stderr) => {
    let author

    if (err) {
      vscode.window.showErrorMessage(err.message)
      return
    }

    if (stderr) {
      vscode.window.showErrorMessage(stderr)
      return
    }

    if (stdout !== '') {
      author = stdout
    } else {
      vscode.window.showInformationMessage(`Can't find author in the ~/.gitconfig`)
      return
    }

    const license = replaceAuthor(author!, key, yearReplacedText)
    const content = new TextEncoder().encode(license)

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
      },
      async progress => {
        progress.report({
          message: 'Downloading ...',
        })

        vscode.workspace.fs.writeFile(
          vscode.Uri.file(path.resolve(folder.fsPath, 'LICENSE')),
          content
        )
      }
    )
  })
}
