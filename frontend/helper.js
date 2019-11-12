const select = (selector) => {
  return document.querySelector(selector)
};
const selectAll = (selector) => {
  return document.querySelectorAll(selector)
};
const selectId = (id) => {
  return document.getElementById(id)
};

const hasClass = (item, classes) => {
  return item.className.includes(classes)
};

const replaceClass = (item, find, replace = '') => {
  item.className = item.className.replace(find, replace)
};