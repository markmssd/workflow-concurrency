import * as core from '@actions/core'
import * as github from '@actions/github'

import { wait } from './wait'
import { GitHub } from '@actions/github/lib/utils'

const {
  eventName,
  sha,
  ref,
  repo: { owner, repo },
  payload
} = github.context

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  // parse inputs
  const token = core.getInput('access_token')
  const ms: string = core.getInput('milliseconds')

  const octokit = github.getOctokit(token)

  const { data: current_run } = await octokit.rest.actions.getWorkflowRun({
    owner,
    repo,
    run_id: Number(process.env.GITHUB_RUN_ID)
  })
  console.log('current_run')
  console.log(current_run)
  const workflow_id = current_run.workflow_id

  const { data } = await octokit.rest.actions.listWorkflowRuns({
    per_page: 100,
    workflow_id,
    owner,
    repo
  })

  console.log(data.total_count)
  console.log(data.workflow_runs)

  console.info('PRINTING...')
  console.info('workflow_id', workflow_id)
  console.info(process.env.GITHUB_WORKFLOW!)
  console.info(process.env.GITHUB_WORKFLOW_REF!)
  console.info(process.env.GITHUB_WORKFLOW_SHA!)
  console.info('PRINTED!')

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
