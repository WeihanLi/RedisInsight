import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import BulkDelete, { Props } from './BulkDelete'

const mockedProps = {
  ...mock<Props>(),
}

/**
 * BulkDelete tests
 *
 * @group unit
 */
describe('BulkDelete', () => {
  it('should render', () => {
    expect(render(<BulkDelete {...mockedProps} />)).toBeTruthy()
  })

  it('click on Cancel btn should call onCancel prop', () => {
    const mockOnCancel = jest.fn()
    render(<BulkDelete {...mockedProps} onCancel={mockOnCancel} />)

    fireEvent.click(screen.getByTestId('bulk-action-cancel-btn'))

    expect(mockOnCancel).toBeCalled()
  })
})
