export default function findInSearchableFeilds(
  model: {} | string | any[],
  search: string
): boolean {
  if (!search) {
    return true;
  }

  if (!model) {
    return false;
  }

  if (typeof model === 'string') {
    const searchableFeild = model.toLocaleLowerCase();
    const searchValue = search.toLocaleLowerCase();
    if (searchableFeild.indexOf(searchValue) !== -1) {
      return true;
    }
    return false;
  }

  const values = Object.values(model);
  return values
    .filter((modelValue: any) => {
      const typeofModelValue = typeof modelValue;
      return (
        typeofModelValue &&
        typeofModelValue !== 'number' &&
        typeofModelValue !== 'boolean' &&
        typeofModelValue !== 'object'
      );
    })
    .some((modelValue: any) => {
      return findInSearchableFeilds(modelValue, search);
    });
}
