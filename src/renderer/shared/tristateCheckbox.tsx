import React, {useState, ChangeEvent} from "react"

interface Props {
  labelText: string,
  handleFormChange: (evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>, tristate: boolean) => void,
  style?: Object,
}
export default function TristateCheckbox({labelText, handleFormChange, style}: Props) {
  const [checked, setChecked] = useState(false)
  const [indeterminate, setIndeterminate] = useState(true)

  const checkboxClicked = (evt: ChangeEvent<HTMLInputElement>) => {
    let tristate = false
    if (indeterminate) {
      // is indeterminate, change to true
      setIndeterminate(false)
      setChecked(true)
    } else if (checked) {
      // is checked, change to unchecked
      setChecked(false)
      setIndeterminate(false)
    } else {
      // is unchecked, change to indeterminate
      setChecked(false)
      setIndeterminate(true)
      tristate = true
    }
    handleFormChange(evt, tristate)
  }

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label style={style}>
      <input
        type="checkbox"
        name={labelText}
        checked={checked}
        onChange={checkboxClicked}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate
        }}
      />
      {labelText}
    </label>
  )
}
