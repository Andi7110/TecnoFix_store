export function cleanQueryParams(params = {}) {
  return Object.entries(params).reduce((accumulator, [key, value]) => {
    if (value === "" || value === null || value === undefined) {
      return accumulator;
    }

    accumulator[key] = value;

    return accumulator;
  }, {});
}
