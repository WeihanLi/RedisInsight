import React, {
  ChangeEvent,
  Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiProgress, EuiText, EuiTextArea } from '@elastic/eui'
import { onlyText } from 'react-children-utilities'

import { formattingBuffer, Nullable } from 'uiSrc/utils'
import {
  resetStringValue,
  stringDataSelector,
  stringSelector,
  updateStringValueAction,
} from 'uiSrc/slices/browser/string'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { AddStringFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { selectedKeyDataSelector, selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { stringToBuffer } from 'uiSrc/utils/formatters/bufferFormatters'

import styles from './styles.module.scss'

const MAX_ROWS = 25
const MIN_ROWS = 4
const APPROXIMATE_WIDTH_OF_SIGN = 8.3

export interface Props {
  isEditItem: boolean;
  setIsEdit: (isEdit: boolean) => void;
}

const StringDetails = (props: Props) => {
  const { isEditItem, setIsEdit } = props

  const { loading } = useSelector(stringSelector)
  const { value: initialValue } = useSelector(stringDataSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)

  const [rows, setRows] = useState<number>(5)
  const [value, setValue] = useState<Nullable<string | JSX.Element>>(null)
  const [areaValue, setAreaValue] = useState<string>('')
  const [viewFormat, setViewFormat] = useState(viewFormatProp)

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)
  const viewValueRef: Ref<HTMLPreElement> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(resetStringValue())
  }, [])

  useEffect(() => {
    if (!initialValue) return

    const initialValueString = formattingBuffer(initialValue, viewFormatProp)

    setValue(initialValueString)
    setAreaValue(onlyText(initialValueString) || '')

    if (viewFormat !== viewFormatProp) {
      setViewFormat(viewFormatProp)
    }
  }, [initialValue, viewFormatProp])

  useEffect(() => {
    // Approximate calculation of textarea rows by initialValue
    if (!isEditItem || !textAreaRef.current || value === null) {
      return
    }
    const text = onlyText(value)
    const calculatedBreaks = text.split('\n').length
    const textAreaWidth = textAreaRef.current.clientWidth
    const OneRowLength = textAreaWidth / APPROXIMATE_WIDTH_OF_SIGN
    const calculatedRows = Math.round(text.length / OneRowLength + calculatedBreaks)

    if (calculatedRows > MAX_ROWS) {
      setRows(MAX_ROWS)
      return
    }
    if (calculatedRows < MIN_ROWS) {
      setRows(MIN_ROWS)
      return
    }
    setRows(calculatedRows)
  }, [viewValueRef, isEditItem])

  useMemo(() => {
    if (isEditItem) {
      (document.activeElement as HTMLElement)?.blur()
    }
  }, [isEditItem])

  const onApplyChanges = () => {
    const onSuccess = () => {
      setIsEdit(false)
      setValue(areaValue)
    }
    dispatch(updateStringValueAction(key, stringToBuffer(areaValue), onSuccess))
  }

  const onDeclineChanges = () => {
    setAreaValue(onlyText(value) || '')
    setIsEdit(false)
  }

  const isLoading = loading || value === null

  return (
    <div className={styles.container}>
      {isLoading && (
        <EuiProgress
          color="primary"
          size="xs"
          position="absolute"
          data-testid="progress-key-string"
        />
      )}
      {!isEditItem && (
        <EuiText
          onClick={() => setIsEdit(true)}
        >
          <pre className={styles.stringValue} data-testid="string-value" ref={viewValueRef}>
            {value !== '' ? value : (<span style={{ fontStyle: 'italic' }}>Empty</span>)}
          </pre>
        </EuiText>
      )}
      {isEditItem && (
        <InlineItemEditor
          initialValue={onlyText(value) || ''}
          controlsPosition="bottom"
          placeholder="Enter Value"
          fieldName="value"
          expandable
          isLoading={false}
          onDecline={onDeclineChanges}
          onApply={onApplyChanges}
          declineOnUnmount={false}
        >
          <EuiTextArea
            fullWidth
            name="value"
            id="value"
            rows={rows}
            resize="vertical"
            placeholder={config.value.placeholder}
            value={areaValue}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setAreaValue(e.target.value)
            }}
            disabled={loading}
            inputRef={textAreaRef}
            className={styles.stringTextArea}
            data-testid="string-value"
          />
        </InlineItemEditor>
      )}
    </div>
  )
}

export default StringDetails
