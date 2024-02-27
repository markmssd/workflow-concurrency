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
console.log('github.context')
console.log(github.context)

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // parse inputs
  const token = core.getInput('access_token')
  const ms: string = core.getInput('milliseconds')

  const octokit = github.getOctokit(token)

  let branch
  if (payload.pull_request) {
    branch = payload.pull_request.head.ref
  } else {
    branch = payload.workflow_run.head_branch
  }

  console.log('branch')
  console.log(branch)
  console.log('ref')
  console.log(ref)
  console.log('payload.workflow_run')
  console.log(payload.workflow_run)

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
    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
