import * as core from '@actions/core'
import {HttpClient} from '@actions/http-client'
import {SummaryTableCell} from '@actions/core/lib/summary'
import fs from 'fs'
import yaml from 'js-yaml'

const httpClient = new HttpClient()

const IMAGE_REGEX =
  /ghcr\.io\/(?<org>\w+)\/(?<repo>\w+)\/(?<imageName>\w+):(?<tag>.*)/

function buildRegistryQueryUrl(
  org: string,
  repo: string,
  imageName: string,
  tag: string
): string {
  return `https://ghcr.io/v2/${org}/${repo}/${imageName}/manifests/${tag}`
}

function parseImageString(image: string): {
  org: string
  repo: string
  imageName: string
  tag: string
} {
  const {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    groups: {org, repo, imageName, tag}
  } = image.match(IMAGE_REGEX)

  if (!org || !repo || !imageName || !tag) {
    core.setFailed(`Could not parse Image string: ${image}`)
    return {org: '', repo: '', imageName: '', tag: ''}
  }

  return {org, repo, imageName, tag}
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('token')

    if (!token) {
      core.setFailed('No token provided')
      return
    }

    const paths = core.getInput('paths')

    if (!paths) {
      core.setFailed('No paths provided')
      return
    }

    const pathsArray = paths.split(' ')

    const result: SummaryTableCell[][] = []

    for (const path of pathsArray) {
      if (!(path.includes('.yaml') || path.includes('.yml'))) {
        continue
      }
      const file = fs.readFileSync(path, {encoding: 'utf8'})

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const yamlFile: any = yaml.load(file)

      for (const container of yamlFile?.spec?.template?.spec?.containers ??
        []) {
        const {org, repo, imageName, tag} = parseImageString(container?.image)

        const url = buildRegistryQueryUrl(org, repo, imageName, tag)

        const encodedToken = new Buffer(token).toString('base64')

        const response = await httpClient.get(url, {
          Authorization: `Bearer ${encodedToken}`
        })

        result.push([
          {data: container?.image},
          {data: response.message.statusCode === 200 ? '✅' : '❌'}
        ])
      }

      core.debug(`YAML file: ${JSON.stringify(yamlFile)}`)
      core.debug(`Result: ${JSON.stringify(result)}`)
    }

    await core.summary
      .addHeading('Image validation results')
      .addTable([
        [
          {data: 'Image', header: true},
          {data: 'Result', header: true}
        ],
        ...result
      ])
      .write()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
