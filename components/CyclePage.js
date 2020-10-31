import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import stringToColor from 'string-to-color'
import nearestColor from 'nearest-color'
import Bet from '../components/Bet'
import HillChart from '../components/HillChart'
import Scope from '../components/Scope'
import ChartLegend from '../components/ChartLegend'
import HistoryStatusUpdate from '../components/HistoryStatusUpdate'
import colors from '../components/colors'
import data from '../data.json'
import progress from '../progress.json'

export default function CyclePage({ visibleCycle, previousCycle, nextCycle, inCycle, bets, scopes }) {
  const [visibleBet, setVisibleBet] = useState(bets[0])
  const [visibleScopes, setVisibleScopes] = useState(scopes.filter(scope => belongsToBet(bets[0], scope)))
  const [selectedScopes, setSelectedScopes] = useState(scopes.filter(scope => belongsToBet(bets[0], scope)))

  function onBetChange({ issue, toggled }) {
    if (toggled) {
      setVisibleBet(issue)
      const allScopesFromBet = scopes.filter(scope => belongsToBet(issue, scope))
      setVisibleScopes(allScopesFromBet)
      setSelectedScopes(allScopesFromBet)
    }
  }

  function onScopeChange({ issue, toggled }) {
    setSelectedScopes(visibleScopes.filter(scope => {
      return issue.number !== scope.number || toggled ? scope : false
    }))
  }

  function belongsToBet(bet, scope) {
    if (!bet) return false
    if (!scope || !scope.parent_epics || scope.parent_epics.length === 0) return false
    return !!scope.parent_epics.find(pe => pe.issue_number === bet.number && pe.repo_id === bet.repo_id)
  }

  const history = selectedScopes.map(scope => {
    return scope.progress.history.map(h => {
      return {
        progress: h,
        scope,
      }
    })
  }).flat().sort((h1, h2) => {
    return new Date(h2.updatedAt) - new Date(h1.updatedAt)
  })

  const isPastCycle = new Date(visibleCycle.due_on) < new Date()

  return (
    <>
      <Head>
        <title>Shape Up Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-white">
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="lg:flex lg:justify-between">
            <div className="max-w-xl">
              <Link href="/">
                <a><h2 className="text-4xl leading-10 font-extrabold text-gray-900 sm:text-5xl sm:leading-none sm:tracking-tight lg:text-6xl">Shape Up 🏋️‍♀️</h2></a>
              </Link>
              <p className="mt-5 text-xl leading-7 text-gray-500">This dashboard shows the progress we're making during this 6-weeks cycle.</p>
            </div>
            <div className="mt-10 w-full max-w-xs">
              Logo
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div>
              <div className="lg:shadow lg:p-4">
                <div className="pb-5 border-b border-gray-200 space-y-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Bets
                  </h3>
                  <p className="max-w-4xl text-sm leading-5 text-gray-500">Ideas we're now <strong>committed</strong> to implement during this 6 weeks cycle.</p>
                </div>

                <div>
                  {
                    bets.map((bet, index) => (
                      <Bet key={index} issue={bet} toggled={bet.issue_number === visibleBet.issue_number} className="mt-3" onChange={onBetChange} />
                    ))
                  }
                  {
                    !visibleBet && (
                      <p className="italic text-sm text-gray-400 mt-4">No bets have been created yet.</p>
                    )
                  }
                </div>

                <div className="mt-8 pb-5 border-b border-gray-200 space-y-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Scopes
                  </h3>
                  <p className="max-w-4xl text-sm leading-5 text-gray-500">
                    Scopes are groups of related tasks.
                  </p>
                </div>

                <div>
                  {
                    visibleScopes.map((scope, index) => (
                      <Scope key={index} toggled={!!selectedScopes.find(s => s.number === scope.number)} issue={scope} onChange={onScopeChange} className="mt-3" />
                    ))
                  }
                  {
                    !visibleScopes.length && (
                      <p className="italic text-sm text-gray-400 mt-4">No scopes have been created yet.</p>
                    )
                  }
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              {
                !inCycle && (
                  <div className="rounded-md bg-yellow-50 p-4 mb-8">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm leading-5 font-medium text-yellow-800">
                          Attention
                        </h3>
                        <div className="mt-2 text-sm leading-5 text-yellow-700">
                          <p>
                            {
                              isPastCycle ? (
                                <span>
                                  This cycle has already finished.
                                  <a href="/" className="inline-flex mx-1.5 text-sm text-gray-900 font-medium hover:text-gray-600 transition ease-in-out duration-150">Go to the current cycle.</a>
                                </span>
                              ) : `This cycle hasn't started yet.`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              <div className="flex">
                <h2 className="flex-1 text-2xl leading-6 font-medium text-gray-900">
                  {inCycle ? 'Current' : 'This'} cycle
                </h2>
                <div className="flex">
                  <Link href={previousCycle ? `/cycles/${previousCycle.id}` : ''}>
                    <a title="Go to the previous cycle">
                      <svg className={`w-6 h-6 ${!previousCycle && 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </a>
                  </Link>

                  <Link href={nextCycle ? `/cycles/${nextCycle.id}` : ''}>
                    <a title="Go to the next cycle">
                      <svg className={`w-6 h-6 ${!nextCycle && 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </Link>
                </div>
              </div>
              <p className="my-4 text-gray-500">The {inCycle ? 'current' : 'this'} cycle {inCycle ? 'started' : 'starts'} on {new Date(visibleCycle.start_date).toDateString()} and will finish on {new Date(visibleCycle.due_on).toDateString()}.</p>
              <HillChart scopes={selectedScopes} />
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {
                  selectedScopes.map((scope, index) => (
                    <ChartLegend key={index} issue={scope} className="mt-3" />
                  ))
                }
              </div>
              <h3 className="mt-12 mb-8 text-xl leading-6 font-medium text-gray-900">
                History
              </h3>
              <div>
                {
                  history.map((statusUpdate, index) => (
                    <HistoryStatusUpdate key={index} statusUpdate={statusUpdate} className="mt-4" />
                  ))
                }
                {
                  !history.length && (
                    <p className="italic text-sm text-gray-400 mt-4">No history yet.</p>
                  )
                }
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export async function getStaticProps({ params }) {
  let inCycle = false
  if (params && params.id) {
    data.visibleCycle = data.cycles.find(cycle => String(cycle.id) === params.id)
    const startDate = new Date(data.visibleCycle.start_date)
    const endDate = new Date(data.visibleCycle.due_on)
    const now = new Date()
    inCycle = (startDate <= now && endDate >= now)
  } else {
    data.visibleCycle = data.cycles.find(cycle => {
      const startDate = new Date(cycle.start_date)
      const endDate = new Date(cycle.due_on)
      const now = new Date()
      if (endDate < now) return false
      if (startDate <= now && endDate >= now) inCycle = true
      return cycle
    })
  }
  const visibleCycleIndex = data.cycles.findIndex(cycle => cycle.id === data.visibleCycle.id)
  data.previousCycle = visibleCycleIndex > 0 ? data.cycles[visibleCycleIndex - 1] : null
  data.nextCycle = visibleCycleIndex < data.cycles.length - 1 ? data.cycles[visibleCycleIndex + 1] : null
  data.inCycle = inCycle

  data.bets = data.bets.filter(b => b.milestone && data.visibleCycle && b.milestone.id === data.visibleCycle.id)

  data.scopes = data.scopes.map(scope => {
    const scopeProgress = progress.find(p => p.issue_number === scope.number)
    scope.progress = scopeProgress || null
    scope.color = nearestColor.from(colors)(stringToColor(scope.title))
    return scope
  })

  return {
    props: {
      ...data,
    },
  }
}