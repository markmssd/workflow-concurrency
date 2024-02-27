import * as core from '@actions/core'
import * as github from '@actions/github'

import { wait } from './wait'

const {
  repo: { owner, repo },
  payload,
  ref
} = github.context

console.log('ref')
console.log(ref)

// getting branch on pull_request event is different from push
const getBranch = (context: any) => {
  if (context.payload.pull_request) {
    return context.payload.pull_request.head.ref
  }
  return context.ref.replace('refs/heads/', '')
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // parse inputs
  const concurrency: string = core.getInput('concurrency')
  const token = core.getInput('access_token')

  console.log('concurrency')
  console.log(concurrency)

  const octokit = github.getOctokit(token)

  const branch = getBranch(github.context)

  console.log('branch')
  console.log(branch)
  console.log('github.context')
  console.log(github.context)

  const {
    data: { workflow_id }
  } = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: Number(process.env.GITHUB_RUN_ID)
  })

  console.log('workflow_id')
  console.log(workflow_id)

  const {
    data: { total_count, workflow_runs }
  } = await octokit.rest.actions.listWorkflowRuns({
    per_page: 100,
    workflow_id,
    branch,
    owner,
    repo
  })

  const runningWorkflowRuns = workflow_runs.filter(
    run => run.status !== 'completed'
  )

  console.log('total_count')
  console.log(total_count)
  console.log('runningRuns', runningWorkflowRuns.length)
  console.log(runningWorkflowRuns)

  try {
    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
