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

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // parse inputs
  const concurrency: string = core.getInput('concurrency')
  const workflow_id_input: string = core.getInput('workflow_id')
  const token = core.getInput('access_token')
  const ms: string = core.getInput('milliseconds')
  console.log('workflow_id_input')
  console.log(workflow_id_input)

  console.log('concurrency')
  console.log(concurrency)

  const octokit = github.getOctokit(token)

  const branch = ref.replace('refs/heads/', '')

  console.log('branch')
  console.log(branch)
  console.log('process.env.GITHUB_RUN_ID')
  console.log(process.env.GITHUB_RUN_ID)

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
