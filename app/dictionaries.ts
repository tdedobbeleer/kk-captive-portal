import 'server-only'
 
const dictionaries = {
  nl: () => import('./dictionaries/nl.json').then((module) => module.default),
}
 
export type Locale = keyof typeof dictionaries
 
export const getDictionary = async () => dictionaries['nl']()