export const saveToLocalStorage = function (key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

export const getFromLocalStorage = function (key){
  return JSON.parse(localStorage.getItem(key)) || {};
}