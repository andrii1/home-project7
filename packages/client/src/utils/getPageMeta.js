import { capitalizeFirstWord } from './capitalizeFirstWord';

const formatTitles = (titles) => {
  if (titles.length <= 3) {
    return titles.join(', ');
  }

  // Show first 3 + "and more"
  return `${titles.slice(0, 3).join(', ')} and more`;
};

const buildMeta = (filtered, input, matchField, matchBy) => {
  const titles = filtered
    .map((val) => {
      return input.find((item) => item[matchField] === matchBy(val))?.title;
    })
    .filter(Boolean);

  const shortTitle = formatTitles(titles);
  const capitalizedShort = capitalizeFirstWord(shortTitle);

  return {
    pageMetaTitle: `${capitalizedShort} apps - Try Top Apps`,
    pageMetaDescription: `${capitalizedShort} apps - reviews, how to use, tutorials, deals, promo codes, errors.`,
    pageHeaderTitle: `${capitalizedShort} apps`,
  };
};

export const getPageMeta = ({
  filteredCategories,
  categories,
  filteredTags,
  tags,
  filteredFeatures,
  features,
  filteredUserTypes,
  userTypes,
  filteredBusinessModels,
  businessModels,
  filteredUseCases,
  useCases,
  filteredIndustries,
  industries,
  searchParam,
}) => {
  if (filteredCategories !== undefined && filteredCategories.length > 0) {
    return buildMeta(filteredCategories, categories, 'id', (val) =>
      parseInt(val, 10),
    );
  }

  if (filteredTags !== undefined && filteredTags.length > 0) {
    return buildMeta(filteredTags, tags, 'slug', (val) => val);
  }

  if (filteredFeatures !== undefined && filteredFeatures.length > 0) {
    return buildMeta(filteredFeatures, features, 'id', (val) =>
      parseInt(val, 10),
    );
  }

  if (filteredUserTypes !== undefined && filteredUserTypes.length > 0) {
    return buildMeta(filteredUserTypes, userTypes, 'id', (val) =>
      parseInt(val, 10),
    );
  }

  if (
    filteredBusinessModels !== undefined &&
    filteredBusinessModels.length > 0
  ) {
    return buildMeta(filteredBusinessModels, businessModels, 'id', (val) =>
      parseInt(val, 10),
    );
  }

  if (filteredUseCases !== undefined && filteredUseCases.length > 0) {
    return buildMeta(filteredUseCases, useCases, 'id', (val) =>
      parseInt(val, 10),
    );
  }

  if (filteredIndustries !== undefined && filteredIndustries.length > 0) {
    return buildMeta(filteredIndustries, industries, 'id', (val) =>
      parseInt(val, 10),
    );
  }

  if (searchParam) {
    const capitalizedSearch = capitalizeFirstWord(searchParam);
    return {
      pageMetaTitle: `${capitalizedSearch} apps - Try Top Apps`,
      pageMetaDescription: `${capitalizedSearch} apps - reviews, how to use, tutorials, deals, promo codes, errors.`,
      pageHeaderTitle: `${capitalizedSearch} apps`,
    };
  }

  return {
    pageMetaTitle: 'Try Top Apps - find best apps',
    pageMetaDescription:
      'Reviews, how to use, tutorials, deals, promo codes, errors.',
    pageHeaderTitle: 'Find best apps',
  };
};
