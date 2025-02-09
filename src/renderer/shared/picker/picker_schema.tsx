import * as yup from 'yup'
import { TagEntry, StatusEntry, CategoryEntry } from '../../../types'


export default function CreateFormSchema(categories: CategoryEntry[] | {category_name: string}[], statuses: StatusEntry[], rawtags: TagEntry[]) {
  const cats = categories.map(c => c.category_name)
  const stats = statuses.map(s => s.status_name)
  const tags = rawtags.map(t => t.tag_name)

  return yup.object().shape({
    categories: yup.object()
      .shape(cats.reduce((acc: {[key: string]: any}, cur) => {
        acc[cur] = yup.string().required("Must select an option for all categories")
        return acc
      }, {})),
    statuses: yup.object()
      .shape(stats.reduce((acc:{[key: string]: any}, cur) => {
        acc[cur] = yup.number().integer()
        return acc
      }, {})),
    tags: yup.object()
      .shape(tags.reduce((acc:{[key: string]: any}, cur) => {
        acc[cur] = yup.number().integer()
        return acc
      }, {}))
  })
}
