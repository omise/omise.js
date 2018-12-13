/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * Helpers - utils
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */

export function merge(dest, source) {
  return Object.assign({}, dest, source)
}

export function clone(source) {
  return safeJsonParse(JSON.stringify(source))
}

export function safeJsonParse(str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return str
  }
}

export function isEmpty(value) {
  return value == null || value === '' ? true : false
}

/**
 * Helper for transfrom string `camelCase` to `dash`.
 *
 * @param {string} str - string for transform.
 * @return {string} string after transform.
 */
export function camelCaseToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2')
}

// http://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
export function dashToCamelCase(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase())
}

/**
 * Helper function to extrack all data from element.
 *
 * @param {element} element - element for extract data.
 * @return {object} all data and value.
 */
export function extractDataFromElement(element) {
  const extractData = {}
  const totalAttrs = element.attributes.length

  for (let i = 0; i < totalAttrs; i++) {
    const attr = element.attributes[i]

    // Exteact all only data from element
    if (/^data/.test(attr.name)) {
      const name = dashToCamelCase(attr.name.replace('data-', ''))
      extractData[name] = attr.value
    }
  }

  return extractData
}
