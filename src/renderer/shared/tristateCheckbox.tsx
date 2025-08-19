import React, { ChangeEvent } from "react"

interface Props {
  children?: React.ReactNode,
  labelText: string,
  handleFormChange: (evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>, tristate: boolean) => void,
  checkState: number,
  style?: Object,
}
/**
 * A tristate checkbox. The logic for tristate must be handled in the parent component using the `Props.handleFormChange` and passed back with `Props.checkState`
 * @param Props - The properties to pass to the component
 * @param Props.labelText - The text that the label should display. If children are passed to the component, they will be displayed instead
 * @param Props.handleFormChange - A callback function that is called every time the tristate checkbox is clicked.
 * The callback will be passed 2 parameters: the event object and a boolean indicating if the checkbox is currently in tristate
 * @param Props.checkState - The state variable that tells the tristate checkbox what check state to have. 1=checked, 0=unchecked, -1=tristate
 * @param Props.style - Styles to pass to the component
 * @returns The Tristate Checkbox React component
 */
export default function TristateCheckbox({children, labelText, handleFormChange, checkState, style={}}: Props) {

  const checkboxClicked = (evt: ChangeEvent<HTMLInputElement>) => {
    const tristate = checkState === 0
    handleFormChange(evt, tristate)
  }

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label style={style} className="tristate-checkbox">
      <input
        className="tristate"
        type="checkbox"
        name={labelText}
        checked={checkState === 1}
        onChange={checkboxClicked}
        ref={(el) => {
          if (el) el.indeterminate = (checkState === -1)
        }}
      />
      {children || labelText}
    </label>
  )
}
