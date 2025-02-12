/* eslint-disable func-names */
import * as yup from 'yup'


// path, title, url, image, version, description, program_path: prog_obj
export default function CreateEditFormSchema() {
  return yup.object().shape({
    path: yup
      .string()
      .required("path is required"),
    title: yup
      .string()
      .required("title is required"),
    url: yup
      .string()
      .required("url is required"),
    image: yup
      .string()
      .required("image is required"),
    version: yup
      .string()
      .required("version is required"),
    description: yup
      .string()
      .required("description is required"),
    program_path: yup
      .array()
      .of(
        yup.array()
          .of(yup.string())
          .length(2)
          .test('custom-test', 'If parent array has length 1, only the second string must have length', function (value) {
            const {path, createError} = this
            const outerArrayLength = this.parent.length

            if (!value) {
              return createError({ path, message: `At path ${path}, the inner array must be defined` })
            }

            if (outerArrayLength === 1) {
              // if outerArray only has 1 item, only the second string of innerArray must have length > 0
              if (!value[1] || value[1].length === 0) {
                return createError({ path, message: `At path ${path}, the second string must have length` });
              }
            } else if (outerArrayLength > 1) {
              // if outerArray is longer that 1, both strings of innerArray must have length > 1
              if (value[0] === undefined || value[0].length <= 1 || value[1] === undefined || value[1].length <= 1) {
                return createError({ path, message: `At path ${path}, both strings must have length > 1` });
              }
            }
            return true; // Validation passed
          })
      ),
  })
}
