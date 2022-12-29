 # Image Checker Action

A GitHub Action to verify all the images and ensure they exist in the **ghcr.io registry**.

## Usage

To use this action, add the following to your .github/workflows/main.yml file:

```yaml
jobs:
  image_check:
    runs-on: ubuntu-latest
    steps:
      - uses: pucke-uninow/image-checker@v1
        with:
          token: # Github token
          paths: # File paths to check
```

## Inputs

- `token` : Github token, used to authenticate against the GitHub API. **Required**.
- `paths` : File paths to check. **Required**.
 

## Outputs
The action writes the following to the action summary:

<h1>Image validation results</h1>
<table>
    <tr>
        <th>Image</th>
        <th>Result</th>
    </tr>
    <tr>
        <td>ghcr.io/supabase/studio:20221222-6b98c06</td>
        <td>✅</td>
    </tr>
    <tr>
        <td>ghcr.io/supabase/studio:00000000-0000000</td>
        <td>❌</td>
    </tr>
</table>

## Complete Example

```yaml
name: 'your-beutiful-workflow'
on:
  pull_request:
    branches:
      - main

jobs:
  image-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Get changed files
        id: files
        run: echo "PATHS=$(git diff --name-only --diff-filter=ACMRT ${{ github.event.pull_request.base.sha }} ${{ github.sha }} | xargs)" >> $GITHUB_OUTPUT
      
      - name: Check image existence
        uses: pucke-uninow/image-checker@v0.0.4
        with:
          token: ${{ secrets.UNINOW_GITHUB_TOKEN }}
          paths: ${{ steps.files.outputs.PATHS }}
```

## License

This action is licensed under the MIT License.
