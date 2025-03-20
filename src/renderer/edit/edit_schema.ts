/* eslint-disable func-names */
import * as yup from 'yup'


export default function CreateEditFormSchema(existingTitles: string[], currentTitle?: string) {
  return yup.object().shape({
    path: yup.string()
      .required("Path is required"),
    title: yup.string()
      .required("Title is required")
      .test('check-unique', 'Title must be unique (or the same it used to be)', function (value) {
        const { createError } = this
        if ((currentTitle && value === currentTitle) || !existingTitles.includes(value)) {
          return true // valid
        }
        return createError({ message: 'title must be unique' })
      }),
    url: yup.string()
      .required("Url is required"),
    image: yup.array()
      .of(
        yup.string()
          .required("Image is required"),
      )
      .min(1, "Image is required"),
    version: yup.string()
      .required("Version is required"),
    description: yup.string()
      .required("Description is required"),
    program_path: yup.array()
      .of(
        yup.array()
          .of(yup.string())
          .length(2)
          .test('custom-test', 'If parent array has length 1, only the exe path must have length. Otherwise, every exe path must be unique and every viewable name must be unique', function (value) {
            // innerArray = [exe_name, exe_path]
            const {path, createError} = this
            const outerArrayLength = this.parent.length


            if (!value) {
              return createError({ path, message: `At path ${path}, the inner array must be defined` })
            }

            const progPathIdx = parseInt(path.slice(1, -1)) + 1
            if (outerArrayLength === 1) {
              // if outerArray only has 1 item, only the second string of innerArray must have length > 0
              if (!value[1] || value[1].length === 0) {
                return createError({ path, message: `At the [${progPathIdx}] program path, the Executable Path cannot be blank` });
              }
            } else if (outerArrayLength > 1) {
              // There are more than 1 executable
              // Check for uniqueness of first and second values of inner arrays
              const viewableNames = this.parent.map((innerArray: [string, string]) => innerArray[0]);
              const exePaths = this.parent.map((innerArray: [string, string]) => innerArray[1]);
              // Sets remove duplicates, so if the array and the set have a different length, there was a duplicate
              const hasDuplicateName = viewableNames.length !== new Set(viewableNames).size;
              const hasDuplicatePath = exePaths.length !== new Set(exePaths).size;

              if (hasDuplicateName) {
                return createError({ path, message: `The Viewable Names must be unique` });
              }

              if (hasDuplicatePath) {
                return createError({ path, message: `The Executable Paths must be unique` });
              }
              // Both strings must have length
              if (value[0] === undefined || value[0].length === 0) {
                return createError({ path, message: `At the [${progPathIdx}] program path, the Viewable Name must not be blank` });
              }
              if (value[1] === undefined || value[1].length === 0) {
                return createError({ path, message: `At the [${progPathIdx}] program path, the Executable Path must not be blank` });
              }
            }
            return true; // Validation passed
          })
      ),
  })
}
