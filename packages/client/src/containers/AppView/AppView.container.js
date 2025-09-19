/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '../../components/Button/Button.component';
import { ContainerCta } from '../../components/ContainerCta/ContainerCta.component';
import { Badge } from '../../components/Badge/Badge.component';
import { Card } from '../../components/Card/Card.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '../../components/Modal/Modal.Component';
import iconCopy from '../../assets/images/icons8-copy-24.png';
import appStoreLogo from '../../assets/images/download-on-the-app-store-apple-logo.svg';
import googlePlayStoreLogo from '../../assets/images/google-play-badge-logo.svg';
import macLogo from '../../assets/images/macos.svg';
import windowsLogo from '../../assets/images/windows.svg';
import chromeLogo from '../../assets/images/chrome.png';
import mousePointer from '../../assets/images/mouse-pointer.svg';
import { Dropdown } from '../../components/Dropdown/Dropdown.Component';
import TextFormTextarea from '../../components/Input/TextFormTextarea.component';
import Toast from '../../components/Toast/Toast.Component';
import Markdown from 'markdown-to-jsx';
import { Loading } from '../../components/Loading/Loading.Component';
import { useLikes } from '../../utils/hooks/useLikes';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

import {
  faEnvelope,
  faLink,
  faCaretUp,
  faArrowUpRightFromSquare,
  faHeart as faHeartSolid,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faDiscord,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from 'react-share';
import appImage from '../../assets/images/app-placeholder.svg';
import { faHeart, faCopy } from '@fortawesome/free-regular-svg-icons';

import { apiURL } from '../../apiURL';
import './AppView.styles.css';
import { useUserContext } from '../../userContext';
import { getMostUsedWords } from '../../utils/getMostUsedWords';
import { getDateFromTimestamp } from '../../utils/getDateFromTimestamp';

const faqConfig = [
  { key: 'faq_create_account', title: 'How to create an account in {app}?' },
  { key: 'faq_delete_account', title: 'How to delete {app} account?' },
  {
    key: 'faq_cancel_subscription',
    title: 'How to cancel subscription in {app}?',
  },
  {
    key: 'faq_change_profile_picture',
    title: 'How to change profile picture?',
  },
  { key: 'faq_log_in', title: 'How to log in to {app}?' },
  { key: 'faq_log_out', title: 'How to log out from {app}?' },
  { key: 'faq_is_app_on_android', title: 'Is {app} available on Android?' },
  { key: 'faq_app_doesnt_work_bugs', title: "{app} doesn't work, bugs" },
  { key: 'faq_is_safe_to_use', title: 'Is {app} safe to use?' },
  { key: 'faq_how_to_make_money', title: 'Can you make money with {app}?' },
  { key: 'faq_should_you_upgrade', title: 'Should you upgrade?' },
  { key: 'faq_can_use_for_free', title: '{app} for free?' },
];

export const AppView = () => {
  const { slug } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [openToast, setOpenToast] = useState(false);
  const [animation, setAnimation] = useState('');
  const [id, setId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [topicsFromDeals, setTopicsFromDeals] = useState([]);
  const navigate = useNavigate();
  const [app, setApp] = useState({});
  const [dealCodes, setDealCodes] = useState([]);
  const [appAppStore, setAppAppStore] = useState({});
  const [appAppStoreScraper, setAppAppStoreScraper] = useState({});
  const [similarApps, setSimilarApps] = useState([]);
  const [similarDealsFromApp, setSimilarDealsFromApp] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();
  const [validForm, setValidForm] = useState(false);
  const [invalidForm, setInvalidForm] = useState(false);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [allRatings, setAllRatings] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [searches, setSearches] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [openAddCodeForm, setOpenAddCodeForm] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [businessModels, setBusinessModels] = useState([]);
  const [features, setFeatures] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const {
    likes: positiveLikes,
    allLikes: allPositiveLikes,
    addLike: addPositiveLike,
    deleteLike: deletePositiveLike,
  } = useLikes(user, 'positiveLikes');

  const {
    likes: negativeLikes,
    allLikes: allNegativeLikes,
    addLike: addNegativeLike,
    deleteLike: deleteNegativeLike,
  } = useLikes(user, 'negativeLikes');

  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    async function fetchSingleApp(appId) {
      const response = await fetch(`${apiURL()}/apps/${appId}`);
      const appResponse = await response.json();
      setApp(appResponse[0]);
      setId(appResponse[0].id);
    }

    fetchSingleApp(slug);
  }, [slug]);

  useEffect(() => {
    async function fetchTagsForApp(appId) {
      const response = await fetch(`${apiURL()}/tags/?app=${appId}`);
      const data = await response.json();
      setTags(data);
    }

    async function fetchBusinessModelsForApp(appId) {
      const response = await fetch(`${apiURL()}/businessModels/?app=${appId}`);
      const data = await response.json();
      setBusinessModels(data);
    }

    async function fetchFeaturesForApp(appId) {
      const response = await fetch(`${apiURL()}/features/?app=${appId}`);
      const data = await response.json();
      setFeatures(data);
    }

    async function fetchIndustriesForApp(appId) {
      const response = await fetch(`${apiURL()}/industries/?app=${appId}`);
      const data = await response.json();
      setIndustries(data);
    }

    async function fetchUseCasesForApp(appId) {
      const response = await fetch(`${apiURL()}/useCases/?app=${appId}`);
      const data = await response.json();
      setUseCases(data);
    }

    async function fetchUserTypesForApp(appId) {
      const response = await fetch(`${apiURL()}/userTypes/?app=${appId}`);
      const data = await response.json();
      setUserTypes(data);
    }

    // async function fetchCodesForADeal(dealId) {
    //   const response = await fetch(`${apiURL()}/codes/?deal=${dealId}`);
    //   const appResponse = await response.json();
    //   setDealCodes(appResponse);
    // }

    // async function fetchSearchesForADeal(dealId) {
    //   const response = await fetch(`${apiURL()}/searches/?deal=${dealId}`);
    //   const appResponse = await response.json();
    //   setSearches(appResponse);
    // }

    // async function fetchKeywordsForADeal(dealId) {
    //   const response = await fetch(`${apiURL()}/keywords/?deal=${dealId}`);
    //   const appResponse = await response.json();
    //   setKeywords(appResponse);
    // }

    // fetchSingleApp(id);
    // fetchCodesForADeal(id);
    // fetchSearchesForADeal(id);
    // fetchKeywordsForADeal(id);

    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        await fetchTagsForApp(id);
        await fetchBusinessModelsForApp(id);
        await fetchFeaturesForApp(id);
        await fetchIndustriesForApp(id);
        await fetchUseCasesForApp(id);
        await fetchUserTypesForApp(id);
        // await fetchCodesForADeal(id);
        // await fetchSearchesForADeal(id);
        // await fetchKeywordsForADeal(id);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    async function fetchAppAppStore(appleId) {
      setLoading(true);
      try {
        const response = await fetch(`${apiURL()}/appsAppStore/${appleId}`);
        const example = await response.json();
        setAppAppStore(example.results[0]);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data' });
      }
      setLoading(false);
    }
    app.apple_id && fetchAppAppStore(app.apple_id);
  }, [app.apple_id]);

  console.log(appAppStore, 'appAppStore');

  useEffect(() => {
    async function fetchAppAppStoreScraper(appleId) {
      setLoading(true);
      try {
        const response = await fetch(
          `${apiURL()}/appsAppStoreScraper/${appleId}`,
        );
        const data = await response.json();
        setAppAppStoreScraper(data);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data' });
      }
      setLoading(false);
    }
    app.apple_id && fetchAppAppStoreScraper(app.apple_id);
  }, [app.apple_id]);

  useEffect(() => {
    const faqArray = faqConfig
      .filter(({ key }) => app[key])
      .map(({ key, title }) => ({
        id: key,
        title: title.replace('{app}', app.title || 'this app'),
        text: app[key],
        open: false,
      }));

    setFaqs(faqArray);
  }, [app]);

  useEffect(() => {
    async function fetchSimilarApps() {
      setLoading(true);
      try {
        const response = await fetch(`${apiURL()}/apps`);
        const data = await response.json();
        const similarAppsArray = data
          .filter((item) => item.category_id === app.category_id)
          .filter((item) => item.id !== app.id);
        setSimilarApps(similarAppsArray);

        // const similarDealsFromAppArray = appsResponse
        //   .filter((item) => item.app_id === app.app_id)
        //   .filter((item) => item.id !== app.id);
        // setSimilarDealsFromApp(similarDealsFromAppArray);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data' });
      }
      setLoading(false);
    }

    fetchSimilarApps();
  }, [app.id, app.category_id]);

  const fetchCommentsByAppId = useCallback(async (appId) => {
    const response = await fetch(`${apiURL()}/comments?appId=${appId}`);
    const commentResponse = await response.json();
    setComments(commentResponse);
  }, []);

  useEffect(() => {
    fetchCommentsByAppId(id);
  }, [fetchCommentsByAppId, id]);

  const navigateBack = () => {
    navigate(-1);
  };

  const addComment = async (commentContent) => {
    const response = await fetch(`${apiURL()}/comments`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: commentContent,
        app_id: id,
      }),
    });
    if (response.ok) {
      fetchCommentsByAppId(id);
    }
  };

  const commentHandler = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!comment) {
      setCommentError('Comment is required!');
      setInvalidForm(true);
      setValidForm(false);
      return;
    }
    if (comment.trim().length < 5) {
      setCommentError('Comment must be more than five characters!');
      setInvalidForm(true);
      setValidForm(false);
      return;
    }

    setInvalidForm(false);
    setValidForm(true);
    addComment(comment);
    setOpenConfirmationModal(true);
    setComment('');
  };
  const getOnlyYearMonthDay = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const results = [];
      const combinedText = `${app?.description} ${app?.description_long} ${app?.appDescription}`;
      const words = getMostUsedWords(combinedText, 10);

      for (const [word] of words) {
        try {
          const res = await fetch(
            `${apiURL()}/apps?page=0&column=id&direction=desc&search=${encodeURIComponent(
              word,
            )}`,
          );
          const data = await res.json();
          if (data.data.length > 1) {
            const wordWithLink = { title: word, url: `apps/search/${word}` };
            results.push(wordWithLink);
          }
        } catch (err) {
          return;
        }
      }

      setTopicsFromDeals(results);
      setLoading(false);
    }
    if (app?.description) {
      fetchData();
    }
  }, [app.description, app.description_long, app.appDescription]);

  const cardItems = similarApps.map((item) => {
    // const relatedTopics = topics
    //   .filter((topic) => topic.categoryId === category.id)
    //   .map((item) => item.id);
    return (
      <Card
        id={item.id}
        cardUrl={`/apps/${item.slug}`}
        title={item.title}
        description={item.description}
        url={item.url}
        urlImage={item.url_image === null ? 'deal' : item.url_image}
        topic={item.categoryTitle}
        appTitle={item.appTitle}
        smallCard
      />
    );
  });

  // const cardItemsSimilarDealsFromApp = similarDealsFromApp.map((item) => {
  //   return (
  //     <Card
  //       id={item.id}
  //       cardUrl={`/apps/${item.id}`}
  //       title={item.title}
  //       description={item.description}
  //       url={item.url}
  //       urlImage={item.url_image === null ? 'deal' : item.url_image}
  //       topic={item.topicTitle}
  //       appTitle={item.appTitle}
  //       smallCard
  //     />
  //   );
  // });

  const searchItems = searches.map((search) => {
    return (
      <Link to={`../../apps/searchterm/${search.id}`} target="_blank">
        <Button
          size="medium"
          secondary
          icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" />}
          label={search.title}
        />
      </Link>
    );
  });

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

  const toggleModal = () => {
    setOpenModal(false);
    document.body.style.overflow = 'visible';
  };

  const fetchAllRatings = useCallback(async () => {
    const url = `${apiURL()}/ratings`;
    const response = await fetch(url);
    const ratingsData = await response.json();
    setAllRatings(ratingsData);
  }, []);

  useEffect(() => {
    fetchAllRatings();
  }, [fetchAllRatings]);

  const fetchRatings = useCallback(async () => {
    const url = `${apiURL()}/ratings`;
    const response = await fetch(url, {
      headers: {
        token: `token ${user?.uid}`,
      },
    });
    const ratingsData = await response.json();

    if (Array.isArray(ratingsData)) {
      setRatings(ratingsData);
    } else {
      setRatings([]);
    }
  }, [user]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const addRating = async (appId) => {
    const response = await fetch(`${apiURL()}/ratings`, {
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
      fetchRatings();
      fetchAllRatings();
    }
  };

  const deleteRating = async (appId) => {
    const response = await fetch(`${apiURL()}/ratings/${appId}`, {
      method: 'DELETE',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      fetchRatings();
      fetchAllRatings();
    }
  };

  const copyToClipboard = (item) => {
    navigator.clipboard.writeText(item);
    setOpenToast(true);
    setAnimation('open-animation');

    setTimeout(() => {
      setAnimation('close-animation');
    }, 2000);
    setTimeout(() => {
      setOpenToast(false);
    }, 2500);
  };

  const dealCodesInTitle = dealCodes.map((i) => {
    return `(${i.title})`;
  });

  const showNumberOfCodesInTitle = (codes) => {
    let title;
    if (codes.length === 1) {
      title = 'code';
    } else {
      title = 'codes';
    }

    return `${codes.length} ${title}`;
  };

  // const images = [
  //   {
  //     original: 'https://picsum.photos/id/1018/1000/600/',
  //     thumbnail: 'https://picsum.photos/id/1018/250/150/',
  //   },
  //   {
  //     original: 'https://picsum.photos/id/1015/300/600/',
  //     thumbnail: 'https://picsum.photos/id/1015/150/450/',
  //   },
  //   {
  //     original: 'https://picsum.photos/id/1019/1000/600/',
  //     thumbnail: 'https://picsum.photos/id/1019/250/150/',
  //   },
  // ];

  // if (loading) {
  //   return (
  //     <>
  //       <Helmet>
  //         <title>Loading...</title>
  //         <meta name="description" content="Fetching deal details" />
  //       </Helmet>
  //       <main className="loading-container">
  //         <Loading />
  //       </main>
  //     </>
  //   );
  // }

  console.log('app', app);

  const handleFaqs = (faqId) => {
    setFaqs(
      faqs.map((item) => {
        if (item.id === faqId) {
          return { ...item, open: !item.open };
        }
        return item;
      }),
    );
  };

  const faqsItems = faqs.map((faq) => {
    return (
      <div key={faq.id}>
        <h3 className="h3-faq" onClick={() => handleFaqs(faq.id)}>
          {faq.title} {faq.open ? '▲' : '▼'}
        </h3>
        <p className={!faq.open && 'faq-closed'}>{faq.text}</p>
      </div>
    );
  });

  if (error) {
    return (
      <>
        <Helmet>
          <title>Error</title>
          <meta name="description" content="Something went wrong" />
        </Helmet>
        <main className="error-container">
          <h2>{error.message || 'Something went wrong'}</h2>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${app?.title} - Try Top Apps`}</title>
        <meta
          name="description"
          content={
            keywords.length > 0
              ? keywords.map((keyword) => keyword.title).join(', ')
              : `${app?.title} review, ${app?.title} how to use, ${app?.title} tutorial, ${app?.title} overview, ${app?.title} deals.`
          }
        />
      </Helmet>
      <main>
        <section className="container-appview">
          <div className="header">
            <h1 className="hero-header">{app?.title}</h1>
          </div>
          <img
            className={`appview-icon ${!app.url_icon && 'default-icon'}`}
            alt={`${app.title}`}
            src={app.url_icon || mousePointer}
          />
          {/* <ImageGallery items={images} /> */}
          <div className="container-deal-actions">
            <div className="container-rating">
              Rating
              {user &&
              allRatings.some((rating) => rating.app_id === app.id) &&
              ratings.some((rating) => rating.id === app.id) ? (
                <button
                  type="button"
                  className="button-rating"
                  onClick={(event) => deleteRating(app.id)}
                >
                  <FontAwesomeIcon icon={faCaretUp} />
                  {
                    allRatings.filter((rating) => rating.app_id === app.id)
                      .length
                  }
                </button>
              ) : user ? (
                <button
                  type="button"
                  className="button-rating"
                  onClick={(event) => addRating(app.id)}
                >
                  <FontAwesomeIcon icon={faCaretUp} />
                  {
                    allRatings.filter((rating) => rating.app_id === app.id)
                      .length
                  }
                </button>
              ) : (
                <button
                  type="button"
                  className="button-rating"
                  onClick={() => {
                    setOpenModal(true);
                    setModalTitle('Sign up to vote');
                  }}
                >
                  <FontAwesomeIcon icon={faCaretUp} />
                  {
                    allRatings.filter((rating) => rating.app_id === app.id)
                      .length
                  }
                </button>
              )}
            </div>
            <div className="container-appview-buttons">
              {app.url && (
                <Link to={app.url} target="_blank">
                  <Button
                    size="large"
                    secondary
                    icon={
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        size="sm"
                      />
                    }
                    label="Visit website"
                  />
                </Link>
              )}
            </div>
            <div>
              {user && favorites.some((x) => x.id === app.id) ? (
                <button
                  type="button"
                  onClick={() => handleDeleteBookmarks(app.id)}
                  onKeyDown={() => handleDeleteBookmarks(app.id)}
                  className="button-bookmark"
                >
                  Remove app from saved &nbsp;
                  <FontAwesomeIcon icon={faHeartSolid} size="lg" />
                </button>
              ) : user ? (
                <button
                  type="button"
                  onClick={() => addFavorite(app.id)}
                  onKeyDown={() => addFavorite(app.id)}
                  className="button-bookmark"
                >
                  Save this app &nbsp;
                  <FontAwesomeIcon icon={faHeart} size="lg" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpenModal(true);
                    setModalTitle('Sign up to add bookmarks');
                  }}
                  onKeyDown={() => addFavorite(app.id)}
                  className="button-bookmark"
                >
                  Save <FontAwesomeIcon icon={faHeart} size="lg" />
                </button>
              )}
            </div>
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">Pricing</h2>
            <div className="container-tags">
              <div className="badges">
                <div className="badges-keywords">
                  {!!app.pricing_free && (
                    <Link to="../apps/pricing/free">
                      <Button secondary label="free" size="small" />
                    </Link>
                  )}
                  {!!app.pricing_freemium && (
                    <Link to="../apps/pricing/freemium">
                      <Button secondary label="freemium" size="small" />
                    </Link>
                  )}
                  {!!app.pricing_subscription && (
                    <Link to="../apps/pricing/subscription">
                      <Button secondary label="subscription" size="small" />
                    </Link>
                  )}
                  {!!app.pricing_one_time && (
                    <Link to="../apps/pricing/one-time">
                      <Button secondary label="one-time" size="small" />
                    </Link>
                  )}
                  {!!app.pricing_trial_available && (
                    <Link to="../apps/pricing/trial">
                      <Button secondary label="trial" size="small" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="container-tags">
              <div className="badges">
                <p className="p-no-margin">iOS app: </p>
                <div className="badges-keywords">
                  {!!app.pricing_ios_app_free && (
                    <Link to="../apps/pricing/ios-free">
                      <Button secondary label="free" size="small" />
                    </Link>
                  )}
                  {!!app.pricing_ios_app_paid && (
                    <Link to="../apps/pricing/ios-paid">
                      <Button secondary label="paid" size="small" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {!!app.pricing_ios_app_paid &&
              app.price > 0 &&
              `${app.price} ${app.currency}`}
            {app.pricing_details && (
              <p className="p-no-margin">{app.pricing_details}</p>
            )}
            {app.pricing_url && (
              <div>
                <Link target="_blank" to={app.pricing_url}>
                  <span className="underline">Pricing page</span>{' '}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" />
                </Link>
              </div>
            )}
          </div>
          <div className="container-description">
            <div className="container-title">
              <h2>{app.title}</h2>
            </div>
            <p className="app-description main-description">
              <Markdown>{app.description}</Markdown>
            </p>

            {app.description_long && (
              <>
                <h3>App details</h3>
                <p className="app-description">
                  {' '}
                  <Markdown>{app.description_long}</Markdown>
                </p>
              </>
            )}
          </div>
          {app.description_how_to_use && (
            <div className="container-description">
              <div className="container-title">
                <h2>How to use {app.title}</h2>
              </div>
              <p className="app-description main-description">
                <Markdown>{app.description_how_to_use}</Markdown>
              </p>
            </div>
          )}
          {app.apple_id ||
          app.url_google_play_store ||
          app.url_chrome_extension ||
          app.url_windows ||
          app.url_mac ? (
            <div className="container-appview-box">
              <h2>Download app</h2>
              <div className="container-store-logos">
                {appAppStore.trackViewUrl && (
                  <Link
                    target="_blank"
                    to={appAppStore.trackViewUrl}
                    className="simple-link"
                  >
                    <img
                      src={appStoreLogo}
                      alt="App Store logo"
                      className="logo-store"
                    />
                  </Link>
                )}
                {app.url_google_play_store && (
                  <Link
                    target="_blank"
                    to={app.url_google_play_store}
                    className="simple-link"
                  >
                    <img
                      src={googlePlayStoreLogo}
                      alt="Google Play store logo"
                      className="logo-store"
                    />
                  </Link>
                )}
                {app.url_chrome_extension && (
                  <Link
                    target="_blank"
                    to={app.url_chrome_extension}
                    className="simple-link"
                  >
                    <img
                      src={chromeLogo}
                      alt="Chrome logo"
                      className="logo-store"
                    />
                  </Link>
                )}
                {app.url_mac && (
                  <Link
                    target="_blank"
                    to={app.url_mac}
                    className="simple-link"
                  >
                    <img src={macLogo} alt="Mac logo" className="logo-store" />
                  </Link>
                )}
                {app.url_windows && (
                  <Link
                    target="_blank"
                    to={app.url_windows}
                    className="simple-link"
                  >
                    <img
                      src={windowsLogo}
                      alt="Windows logo"
                      className="logo-store"
                    />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            ''
          )}
          <div className="container-appview-box container-description">
            <h2>FAQs</h2>
            {faqs.length > 0 ? (
              faqsItems
            ) : (
              <p className="app-description ">No data yet</p>
            )}
          </div>

          {app.apple_id && (
            <div className="container-appview-box container-description">
              <h2>{app.title} deals, promo codes, referral codes</h2>
              <p className="app-description ">No data yet</p>
            </div>
          )}
          {app.apple_id && (
            <div className="container-appview-box container-description">
              <h2>{app.title} errors</h2>
              <p className="app-description ">No data yet</p>
            </div>
          )}
          {app.apple_id && (
            <div className="container-appview-box container-description">
              <h2>Is {app.title} down?</h2>
              <p className="app-description ">No data yet</p>
            </div>
          )}
          {app.apple_id && (
            <div className="container-appview-box container-description">
              <h2>How to contact {app.title} support?</h2>
              {app.faq_contact_support ? (
                <p className="app-description ">{app.faq_contact_support}</p>
              ) : (
                <p className="app-description ">No data yet</p>
              )}
            </div>
          )}
          {/* <div className="container-codes">
            {dealCodes.length > 0 ? (
              <>
                <div className="container-title">
                  <h2>
                    {app.title} -{' '}
                    {dealCodes.length > 0
                      ? `${showNumberOfCodesInTitle(dealCodes)}`
                      : ''}
                  </h2>
                </div>

                <div className="container-appview-codes-users">
                  {dealCodes.map((code) => {
                    const positiveLikesCount = allPositiveLikes.filter(
                      (like) => like.code_id === code.id,
                    ).length;

                    const negativeLikesCount = allNegativeLikes.filter(
                      (like) => like.code_id === code.id,
                    ).length;

                    return (
                      <div className="container-codes-users">
                        <div className="container-appview-codes">
                          <Button
                            size="medium"
                            primary
                            icon={<FontAwesomeIcon icon={faCopy} />}
                            label={code.title}
                            onClick={() => copyToClipboard(code.title)}
                          />
                          <Toast
                            open={openToast}
                            overlayClass={`toast ${animation}`}
                          >
                            <span>Copied to clipboard!</span>
                          </Toast>
                          {code.url && (
                            <Link to={code.url} target="_blank">
                              <Button
                                size="medium"
                                secondary
                                icon={
                                  <FontAwesomeIcon
                                    icon={faArrowUpRightFromSquare}
                                    size="sm"
                                  />
                                }
                                label="Link"
                              />
                            </Link>
                          )}
                          <Link to={`../../codes/${code.id}`} target="_blank">
                            <Button
                              size="medium"
                              secondary
                              icon={
                                <FontAwesomeIcon
                                  icon={faArrowUpRightFromSquare}
                                  size="sm"
                                />
                              }
                              label="View"
                            />
                          </Link>
                          <div className="container-rating">
                            {user &&
                            positiveLikes.some(
                              (like) => like.id === code.id,
                            ) ? (
                              <div className="thumbs-container up">
                                <ThumbsUp
                                  className="thumbs"
                                  color="green"
                                  size={20}
                                  onClick={() => deletePositiveLike(code.id)}
                                />
                                {positiveLikesCount}
                              </div>
                            ) : user ? (
                              <div className="thumbs-container up">
                                <ThumbsUp
                                  color="green"
                                  className="thumbs"
                                  size={20}
                                  onClick={() => addPositiveLike(code.id)}
                                />
                                {positiveLikesCount}
                              </div>
                            ) : (
                              <div className="thumbs-container up">
                                <ThumbsUp
                                  className="thumbs"
                                  size={20}
                                  color="green"
                                  onClick={() => {
                                    setOpenModal(true);
                                    setModalTitle('Sign up to vote');
                                  }}
                                />
                                {positiveLikesCount}
                              </div>
                            )}
                          </div>
                          <div className="container-rating">
                            {user &&
                            negativeLikes.some(
                              (like) => like.id === code.id,
                            ) ? (
                              <div className="thumbs-container down">
                                <ThumbsDown
                                  className="thumbs"
                                  color="red"
                                  size={20}
                                  onClick={() => deleteNegativeLike(code.id)}
                                />
                                {negativeLikesCount}
                              </div>
                            ) : user ? (
                              <div className="thumbs-container down">
                                <ThumbsDown
                                  color="red"
                                  className="thumbs"
                                  size={20}
                                  onClick={() => addNegativeLike(code.id)}
                                />
                                {negativeLikesCount}
                              </div>
                            ) : (
                              <div className="thumbs-container down">
                                <ThumbsDown
                                  className="thumbs"
                                  size={20}
                                  color="red"
                                  onClick={() => {
                                    setOpenModal(true);
                                    setModalTitle('Sign up to vote');
                                  }}
                                />
                                {negativeLikesCount}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="codes-added-by">
                          added by {code.userFullName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="container-title">
                <span>
                  <i>No codes yet</i> 😢 <i>Add your code now!</i>
                </span>
              </div>
            )}
          </div> */}
          {!user && (
            <div className="container-details cta">
              <div>
                <h2>🔥 Add your app!</h2>
                <p>Create an account to get started for free</p>
              </div>
              <div>
                <Link target="_blank" to="/signup">
                  <Button primary label="Create my account 👌" />
                </Link>
              </div>
            </div>
          )}
          <div className="container-comments">
            <h2 className="h-no-margin h-no-margin-bottom">Comments</h2>
            {comments.length === 0 && (
              <div>
                <i>No comments yet. </i>
                {user && <i>Add a first one below.</i>}
              </div>
            )}
            {comments.length > 0 &&
              comments.map((item) => (
                <div className="form-container">
                  <div className="comment-box submit-box-new-comment">
                    <div>{item.content}</div>
                    <div className="comment-author-date">{`by ${
                      item.full_name
                    } on ${getOnlyYearMonthDay(item.created_at)}`}</div>
                  </div>
                </div>
              ))}
            {!user && (
              <div>
                <i>
                  <br />
                  <Link to="/signup" className="simple-link">
                    Sign up
                  </Link>{' '}
                  or{' '}
                  <Link to="/login" className="simple-link">
                    log in
                  </Link>{' '}
                  to add comments
                </i>
              </div>
            )}
            {user && (
              <div className="form-container">
                <div className="comment-box submit-box">
                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="form-input textarea-new-comment"
                      value={comment}
                      placeholder="Your comment..."
                      onChange={commentHandler}
                    />

                    <Button
                      primary
                      className="btn-add-prompt"
                      type="submit"
                      label="Add comment"
                    />
                    {validForm && (
                      <Modal
                        title="Your comment has been submitted!"
                        open={openConfirmationModal}
                        toggle={() => setOpenConfirmationModal(false)}
                      />
                    )}
                    {invalidForm && (
                      <p className="error-message">{commentError}</p>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">Reviews</h2>

            {appAppStore.averageUserRating && (
              <div className="container-tags">
                <div className="badges">
                  <p>Average rating: </p>
                  <div>{appAppStore.averageUserRating.toFixed(2)}</div>
                </div>
              </div>
            )}
            {appAppStore.userRatingCount && (
              <div className="container-tags">
                <div className="badges">
                  <p>Number of ratings: </p>
                  <div>{appAppStore.userRatingCount}</div>
                </div>
              </div>
            )}
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">Version & release</h2>
            {app.developer && (
              <div className="container-tags">
                <div className="badges">
                  <p>Developer: </p>
                  <div>
                    <Link to={app.developer_url} target="_blank">
                      <Button
                        secondary
                        label={app.developer}
                        size="small"
                        icon={
                          <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                            size="sm"
                          />
                        }
                      />
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {app.released && (
              <div className="container-tags">
                <div className="badges">
                  <p>Released: </p>
                  <div>{getDateFromTimestamp(app.released)}</div>
                </div>
              </div>
            )}
            {appAppStoreScraper.updated && (
              <div className="container-tags">
                <div className="badges">
                  <p>Updated: </p>
                  <div>{getDateFromTimestamp(appAppStoreScraper.updated)}</div>
                </div>
              </div>
            )}
            {appAppStore.version && (
              <div className="container-tags">
                <div className="badges">
                  <p>Current version: </p>
                  <div>{appAppStore.version}</div>
                </div>
              </div>
            )}
            {appAppStore.fileSizeBytes && (
              <div className="container-tags">
                <div className="badges">
                  <p>Size: </p>
                  <div>
                    {`${(appAppStore.fileSizeBytes / (1024 * 1024)).toFixed(
                      2,
                    )} MB`}
                  </div>
                </div>
              </div>
            )}
            {appAppStore.minimumOsVersion && (
              <div className="container-tags">
                <div className="badges">
                  <p>Minimum iOS version: </p>
                  <div>{appAppStore.minimumOsVersion}</div>
                </div>
              </div>
            )}
            {appAppStore.trackContentRating && (
              <div className="container-tags">
                <div className="badges">
                  <p>Content rating: </p>
                  <div>{appAppStore.trackContentRating}</div>
                </div>
              </div>
            )}
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">Category & tags</h2>
            <div className="container-tags">
              <div className="badges">
                <p>Category: </p>
                <div>
                  <Link
                    to={`/apps/categories/${app.categorySlug}`}
                    target="_blank"
                  >
                    <Button
                      secondary
                      label={app.categoryTitle?.toLowerCase()}
                      size="small"
                      icon={
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          size="sm"
                        />
                      }
                    />
                  </Link>
                </div>
              </div>
            </div>
            {topicsFromDeals.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Related topics: </p>
                  <div className="badges-keywords">
                    {topicsFromDeals.map((topic, index) => (
                      <Link to={`../../${topic.url}`}>
                        <Button secondary label={topic.title} size="small" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tags.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Tags: </p>
                  <div className="badges-keywords">
                    {tags.map((tag) => (
                      <Link to={`../apps/tags/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">Features & use cases</h2>
            {features.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Features: </p>
                  <div className="badges-keywords">
                    {features.map((tag) => (
                      <Link to={`../apps/features/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {useCases.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Use cases: </p>
                  <div className="badges-keywords">
                    {useCases.map((tag) => (
                      <Link to={`../apps/useCases/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">Industries & users</h2>

            {userTypes.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Best for: </p>
                  <div className="badges-keywords">
                    {userTypes.map((tag) => (
                      <Link to={`../apps/userTypes/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {industries.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Industries: </p>
                  <div className="badges-keywords">
                    {industries.map((tag) => (
                      <Link to={`../apps/industries/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {businessModels.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Business models: </p>
                  <div className="badges-keywords">
                    {businessModels.map((tag) => (
                      <Link to={`../apps/businessModels/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {app.languages && (
            <div className="container-details container-badges">
              <h2 className="no-margin">Languages</h2>
              {JSON.parse(app.languages).join(', ')}
            </div>
          )}
          {(!!app.is_ai_powered || !!app.is_open_source) && (
            <div className="container-details container-badges">
              <h2 className="no-margin">Other</h2>

              <div className="container-tags">
                <div className="badges">
                  <div>
                    {!!app.is_ai_powered && (
                      <Link to="../apps/other/ai" target="_blank">
                        <Button
                          secondary
                          label="AI powered"
                          size="small"
                          icon={
                            <FontAwesomeIcon
                              icon={faArrowUpRightFromSquare}
                              size="sm"
                            />
                          }
                        />
                      </Link>
                    )}
                    {!!app.is_open_source && (
                      <Link to="../apps/other/open-source" target="_blank">
                        <Button
                          secondary
                          label="open source"
                          size="small"
                          icon={
                            <FontAwesomeIcon
                              icon={faArrowUpRightFromSquare}
                              size="sm"
                            />
                          }
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="container-details container-badges">
            <h2 className="no-margin">Social media accounts</h2>
            {(!!app.url_x || !!app.url_discord) && (
              <div className="container-tags">
                {!!app.url_x && (
                  <Link to={app.url_x} target="_blank">
                    <FontAwesomeIcon className="share-icon" icon={faXTwitter} />
                  </Link>
                )}
                {!!app.url_discord && (
                  <Link to={app.url_discord} target="_blank">
                    <FontAwesomeIcon className="share-icon" icon={faDiscord} />
                  </Link>
                )}
              </div>
            )}
          </div>
          {app.appUrlAppStore || app.appUrlGooglePlayStore ? (
            <div className="container-appview-box">
              <h2>Download {app.appTitle} app</h2>
              <div className="container-store-logos">
                {app.appUrlAppStore && (
                  <Link
                    target="_blank"
                    to={app.appUrlAppStore}
                    className="simple-link"
                  >
                    <img
                      src={appStoreLogo}
                      alt="App Store logo"
                      className="logo-store"
                    />
                  </Link>
                )}
                {app.appUrlGooglePlayStore && (
                  <Link
                    target="_blank"
                    to={app.appUrlGooglePlayStore}
                    className="simple-link"
                  >
                    <img
                      src={googlePlayStoreLogo}
                      alt="Google Play store logo"
                      className="logo-store"
                    />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            ''
          )}
          {app.appAppleId && appAppStore && (
            <div className="container-appview-box">
              <h2>{app?.appTitle} app</h2>
              <p className="app-description">{appAppStore?.description}</p>
            </div>
          )}
          {!app.appAppleId && app.appDescription && (
            <div className="container-appview-box">
              <h2>{app?.appTitle} app</h2>
              <p className="app-description">
                <Markdown>{app?.appDescription}</Markdown>
              </p>
            </div>
          )}
          {app.contact && (
            <div className="container-appview-box">
              <h2>{app.title} support</h2>
              <div>
                <Link to={`mailto:${app.contact}`} target="_blank">
                  <Button
                    secondary
                    icon={<FontAwesomeIcon icon={faEnvelope} size="sm" />}
                    label={`Contact ${app.appTitle} support`}
                  />
                </Link>
              </div>
            </div>
          )}
          {/* <div className="container-related-searches">
            <h3>Related searches</h3>
            <div className="topics-div searches">
              {searches.map((search) => (
                <Link to={`/apps/search/${search.id}`} target="_blank">
                  <Button secondary label={search.title} />
                </Link>
              ))}
            </div>
          </div> */}
          <div className="icons-apps-page">
            <span>Share it: </span>
            <FontAwesomeIcon
              icon={faLink}
              className="button-copy"
              onClick={() =>
                copyToClipboard(`https://www.trytopapps.com/apps/${app.slug}`)
              }
            />
            <FacebookShareButton url={`/apps/${app.slug}`}>
              <FontAwesomeIcon className="share-icon" icon={faFacebookF} />
            </FacebookShareButton>
            <TwitterShareButton
              url={`https://www.trytopapps.com/apps/${app.slug}`}
              title={`Check out this app: '${app.title}'`}
              hashtags={['Apps']}
            >
              <FontAwesomeIcon className="share-icon" icon={faTwitter} />
            </TwitterShareButton>
            <LinkedinShareButton
              url={`https://www.trytopapps.com/apps/${app.slug}`}
            >
              <FontAwesomeIcon className="share-icon" icon={faLinkedinIn} />
            </LinkedinShareButton>
            <EmailShareButton
              subject="Check out this app!"
              body={`This app is great: '${app.title}'`}
              url={`https://www.trytopapps.com/apps/${app.slug}`}
            >
              <FontAwesomeIcon icon={faEnvelope} />
            </EmailShareButton>
            <Toast open={openToast} overlayClass={`toast ${animation}`}>
              <span>Copied to clipboard!</span>
            </Toast>
          </div>
          {/* <ContainerCta user={user} /> */}
          {/* {similarDealsFromApp.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Other deals from {app.appTitle} app</h2>
              <div className="container-cards small-cards">
                {cardItemsSimilarDealsFromApp}
              </div>
            </div>
          )} */}
          {similarApps.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Similar apps in {app.categoryTitle}</h2>
              <div className="container-cards small-cards">{cardItems}</div>
            </div>
          )}
          {searches.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Related searches</h2>
              <div className="container-related-searches">{searchItems}</div>
            </div>
          )}
        </section>
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
    </>
  );
};
