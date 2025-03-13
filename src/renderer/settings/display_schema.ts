import * as yup from 'yup'


/*
{
  games_folder: string,
  locale_emulator: string,
  file_types: {
    Images: string[];
    Executables: string[];
    [key: string]: string[];
  },
  ignored_exes: string[]
}
*/
export default function CreateDisplayFormSchema() {
  return yup.object().shape({
    games_folder: yup.string()
      .required('Display Warning: the games folder must be set'),
    locale_emulator: yup.string(),
    file_types: yup.object().shape({
      Images: yup.array()
        .of(
          yup.string()
            .required('Display Warning: at least one image extension must be defined')
        )
        .min(1, 'Display Warning: at least one image extension must be defined'),
      Executables: yup.array()
        .of(
          yup.string()
            .required('Display Warning: at least one executable extension must be defined')
        )
        .min(1, 'Display Warning: at least one executable extension must be defined'),
    }),
    ignored_exes: yup.array()
      .of(
        yup.string()
      ),
  })
}
