import React from 'react'
import {Machine, assign} from 'xstate'
import {useMachine} from '@xstate/react'

const context = {data: null, error: null}
const RESOLVE = {
  target: 'resolved',
  actions: 'setData',
}
const REJECT = {
  target: 'rejected',
  actions: 'setError',
}
const APIMachine = Machine(
  {
    id: 'api',
    initial: 'idle',
    context,
    states: {
      idle: {
        on: {
          START: 'pending'
        },
      },
      pending: {
        on: {RESOLVE, REJECT},
      },
      resolved: {
        on: {RESOLVE, REJECT},
      },
      rejected: {
        on: {RESOLVE, REJECT},
      },
    },
  },
  {
    actions: {
      setData: assign({
        data: (context, event) => event.data,
      }),
      setError: assign({
        error: (context, event) => event.error,
      }),
    },
  },
)

export default function useAPI(url) {
  const [state, send] = useMachine(APIMachine)

  React.useEffect(() => {
    send('START')
      fetch(url).then(async response => {
        const data = await response.json()
        send({type: 'RESOLVE', data})
      }).catch(error => {
        send({type: 'REJECT', error})
      })
  }, [send, url])

  return state
}