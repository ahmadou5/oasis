import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ExplorerSearch, type ExplorerSearchItem } from './ExplorerSearch'

function seedRecent(key: string, items: ExplorerSearchItem[]) {
  window.localStorage.setItem(key, JSON.stringify(items))
}

describe('ExplorerSearch', () => {
  const storageKey = 'test.recent'

  beforeEach(() => {
    window.localStorage.clear()
    // @ts-expect-error - test env
    global.fetch = undefined
  })

  test('renders recent searches from localStorage and can clear all', () => {
    seedRecent(storageKey, [
      {
        id: 'r1',
        title: 'Helius Validator',
        subtitle: '9xQeWv...abcd',
        type: 'VALIDATOR',
        value: '9xQeWv...abcd',
      },
    ])

    render(
      <ExplorerSearch
        recentStorageKey={storageKey}
        suggestedItems={[]}
        enableRemoteSearch={false}
      />
    )

    const input = screen.getByRole('combobox')
    fireEvent.focus(input)

    expect(screen.getByText(/RECENT SEARCHES/i)).toBeInTheDocument()
    expect(screen.getByText('Helius Validator')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /clear all recent searches/i }))
    expect(screen.getByText(/No recent searches/i)).toBeInTheDocument()
  })

  test('supports keyboard navigation and enter to select', () => {
    const onSelect = jest.fn()

    const suggestions: ExplorerSearchItem[] = [
      {
        id: 's1',
        title: 'Wrapped SOL (SOL)',
        subtitle: 'So11111111111111111111111111111111111111112',
        type: 'TOKEN',
        value: 'So11111111111111111111111111111111111111112',
        verified: true,
      },
    ]

    render(
      <ExplorerSearch
        suggestedItems={suggestions}
        enableRemoteSearch={false}
        onSelect={onSelect}
      />
    )

    const input = screen.getByRole('combobox')
    fireEvent.focus(input)

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 's1' }))
  })

  test('highlights matching text in suggestions', () => {
    const suggestions: ExplorerSearchItem[] = [
      {
        id: 's1',
        title: 'Wrapped SOL (SOL)',
        subtitle: 'So11111111111111111111111111111111111111112',
        type: 'TOKEN',
        value: 'So11111111111111111111111111111111111111112',
      },
    ]

    render(
      <ExplorerSearch
        suggestedItems={suggestions}
        enableRemoteSearch={false}
      />
    )

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'SOL' } })

    // should render <mark> for highlight
    const mark = screen.getAllByText('SOL').find((el) => el.tagName.toLowerCase() === 'mark')
    expect(mark).toBeTruthy()
  })
})
