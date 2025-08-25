import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Link,
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Apps.Style.css';
import { apiURL } from '../../apiURL';
import { Card } from '../../components/Card/Card.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../components/Button/Button.component';
import { Loading } from '../../components/Loading/Loading.Component';
import DropDownView from '../../components/CategoriesListDropDown/CategoriesListDropDown.component';
// eslint-disable-next-line import/no-extraneous-dependencies
import InfiniteScroll from 'react-infinite-scroll-component';
import Modal from '../../components/Modal/Modal.Component';
import { useUserContext } from '../../userContext';
import { capitalize } from '../../utils/capitalize';
import { getPageMeta } from '../../utils/getPageMeta';
import {
  PRICING_OPTIONS,
  PLATFORMS_OPTIONS,
  SOCIAL_MEDIA,
  OTHER,
} from '../../lib/constants/filters';

import {
  faSearch,
  faFilter,
  faList,
  faGrip,
  faBookmark as faBookmarkSolid,
  faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import mousePointer from '../../assets/images/mouse-pointer.svg';
import { logInWithEmailAndPassword } from '../../firebase';

const tabs = ['Categories', 'Tags', 'Searches'];

export const Apps = () => {
  const { user } = useUserContext();
  const location = useLocation();
  const { categoryIdParam, searchParam, tagSlugParam } = useParams();
  const [searchTerms, setSearchTerms] = useState();
  const [sortOrder, setSortOrder] = useState('Recent');
  const [resultsHome, setResultsHome] = useState([]);
  const [topics, setTopics] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [filteredFeatures, setFilteredFeatures] = useState([]);
  const [filteredUserTypes, setFilteredUserTypes] = useState([]);
  const [filteredBusinessModels, setFilteredBusinessModels] = useState([]);
  const [filteredUseCases, setFilteredUseCases] = useState([]);
  const [filteredIndustries, setFilteredIndustries] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredPricingPreview, setFilteredPricingPreview] = useState([]);
  const [filteredPlatformsPreview, setFilteredPlatformsPreview] = useState([]);
  const [filteredSocialsPreview, setFilteredSocialsPreview] = useState([]);
  const [filteredOtherPreview, setFilteredOtherPreview] = useState([]);
  const [filteredPricing, setFilteredPricing] = useState([]);
  const [filteredPlatforms, setFilteredPlatforms] = useState([]);
  const [filteredSocials, setFilteredSocials] = useState([]);
  const [filteredOther, setFilteredOther] = useState([]);
  const [filtersSubmitted, setFiltersSubmitted] = useState(false);
  const [showFiltersContainer, setShowFiltersContainer] = useState(false);
  const [showCategoriesContainer, setShowCategoriesContainer] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [page, setPage] = useState(0);
  const [counter, setCounter] = useState(0);
  const [apps, setApps] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [orderBy, setOrderBy] = useState({
    column: 'id',
    direction: 'desc',
  });
  const [pricingOptionsChecked, setPricingOptionsChecked] = useState(
    PRICING_OPTIONS.map((opt) => ({ ...opt, checked: false })),
  );
  const [platformsOptionsChecked, setPlatformsOptionsChecked] = useState(
    PLATFORMS_OPTIONS.map((opt) => ({ ...opt, checked: false })),
  );
  const [socialMediaOptionsChecked, setSocialMediaOptionsChecked] = useState(
    SOCIAL_MEDIA.map((opt) => ({ ...opt, checked: false })),
  );
  const [otherOptionsChecked, setOtherOptionsChecked] = useState(
    OTHER.map((opt) => ({ ...opt, checked: false })),
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('Categories');
  const [showTagsContainer, setShowTagsContainer] = useState(false);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [searchTrending, setSearchTrending] = useState([]);
  const navigate = useNavigate();

  console.log(pricingOptionsChecked, 'pricing');

  const toggleModal = () => {
    setOpenModal(false);
    document.body.style.overflow = 'visible';
  };

  useEffect(() => {
    const categoriesFromUrl = searchParams.get('categories');
    if (categoriesFromUrl) {
      setFilteredCategories(categoriesFromUrl.split(',').map(Number));
    } else {
      setFilteredCategories([]);
    }

    // ✅ reset page & apps when categories change
    // setPage(0);
    // setApps({ data: [], lastItem: null, hasMore: true });
  }, [searchParams]);

  // first fetch
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: 0,
      column: orderBy.column,
      direction: orderBy.direction,
    });

    // Categories
    if (filteredCategories.length > 0) {
      params.append('categories', filteredCategories.join(','));
    }

    // Pricing
    if (filtersSubmitted && filteredPricing.length > 0) {
      params.append('pricing', filteredPricing.join(','));
    }

    // Platforms
    if (filtersSubmitted && filteredPlatforms.length > 0) {
      params.append('platforms', filteredPlatforms.join(','));
    }

    // Socials
    if (filtersSubmitted && filteredSocials.length > 0) {
      params.append('socials', filteredSocials.join(','));
    }

    // Other
    if (filtersSubmitted && filteredOther.length > 0) {
      params.append('other', filteredOther.join(','));
    }

    // Search
    if (searchParam !== undefined) {
      params.append('search', searchParam);
    }

    // Tag
    if (tagSlugParam !== undefined) {
      params.append('tag', tagSlugParam);
    }

    const url = `${apiURL()}/apps?${params.toString()}`;

    async function fetchData() {
      const response = await fetch(url);
      const json = await response.json();

      let hasMore = true;
      if (json.data.some((item) => item.id === json.lastItem.id)) {
        hasMore = false;
      }

      setApps({
        data: json.data,
        lastItem: json.lastItem,
        hasMore,
      });
      // setPage((prevPage) => prevPage + 1);
      setPage(1);
      setIsLoading(false);
    }

    fetchData();
  }, [
    filteredCategories,
    orderBy.column,
    orderBy.direction,
    filteredPricing,
    filtersSubmitted,
    searchParam,
    tagSlugParam,
    filteredPlatforms,
    filteredSocials,
    filteredOther,
  ]);

  const fetchApps = async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page,
      column: orderBy.column,
      direction: orderBy.direction,
    });

    // Categories
    if (filteredCategories.length > 0) {
      params.append('categories', filteredCategories.join(','));
    }

    // Pricing
    if (filtersSubmitted && filteredPricing.length > 0) {
      params.append('pricing', filteredPricing.join(','));
    }

    // Platforms
    if (filtersSubmitted && filteredPlatforms.length > 0) {
      params.append('platforms', filteredPlatforms.join(','));
    }

    // Socials
    if (filtersSubmitted && filteredSocials.length > 0) {
      params.append('socials', filteredSocials.join(','));
    }

    // Other
    if (filtersSubmitted && filteredOther.length > 0) {
      params.append('other', filteredOther.join(','));
    }

    // Search
    if (searchParam !== undefined) {
      params.append('search', searchParam);
    }

    // Tag
    if (tagSlugParam !== undefined) {
      params.append('tag', tagSlugParam);
    }

    const url = `${apiURL()}/apps?${params.toString()}`;

    // const url = `${apiURL()}/apps?page=${page}&column=${
    //   orderBy.column
    // }&direction=${orderBy.direction}${
    //   filteredCategories.length > 0
    //     ? `&categories=${filteredCategories.join(',')}`
    //     : ''
    // }${
    //   filtersSubmitted && filteredPricing.length > 0
    //     ? `&pricing=${encodeURIComponent(filteredPricing)}`
    //     : ''
    // }${
    //   filtersSubmitted && filteredDetails.length > 0
    //     ? `&filteredDetails=${encodeURIComponent(filteredDetails)}`
    //     : ''
    // }${searchParam !== undefined ? `&search=${searchParam}` : ''}${
    //   tagSlugParam !== undefined ? `&tag=${tagSlugParam}` : ''
    // }`;

    const response = await fetch(url);
    const json = await response.json();

    // setApps({ data: json.data, totalCount: json.totalCount, hasMore });

    let hasMore = true;

    if (json.data.some((item) => item.id === json.lastItem.id)) {
      hasMore = false;
    }

    setApps((prevItems) => {
      return {
        data: [...prevItems.data, ...json.data],
        lastItem: json.lastItem,
        hasMore,
      };
    });

    setPage((prev) => prev + 1);
  };

  // const setupUrlFilters = useCallback(async () => {
  //   let urlFilters = '';
  //   if (filteredTopics.length > 0) {
  //     urlFilters = `?filteredTopics=${filteredTopics}`;
  //   }
  //   return urlFilters;
  // }, [filteredTopics]);

  useEffect(() => {
    async function fetchAppsSearch() {
      const responseApps = await fetch(`${apiURL()}/apps/`);

      const responseAppsJson = await responseApps.json();

      if (searchTerms) {
        const filteredSearch = responseAppsJson.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerms.toLowerCase()) ||
            item.description
              .toLowerCase()
              .includes(searchTerms.toLowerCase()) ||
            item.categoryTitle
              .toLowerCase()
              .includes(searchTerms.toLowerCase()),
        );
        setResultsHome(filteredSearch);
      }
    }
    fetchAppsSearch();
  }, [searchTerms]);

  useEffect(() => {
    setPage(0);
  }, [location]);

  useEffect(() => {
    setPage(0);
  }, [sortOrder]);

  useEffect(() => {
    setPage(0);
  }, [filteredPricing]);

  // useEffect(() => {
  //   setPage(0);
  // }, [filteredDetails]);

  useEffect(() => {
    // async function fetchTopics() {
    //   const response = await fetch(`${apiURL()}/topics/`);
    //   const topicsResponse = await response.json();
    //   setTopics(topicsResponse);
    // }

    async function fetchCategories() {
      const response = await fetch(`${apiURL()}/categories/`);
      const categoriesResponse = await response.json();
      setCategories(categoriesResponse);
    }

    async function fetchTags() {
      const response = await fetch(`${apiURL()}/tags/`);
      const data = await response.json();
      setTags(data);
    }

    // fetchApps();
    // fetchTopics();
    fetchCategories();
    fetchTags();
  }, []);

  const handleSearch = (event) => {
    setSearchTerms(event.target.value);
  };

  const filterHandlerPricing = (event) => {
    const { checked, value: key } = event.target;

    if (checked) {
      // Add to preview
      setFilteredPricingPreview((prev) => [...prev, key]);

      // Update state
      setPricingOptionsChecked((prev) =>
        prev.map((item) =>
          item.key === key ? { ...item, checked: true } : item,
        ),
      );
    } else {
      // Remove from preview
      setFilteredPricingPreview((prev) =>
        prev.filter((filterTopic) => filterTopic !== key),
      );

      // Update state
      setPricingOptionsChecked((prev) =>
        prev.map((item) =>
          item.key === key ? { ...item, checked: false } : item,
        ),
      );
    }
  };

  const filterHandlerPlatforms = (event) => {
    const { checked, value: key } = event.target;

    if (checked) {
      // Add to preview
      setFilteredPlatformsPreview((prev) => [...prev, key]);

      // Update state
      setPlatformsOptionsChecked((prev) =>
        prev.map((item) =>
          item.key === key ? { ...item, checked: true } : item,
        ),
      );
    } else {
      // Remove from preview
      setFilteredPlatformsPreview((prev) =>
        prev.filter((filterTopic) => filterTopic !== key),
      );

      // Update state
      setPlatformsOptionsChecked((prev) =>
        prev.map((item) =>
          item.key === key ? { ...item, checked: false } : item,
        ),
      );
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setFiltersSubmitted(true);
    setFilteredPricing(filteredPricingPreview);
    setFilteredPlatforms(filteredPlatformsPreview);
  };

  const clearFiltersHandler = (event) => {
    const newItemsDetails = platformsOptionsChecked.map((item) => {
      return { ...item, checked: false };
    });
    setPlatformsOptionsChecked(newItemsDetails);

    const newItemsPricing = pricingOptionsChecked.map((item) => {
      return { ...item, checked: false };
    });
    setPricingOptionsChecked(newItemsPricing);
    setFilteredPlatforms([]);
    setFilteredPricing([]);
  };

  const filterHandler = (type, id) => {
    let currentValues;
    let setter;

    switch (type) {
      case 'categories':
        currentValues = filteredCategories;
        setter = setFilteredCategories;
        break;
      case 'tags':
        currentValues = filteredTags;
        setter = setFilteredTags;
        break;
      case 'features':
        currentValues = filteredFeatures;
        setter = setFilteredFeatures;
        break;
      case 'userTypes':
        currentValues = filteredUserTypes;
        setter = setFilteredUserTypes;
        break;
      case 'businessModels':
        currentValues = filteredBusinessModels;
        setter = setFilteredBusinessModels;
        break;
      case 'useCases':
        currentValues = filteredUseCases;
        setter = setFilteredUseCases;
        break;
      case 'industries':
        currentValues = filteredIndustries;
        setter = setFilteredIndustries;
        break;
      default:
        return;
    }

    const newValues = currentValues.includes(id)
      ? currentValues.filter((v) => v !== id)
      : [...currentValues, id];

    setter(newValues);

    // Prepare all filters in an object
    const allFilters = {
      categories: type === 'categories' ? newValues : filteredCategories,
      tags: type === 'tags' ? newValues : filteredTags,
      features: type === 'features' ? newValues : filteredFeatures,
      userTypes: type === 'userTypes' ? newValues : filteredUserTypes,
      businessModels:
        type === 'businessModels' ? newValues : filteredBusinessModels,
      useCases: type === 'useCases' ? newValues : filteredUseCases,
      industries: type === 'industries' ? newValues : filteredIndustries,
    };

    const params = new URLSearchParams();

    // Only add non-empty arrays to the URL
    Object.entries(allFilters).forEach(([key, value]) => {
      if (value.length > 0) {
        params.set(key, value.join(','));
      }
    });

    navigate(`/apps?${params.toString()}`, { replace: true });
  };

  const filterHandlerAllCategories = () => {
    setFilteredCategories([]);
    const params = new URLSearchParams(location.search);
    params.delete('categories');
    navigate(`/apps?${params.toString()}`, { replace: true });
  };

  const dropdownList = resultsHome.map((app) => (
    <Link key={app.id} to={`/apps/${app.id}`}>
      <li>{app.title}</li>
    </Link>
  ));

  const categoriesList = categories.map((category) => {
    return (
      <Button
        onClick={() => filterHandler('categories', category.id)}
        primary={filteredCategories.includes(category.id)}
        secondary={!filteredCategories.includes(category.id)}
        label={category.title}
      />
    );
  });

  console.log(filteredPlatforms, 'platforms');

  const tagsList = tags.map((tag) => {
    return (
      <Button
        onClick={() => filterHandler('tags', tag.id)}
        primary={filteredTags.includes(tag.id)}
        secondary={!filteredTags.includes(tag.id)}
        label={tag.title}
      />
    );
  });

  useEffect(() => {
    async function fetchTrendingSearch() {
      const response = await fetch(`${apiURL()}/analytics?search=true`);
      const dataSearchAnalytics = await response.json();

      const result = dataSearchAnalytics
        .sort((a, b) => {
          return b.activeUsers - a.activeUsers;
        })
        .slice(0, 20);
      setSearchTrending(result);
    }

    fetchTrendingSearch();
  }, []);

  const searchList = searchTrending.map((searchItem) => {
    return (
      <Button
        primary={
          searchItem.searchId.toString() === searchParam.toString() && true
        }
        secondary={searchItem.searchId !== searchParam && true}
        label={capitalize(searchItem.searchId)}
      />
    );
  });

  useEffect(() => {
    let column;
    let direction;
    if (sortOrder === 'A-Z') {
      column = 'title';
      direction = 'asc';
    } else if (sortOrder === 'Z-A') {
      column = 'title';
      direction = 'desc';
    } else {
      column = 'id';
      direction = 'desc';
    }

    setOrderBy({ column, direction });
  }, [sortOrder]);

  const { pageMetaTitle, pageMetaDescription, pageHeaderTitle } = getPageMeta({
    filteredCategories,
    categories,
    filteredTags,
    tags,
    searchParam,
  });

  const sortOptions = ['Recent', 'A-Z', 'Z-A'];

  const pricingList = pricingOptionsChecked.map((item) => (
    <li key={item.key}>
      <input
        type="checkbox"
        value={item.key} // send key instead of label
        checked={item.checked}
        onChange={filterHandlerPricing}
      />{' '}
      {item.label} {/* show human-friendly label */}
    </li>
  ));

  const platformsList = platformsOptionsChecked.map((item) => (
    <li key={item.key}>
      <input
        type="checkbox"
        value={item.key} // send key instead of label
        checked={item.checked}
        onChange={filterHandlerPlatforms}
      />{' '}
      {item.label} {/* show human-friendly label */}
    </li>
  ));

  // const detailsList = detailsOptionsChecked.map((item) => (
  //   <li key={item}>
  //     <input
  //       checked={item.checked}
  //       type="checkbox"
  //       value={item.title}
  //       onChange={filterHandlerDetails}
  //     />{' '}
  //     {item.title}
  //   </li>
  // ));
  const fetchFavorites = useCallback(async () => {
    const url = `${apiURL()}/favorites`;
    const response = await fetch(url, {
      headers: {
        token: `token ${user?.uid}`,
      },
    });
    const favoritesData = await response.json();

    if (Array.isArray(favoritesData)) {
      setFavorites(favoritesData);
    } else {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (appId) => {
    const response = await fetch(`${apiURL()}/favorites`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
      }),
    });
    if (response.ok) {
      fetchFavorites();
    }
  };

  const handleDeleteBookmarks = (favoritesId) => {
    const deleteFavorites = async () => {
      const response = await fetch(`${apiURL()}/favorites/${favoritesId} `, {
        method: 'DELETE',
        headers: {
          token: `token ${user?.uid}`,
        },
      });

      if (response.ok) {
        fetchFavorites();
      }
    };

    deleteFavorites();
  };

  const tabsGroup = tabs.map((tab) => {
    return (
      <Button
        tertiary={activeTab === tab}
        secondary={activeTab !== tab}
        label={tab}
        className="tab"
        onClick={() => {
          setActiveTab(tab);
        }}
      />
    );
  });

  return (
    <main>
      <Helmet>
        <title>{pageMetaTitle}</title>
        <meta name="description" content={pageMetaDescription} />
      </Helmet>
      {/* <div className="hero"></div> */}
      <div className="hero apps">
        <h1 className="hero-header">{pageHeaderTitle}</h1>
      </div>
      <div className="tabs-group">{tabsGroup}</div>
      {activeTab === 'Categories' && (
        <section className="container-topics-desktop">
          <Button
            primary={!filteredCategories.length > 0}
            secondary={filteredCategories.length > 0}
            label="All categories"
            onClick={filterHandlerAllCategories}
          />
          {categoriesList}
        </section>
      )}
      {activeTab === 'Tags' && (
        <section className="container-topics-desktop">
          <Button
            primary={!filteredTags.length > 0}
            secondary={filteredTags.length > 0}
            label="All tags"
          />
          {tagsList}
          <Link to="/tags">
            <Button tertiary label="See all tags..." />
          </Link>
        </section>
      )}
      {activeTab === 'Searches' && (
        <section className="container-topics-desktop">
          <Link to="/">
            <Button
              primary={!searchParam}
              secondary={searchParam}
              label="All searches"
            />
          </Link>

          {searchList}
        </section>
      )}
      <section className="container-filters">
        <Button
          secondary
          className="button-topics"
          onClick={(event) =>
            setShowCategoriesContainer(!showCategoriesContainer)
          }
          backgroundColor="#ffe5d9"
          label="Categories"
        />
        <Button
          secondary
          className="button-topics"
          onClick={(event) => {
            setShowTagsContainer(!showTagsContainer);
            setShowCategoriesContainer(false);
            setShowSearchContainer(false);
          }}
          backgroundColor="#ffe5d9"
          label="Tags"
        />
        <Button
          secondary
          className="button-topics"
          onClick={(event) => {
            setShowSearchContainer(!showSearchContainer);
            setShowCategoriesContainer(false);
            setShowTagsContainer(false);
          }}
          backgroundColor="#ffe5d9"
          label="Searches"
        />
        <DropDownView
          // label="Sort"
          selectedOptionValue={sortOrder}
          className="no-line-height"
          options={sortOptions}
          // selectedOptionValue - can be removed
          // selectedOptionValue={
          //   pathname === '/' && orderByTrending
          //     ? 'Trending'
          //     : pathname !== '/'
          //     ? 'Recent'
          //     : undefined
          // }
          onSelect={(option) => setSortOrder(option)}
          showFilterIcon={false}
        />

        <Button
          secondary
          onClick={(event) => setShowFiltersContainer(!showFiltersContainer)}
          backgroundColor="#ffe5d9"
          label="Filters"
          icon={<FontAwesomeIcon className="filter-icon" icon={faFilter} />}
        />
        <Button
          secondary
          onClick={() => setListView(!listView)}
          backgroundColor="#ffe5d9"
        >
          <div className="filter-grid">
            <FontAwesomeIcon size="lg" icon={faGrip} />
            <FontAwesomeIcon icon={faList} />
          </div>
        </Button>
      </section>
      <section
        className={`container-topics-mobile ${
          showCategoriesContainer && 'show'
        }`}
      >
        <Button
          primary={!filteredCategories.length > 0}
          secondary={filteredCategories.length > 0}
          label="All categories"
          onClick={filterHandlerAllCategories}
        />

        {categoriesList}
      </section>
      <section
        className={`container-details-section ${
          showFiltersContainer && 'show'
        }`}
      >
        <div className="container-details filters">
          <form onSubmit={submitHandler}>
            <div className="container-form">
              <div>
                <h3>Pricing</h3>
                <ul>{pricingList}</ul>
              </div>
              <div>
                <h3>Platforms</h3>
                <ul>{platformsList}</ul>
              </div>
            </div>
            <div className="container-buttons">
              <Button type="submit" primary label="Apply filters" />
              <Button
                type="button"
                onClick={clearFiltersHandler}
                secondary
                label="Clear"
              />
            </div>
          </form>
        </div>
      </section>
      {apps.data ? (
        <section className="container-scroll">
          <InfiniteScroll
            dataLength={apps.data.length}
            next={fetchApps}
            hasMore={apps.hasMore} // Replace with a condition based on your data source
            loader={<p>Loading...</p>}
            endMessage={<p>No more data to load.</p>}
            className={`container-cards ${listView ? 'list' : 'grid'}`}
          >
            {apps.data.map((app) => {
              return (
                <Card
                  listCard={listView}
                  id={app.id}
                  title={app.title}
                  description={app.description}
                  url={app.url}
                  urlImage={app.url_icon || mousePointer}
                  topic={app.categoryTitle}
                  topicId={app.category_id}
                  pricingType={app.pricing_type}
                  isFavorite={favorites.some((x) => x.id === app.id)}
                  addFavorite={(event) => addFavorite(app.id)}
                  deleteBookmark={() => handleDeleteBookmarks(app.id)}
                  bookmarkOnClick={() => {
                    setOpenModal(true);
                    setModalTitle('Sign up to add bookmarks');
                  }}
                  cardUrl={`/apps/${app.id}`}
                />
              );
            })}
          </InfiniteScroll>
        </section>
      ) : (
        <Loading />
      )}
      <Modal title={modalTitle} open={openModal} toggle={toggleModal}>
        <Link to="/signup">
          <Button primary label="Create an account" />
        </Link>
        or
        <Link to="/login">
          <Button secondary label="Log in" />
        </Link>
      </Modal>
    </main>
  );
};
