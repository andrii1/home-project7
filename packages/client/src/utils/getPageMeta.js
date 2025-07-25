import { capitalizeFirstWord } from './capitalizeFirstWord';

export const getPageMeta = ({
  categoryIdParam: inputCategoryIdParam,
  categories: inputCategories,
  tagSlugParam: inputTagSlugParam,
  tags: inputTags,
  searchParam: inputSearchParam,
}) => {
  console.log(inputCategories);

  if (inputCategoryIdParam) {
    const categoryTitle = inputCategories.find(
      (category) => category.id === parseInt(inputCategoryIdParam, 10),
    );
    const title = categoryTitle?.title || 'this category';
    const capitalizedTitle = capitalizeFirstWord(title);

    return {
      pageMetaTitle: `${capitalizedTitle} apps - Try Top Apps`,
      pageMetaDescription: `${capitalizedTitle} apps - reviews, how to use, tutorials, deals, promo codes, errors.`,
      pageHeaderTitle: `${capitalizedTitle} apps`,
    };
  }

  if (inputTagSlugParam) {
    const tagTitle = inputTags.find((tag) => tag.slug === inputTagSlugParam);
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
