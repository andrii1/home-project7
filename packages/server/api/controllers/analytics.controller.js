require('dotenv').config();
const { BetaAnalyticsDataClient } = require('@google-analytics/data').v1beta;

const credentials = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    'base64',
  ).toString('utf-8'),
);
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials,
});

const propertyId = '451225270';
// Get the day 31 days ago
const today = new Date().getTime() - 60 * 60 * 24 * 31 * 1000;
// Get the day, month and year
const day = new Date(today).getDate();
const month = new Date(today).getMonth() + 1;
const year = new Date(today).getFullYear();
// Put it in Google's date format
const dayFormat = `${year}-${month}-${day}`;

const getTopDealsPages = async () => {
  try {
    const [response] = await analyticsDataClient.runReport({
      // eslint-disable-next-line prefer-template
      property: 'properties/' + propertyId,
      dateRanges: [
        {
          // Run from today to 31 days ago
          startDate: dayFormat,
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          // Get the page path
          name: 'pagePathPlusQueryString',
        },
      ],
      metrics: [
        {
          // And tell me how many active users there were for each of those
          name: 'activeUsers',
        },
      ],
    });
    const regex = /\/deals\/\d+$/;
    const filteredResponse = response.rows
      .filter((item) => regex.test(item.dimensionValues[0].value))
      .map((item) => {
        return {
          dealId: item.dimensionValues[0].value.split('deals/')[1],
          url: item.dimensionValues[0].value,
          activeUsers: item.metricValues[0].value,
        };
      });

    return filteredResponse;
  } catch (error) {
    return error.message;
  }
};

const getTopCodesPages = async () => {
  try {
    const [response] = await analyticsDataClient.runReport({
      // eslint-disable-next-line prefer-template
      property: 'properties/' + propertyId,
      dateRanges: [
        {
          // Run from today to 31 days ago
          startDate: dayFormat,
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          // Get the page path
          name: 'pagePathPlusQueryString',
        },
      ],
      metrics: [
        {
          // And tell me how many active users there were for each of those
          name: 'activeUsers',
        },
      ],
    });
    const regex = /\/codes\/\d+$/;
    const filteredResponse = response.rows
      .filter((item) => regex.test(item.dimensionValues[0].value))
      .map((item) => {
        return {
          dealId: item.dimensionValues[0].value.split('deals/')[1],
          url: item.dimensionValues[0].value,
          activeUsers: item.metricValues[0].value,
        };
      });

    return filteredResponse;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getTopDealsPages,
  getTopCodesPages,
};
