import { capitalizeFirstWord } from './capitalizeFirstWord';

export const getPageMeta = ({
  filteredCategories,
  categories: inputCategories,
  filteredTags,
  tags: inputTags,
  searchParam: inputSearchParam,
}) => {
  if (filteredCategories.length > 0) {
    const categoryTitle = inputCategories.find(
      (category) => category.id === parseInt(filteredCategories, 10),
    );
    const title = categoryTitle?.title || 'this category';
    const capitalizedTitle = capitalizeFirstWord(title);

    return {
      pageMetaTitle: `${capitalizedTitle} apps - Try Top Apps`,
      pageMetaDescription: `${capitalizedTitle} apps - reviews, how to use, tutorials, deals, promo codes, errors.`,
      pageHeaderTitle: `${capitalizedTitle} apps`,
    };
  }

  if (filteredTags.length > 0) {
    const tagTitle = inputTags.find((tag) => tag.slug === filteredTags);
    const title = tagTitle?.title || 'this topic';
    const capitalizedTitle = capitalizeFirstWord(title);
    return {
      pageMetaTitle: `${capitalizedTitle} apps - Try Top Apps`,
      pageMetaDescription: `${capitalizedTitle} apps - reviews, how to use, tutorials, deals, promo codes, errors.`,
      pageHeaderTitle: `${capitalizedTitle} apps`,
    };
  }

  if (inputSearchParam) {
    const capitalizedSearch = capitalizeFirstWord(inputSearchParam);
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
