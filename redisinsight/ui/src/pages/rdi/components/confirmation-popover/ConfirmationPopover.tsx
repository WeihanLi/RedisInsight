import React, { useState } from 'react'
import {
  EuiIcon,
  EuiPopover,
  EuiText,
} from '@elastic/eui'

import { formatLongName } from 'uiSrc/utils'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import styles from './styles.module.scss'

interface Props {
  title: string
  body: JSX.Element
  onConfirm: () => void
  button: JSX.Element
  submitBtn: JSX.Element
  onButtonClick?: () => void
  appendAction?: JSX.Element
}

const ConfirmationPopover = (props: Props) => {
  const {
    title,
    body,
    submitBtn,
    onConfirm,
    button,
    onButtonClick,
    appendAction,
  } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const handleClosePopover = () => {
    setIsPopoverOpen(false)
  }

  const handleConfirm = () => {
    onConfirm()
    setIsPopoverOpen(false)
  }

  const handleButtonClick = () => {
    setIsPopoverOpen(true)
    onButtonClick?.()
  }

  const popoverButton = React.cloneElement(button, {
    onClick: handleButtonClick,
  })
  const confirmBtn = React.cloneElement(submitBtn, { onClick: handleConfirm })

  return (
    <OutsideClickDetector onOutsideClick={handleClosePopover}>
      <EuiPopover
        id="confirmation-popover"
        initialFocus={false}
        ownFocus
        anchorPosition="downCenter"
        isOpen={isPopoverOpen}
        closePopover={handleClosePopover}
        panelPaddingSize="m"
        display="inlineBlock"
        panelClassName={styles.panelPopover}
        button={popoverButton}
      >
        <Row align="center">
          <FlexItem>
            <EuiIcon type="alert" className={styles.alertIcon} />
          </FlexItem>
          <FlexItem className="eui-textNoWrap">
            <EuiText>{formatLongName(title, 58, 0, '...')}</EuiText>
          </FlexItem>
        </Row>
        <Spacer size="xs" />
        {body}
        <Spacer size="m" />
        <Row justify={appendAction ? 'between' : 'end'} align="center">
          <FlexItem>{!!appendAction && appendAction}</FlexItem>
          <FlexItem>{confirmBtn}</FlexItem>
        </Row>
      </EuiPopover>
    </OutsideClickDetector>
  )
}

export default ConfirmationPopover
