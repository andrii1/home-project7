/* eslint-disable no-await-in-loop */
require('dotenv').config();
const { SitemapStream, streamToPromise } = require('sitemap');
const AWS = require('aws-sdk');

const MAX_URLS = 50000; // Google limit per sitemap file

// Run only on Sunday
const today = new Date();
if (today.getDay() !== 0) {
  console.log('Not Sunday, skipping sitemap generation.');
  process.exit(0);
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const FOLDER_NAME = 'trytopapps';

const uploadToS3 = async (key, body) => {
  return s3
    .putObject({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: 'application/xml',
    })
    .promise();
};

(async () => {
  try {
    const host = 'https://www.trytopapps.com';

    console.log('Fetching dynamic data...');

    // Fetch data in parallel
    const [
      appsRes,
      categoriesRes,
      tagsRes,
      featuresRes,
      useCasesRes,
      userTypesRes,
      industriesRes,
      businessModelsRes,
    ] = await Promise.all([
      fetch(`${host}/api/apps`),
      fetch(`${host}/api/categories`),
      fetch(`${host}/api/tags`),
      fetch(`${host}/api/features`),
      fetch(`${host}/api/useCases`),
      fetch(`${host}/api/userTypes`),
      fetch(`${host}/api/industries`),
      fetch(`${host}/api/businessModels`),
    ]);

    const apps = await appsRes.json();
    const categories = await categoriesRes.json();
    const tags = await tagsRes.json();
    const features = await featuresRes.json();
    const useCases = await useCasesRes.json();
    const userTypes = await userTypesRes.json();
    const industries = await industriesRes.json();
    const businessModels = await businessModelsRes.json();

    // Collect ALL URLs into a single array
    let urls = [];

    // Static URLs
    const staticRoutes = ['/', '/apps', '/faq', '/login', '/signup'];
    urls.push(...staticRoutes.map((r) => ({ url: r })));

    // Dynamic URLs
    urls.push(
      ...apps.map((a) => ({ url: `/apps/${a.id}`, changefreq: 'weekly' })),
    );

    urls.push(
      ...categories.map((c) => ({
        url: `/apps/categories/${c.slug}`,
        changefreq: 'weekly',
      })),
    );
    urls.push(
      ...tags.map((c) => ({
        url: `/apps/tags/${c.slug}`,
        changefreq: 'weekly',
      })),
    );
    urls.push(
      ...features.map((c) => ({
        url: `/apps/features/${c.slug}`,
        changefreq: 'weekly',
      })),
    );
    urls.push(
      ...useCases.map((c) => ({
        url: `/apps/useCases/${c.slug}`,
        changefreq: 'weekly',
      })),
    );
    urls.push(
      ...userTypes.map((c) => ({
        url: `/apps/userTypes/${c.slug}`,
        changefreq: 'weekly',
      })),
    );
    urls.push(
      ...industries.map((c) => ({
        url: `/apps/industries/${c.slug}`,
        changefreq: 'weekly',
      })),
    );
    urls.push(
      ...businessModels.map((c) => ({
        url: `/apps/businessModels/${c.slug}`,
        changefreq: 'weekly',
      })),
    );

    console.log(`Total URLs collected: ${urls.length}`);

    // Split URLs into chunks
    const chunks = [];
    while (urls.length) {
      chunks.push(urls.splice(0, MAX_URLS));
    }

    console.log(`Total sitemap parts: ${chunks.length}`);

    const sitemapIndexItems = [];

    // Generate each sitemap chunk
    for (let i = 0; i < chunks.length; i++) {
      const partNumber = i + 1;
      const sitemapPartName = `sitemap-${partNumber}.xml`;
      const key = `${FOLDER_NAME}/${sitemapPartName}`;

      const smStream = new SitemapStream({ hostname: host });

      chunks[i].forEach((url) => smStream.write(url));
      smStream.end();

      const xml = await streamToPromise(smStream);

      console.log(`Uploading ${sitemapPartName} ...`);
      await uploadToS3(key, xml.toString());

      sitemapIndexItems.push({
        loc: `${host}/${sitemapPartName}`,
      });
    }

    // Create sitemap-index.xml
    const indexStream = new SitemapStream({ hostname: host, level: 'index' });
    sitemapIndexItems.forEach((item) => indexStream.write(item));
    indexStream.end();

    const indexXml = await streamToPromise(indexStream);

    const indexKey = `${FOLDER_NAME}/sitemap-index.xml`;

    console.log('Uploading sitemap-index.xml ...');
    await uploadToS3(indexKey, indexXml.toString());

    console.log('All sitemaps uploaded successfully!');
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }
})();
