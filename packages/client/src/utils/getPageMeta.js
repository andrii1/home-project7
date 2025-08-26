import { capitalizeFirstWord } from './capitalizeFirstWord';

const formatTitles = (titles) => {
  if (titles.length <= 3) {
    return titles.join(', ');
  }
  return `${titles.slice(0, 3).join(', ')}...`;
};

const buildMetaFromFilters = (filterConfig) => {
  const allTitles = [];

  filterConfig.forEach(({ values, options }) => {
    if (!values || values.length === 0 || !options || options.length === 0)
      return;

    // detect whether options use `id` or `key`
    const matchField = options[0]?.id !== undefined ? 'id' : 'key';

    values.forEach((val) => {
      let match;

      if (matchField === 'id') {
        const parsedVal = isNaN(val) ? val : parseInt(val, 10);
        match = options.find((item) => item.id === parsedVal);
        if (match?.title) {
          allTitles.push(match.title);
        }
      } else {
        match = options.find((item) => String(item.key) === String(val));
        if (match?.label) {
          allTitles.push(match.label);
        }
      }
    });
  });

  return allTitles;
};

export const getPageMeta = ({ filterConfig, searchParam }) => {
  const allTitles = buildMetaFromFilters(filterConfig);

  // If search is present, add it as well
  if (searchParam) {
    allTitles.push(capitalizeFirstWord(searchParam));
  }

  if (allTitles.length > 0) {
    const shortTitle = formatTitles(allTitles);
    const capitalizedShort = capitalizeFirstWord(shortTitle);
    const capitalizedLong = capitalizeFirstWord(allTitles.join(', '));

    return {
      pageMetaTitle: `${capitalizedLong} apps - Try Top Apps`,
      pageMetaDescription: `${capitalizedLong} apps - reviews, how to use, tutorials, deals, promo codes, errors.`,
      pageHeaderTitle: `${capitalizedShort} apps`,
    };
  }

  return {
    pageMetaTitle: 'Try Top Apps - find best apps',
    pageMetaDescription:
      'Reviews, how to use, tutorials, deals, promo codes, errors.',
    pageHeaderTitle: 'Find best apps',
  };
};
