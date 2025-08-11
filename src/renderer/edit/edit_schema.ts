/* eslint-disable func-names */
import * as yup from 'yup'


export default function CreateEditFormSchema(existingTitles: string[], currentTitle?: string) {
  return yup.object().shape({
    path: yup.string(),
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
    // TODO: ensure images are unique
    image: yup.string()
      .required("Image is required"),
    version: yup.string()
      .required("Version is required"),
    description: yup.string()
      .required("Description is required"),
    program_path: yup.array()
      .of(
        yup.object().shape({
          id: yup.number(),
          paths: yup.array()
            .of(yup.string())
            .length(2)
            .test('custom-test', 'Validation failed', function (paths) {
              // innerArray = [exe_name, exe_path]
              const {path, createError} = this

              const outerArray = this.options.context!

              const outerArrayLength = outerArray.length

              if (!paths) {
                return createError({ path, message: `At path ${path}, the paths must be defined` })
              }

              const progPathIdx = parseInt(path.slice(1, -2)) + 1

              if (outerArrayLength === 1) {
                // if outerArray only has 1 item, only the second string of paths must have length > 0
                if (!paths[1] || paths[1].length === 0) {
                  return createError({ path, message: `At program path [${progPathIdx}], the Executable Path cannot be blank` });
                }
              } else if (outerArrayLength > 1) {
                // There are more than 1 executable
                // Check for uniqueness of first and second values of inner arrays
                const viewableNames = outerArray.map((item: {paths: [string, string]}) => item.paths[0]);
                const exePaths = outerArray.map((item: {paths: [string, string]}) => item.paths[1]);
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
                if (paths[0] === undefined || paths[0].length === 0) {
                  return createError({ path, message: `At program path [${progPathIdx}], the Viewable Name must not be blank` });
                }
                if (paths[1] === undefined || paths[1].length === 0) {
                  return createError({ path, message: `At program path [${progPathIdx}], the Executable Path must not be blank` });
                }
              }
              return true; // Validation passed
            })
        })
      ),
  })
}
