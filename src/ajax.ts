import { Octokit, RestEndpointMethodTypes } from '@octokit/rest'
import * as vscode from 'vscode'

//  confirm token
const token: string | undefined = vscode.workspace
  .getConfiguration('license-generator')
  .get('token')

// if (!token) {
//   vscode.commands.executeCommand('license-generator.setToken')
// }

const octokit = new Octokit({
  auth: token,
  header: {
    accept: 'application/vnd.github+json',
  },
})

export const getLicense = (
  license: string
): Promise<RestEndpointMethodTypes['licenses']['get']['response']> => {
  return new Promise((resolve, reject) => {
    octokit
      .request('GET /licenses/{license}', {
        license,
      })
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        vscode.window.showErrorMessage(err.message)
      })
  })
}

export const getAllLicense = (): Promise<
  RestEndpointMethodTypes['licenses']['getAllCommonlyUsed']['response']
> => {
  return new Promise((resolve, reject) => {
    octokit.rest.licenses.getAllCommonlyUsed().then(res => {
      resolve(res)
    })
  })
}
