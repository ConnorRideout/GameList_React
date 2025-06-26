import * as yup from 'yup'

/*
categories: {
  category_id: number;
  category_name: string;
  options: {
    option_id: number,
    option_name: string
  }[];
  default_option: string | null
}[],
statuses: {
  status_id: number;
  status_name: string;
  status_priority: number;
  status_color: string;
  status_color_applies_to: string;
}[],
tags: {
  tag_id: number;
  tag_name: string[];
}
*/
export default function CreateGamesFormSchema() {
  return yup.object().shape({
    categories: yup.array()
      .of(
        yup.object().shape({
          category_id: yup.number()
            .required(),
          category_name: yup.string()
            .required('Game Preferences > Category Warning: every category needs a name')
            .matches(/^[^"]*$/, 'Game Preferences > Category Warning: cannot use any double quotes'),
          options: yup.array()
            .of(
              yup.object().shape({
              option_id: yup.number()
                .required(),
              option_name: yup.string()
                .required('Game Preferences > Category Warning: options need a name')
                .matches(/^[^"]*$/, 'Game Preferences > Category Warning: cannot use any double quotes')
              }),
            )
            .min(1, 'Game Preferences > Category Warning: there must be at least 1 option for each category'),
          default_option: yup.string()
            .nullable()
        })
      )
      .min(1, "Game Preferences > Category Error: at least 1 category must be defined")
      .test('unique-names', 'Game Preferences > Category Warning: category names must be unique', (categories) => {
        if (!categories) return true
        const names = categories.map(c => c.category_name.trim().toLowerCase())
        const uniqueNames = new Set(names)
        return names.length === uniqueNames.size
      })
      .min(1, "Game Preferences > Category Warning: there must be at least 1 category"),

    statuses: yup.array()
      .of(
        yup.object().shape({
          status_id: yup.number(),
          status_name: yup.string()
            .required('Game Preferences > Status Warning: every status needs a name')
            .matches(/^[^"]*$/, 'Game Preferences > Status Warning: cannot use any double quotes'),
          status_priority: yup.number(),
          status_color: yup.string()
            .required('Game Preferences > Status Warning: status colors must be defined')
            .matches(/^[^"]*$/, 'Game Preferences > Status Warning: cannot use any double quotes')
            .min(7, 'Game Preferences > Status Warning: status colors must be a valid hex color'),
          status_color_applies_to: yup.string()
            .matches(/^[^"]*$/, 'Game Preferences > Status Warning: cannot use any double quotes'),
        })
      )
      .min(1, "Game Preferences > Statuses Error: at least 1 status must be defined")
      .test('unique-names', 'Game Preferences > Status Warning: status names must be unique', (statuses) => {
        if (!statuses) return true
        const names = statuses.map(s => s.status_name.trim().toLowerCase())
        const uniqueNames = new Set(names)
        return names.length === uniqueNames.size
      })
      .min(1, 'Game Preferences > Status Warning: there must be at least 1 status'),

    tags: yup.array()
      .of(
        yup.object().shape({
          tag_id: yup.number()
            .required(),
          tag_name: yup.string()
            .required('Game Preferences > Tag Warning: every tag needs a name')
            .matches(/^[^"]*$/, 'Game Preferences > Tag Warning: cannot use any double quotes')
        })
      )
      .min(1, 'Game Preferences > Tag Error: there must be at least 1 tag')
      .test('unique-names', 'Game Preferences > Tag Warning: tag names must be unique', (tags) => {
        if (!tags) return true
        const tag_names = tags.map(t => t.tag_name.trim().toLowerCase())
        const uniqueNames = new Set(tag_names)
        return tag_names.length === uniqueNames.size
      })
  })
}
