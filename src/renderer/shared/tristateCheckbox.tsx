import React, { ChangeEvent } from "react"

interface Props {
  labelText: string,
  handleFormChange: (evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>, tristate: boolean) => void,
  checkState: number;
  style?: Object,
}
export default function TristateCheckbox({labelText, handleFormChange, checkState, style}: Props) {

  const checkboxClicked = (evt: ChangeEvent<HTMLInputElement>) => {
    const tristate = checkState === 0
    handleFormChange(evt, tristate)
  }

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label style={style}>
      <input
        type="checkbox"
        name={labelText}
        checked={checkState === 1}
        onChange={checkboxClicked}
        ref={(el) => {
          if (el) el.indeterminate = (checkState === -1)
        }}
      />
      {labelText}
    </label>
  )
}
