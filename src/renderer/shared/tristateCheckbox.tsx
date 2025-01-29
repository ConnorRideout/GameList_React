import React, {useState} from "react"

interface Props {
  labelText: string,
  name: string,
  style: Object,
}
export default function TristateCheckbox({labelText, name, style}: Props) {
  const [checked, setChecked] = useState(false)
  const [indeterminate, setIndeterminate] = useState(true)

  const checkboxClicked = () => {
    if (indeterminate) {
      setIndeterminate(false)
      setChecked(false)
    } else if (checked) {
      setChecked(false)
      setIndeterminate(true)
    } else {
      setChecked(true)
      setIndeterminate(false)
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <label style={style} htmlFor={name} onClick={checkboxClicked}>
      <input
        type="checkbox"
        name={name}
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
