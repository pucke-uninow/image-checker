import {expect, it} from '@jest/globals'
import {
  buildRegistryQueryUrl,
  checkImageManifest,
  parseImageString
} from '../src/main'

const {GITHUB_TOKEN = ''} = process.env
it.each([
  [
    'ghcr.io/supabase/supabase/studio:20221222-6b98c06',
    {
      org: 'supabase',
      repo: 'supabase',
      imageName: 'studio',
      tag: '20221222-6b98c06'
    }
  ],
  [
    'ghcr.io/supabase/studio:20221222-6b98c06',
    {
      org: 'supabase',
      repo: null,
      imageName: 'studio',
      tag: '20221222-6b98c06'
    }
  ],
  [
    'ghcr.io/uninow/scraping/scraping:v1.104.2',
    {
      org: 'uninow',
      repo: 'scraping',
      imageName: 'scraping',
      tag: 'v1.104.2'
    }
  ]
])('parse %p expecting %p', async (input, expectedOutput) => {
  const output = parseImageString(input)

  expect(output.org).toEqual(expectedOutput.org)
  expect(output.repo).toEqual(expectedOutput.repo)
  expect(output.imageName).toEqual(expectedOutput.imageName)
  expect(output.tag).toEqual(expectedOutput.tag)
})

it.each([
  [
    {
      org: 'supabase',
      repo: null,
      imageName: 'studio',
      tag: '20221222-6b98c06'
    },
    200
  ],
  [
    {
      org: 'supabase',
      repo: 'supabase',
      imageName: 'studio',
      tag: '0000000-000000'
    },
    404
  ],
  [
    {
      org: 'uninow',
      repo: 'scraping',
      imageName: 'scraping',
      tag: 'v1.104.2'
    },
    200
  ],
  [
    {
      org: 'uninow',
      repo: 'scraping',
      imageName: 'scraping',
      tag: 'v3.0.0'
    },
    404
  ]
])(
  'check manifest for %p expecting %p',
  async ({org, repo, imageName, tag}, expectedStatusCode) => {
    const url = buildRegistryQueryUrl(org, repo, imageName, tag)
    const response = await checkImageManifest(url, GITHUB_TOKEN)

    expect(response.message.statusCode).toEqual(expectedStatusCode)
  }
)
