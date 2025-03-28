// TODO: implement
import React from 'react'

import InputBox from './shared/inputBox'


interface Props {
  close: () => void
}
export default function DislikeNotes({close}: Props) {
  return (
    <InputBox
      title="Games Marked as Uninterested"
      buttons={[{text: 'Close', clickHandler: close}]}
    >
      content
    </InputBox>
  )
}
