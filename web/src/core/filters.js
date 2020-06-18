import { format, parseISO } from 'date-fns';

export const formatDateFilter = function(value) {
  
  if (value && Object.prototype.toString.call(value) === '[object String]') {
    return format(parseISO(value), 'MM/dd/yyyy');
  }
  else if (value && Object.prototype.toString.call(value) === '[object Date]') {
    return format(value, 'MM/dd/yyyy');
  }
};

export const formatDateTimeFilter = function(value) {
  
  if (value && Object.prototype.toString.call(value) === '[object String]') {
    return format(parseISO(value), 'MM/dd/yyyy h:mma');
  }
  else if (value && Object.prototype.toString.call(value) === '[object Date]') {
    return format(value, 'MM/dd/yyyy h:mma');
  }
};

export const titleCaseFilter = function(value) {
  if (!value) {
    return '';
  }

  value = value.toLowerCase().split(' ');
  let final = [];
  for (let word of value) {
    final.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  return final.join(' ');
};

export const useFilters = vueInstance => {
  vueInstance.filter('formatDateTime', formatDateTimeFilter);
  vueInstance.filter('formatDate', formatDateFilter);
  vueInstance.filter('titleCase', titleCaseFilter);
};
