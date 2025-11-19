/* eslint-disable no-await-in-loop */
require('dotenv').config();
const {
  SitemapStream,
  SitemapIndexStream,
  streamToPromise,
} = require('sitemap');
const AWS = require('aws-sdk');

// const today = new Date();
// const isSunday = today.getDay() === 0; // 0 = Sunday

// if (!isSunday) {
//   console.log('Not Sunday, skipping weekly job.');
//   process.exit(0);
// }

const MAX_URLS = 20000; // Google limit
const host = 'https://www.trytopapps.com';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const FOLDER_NAME = 'trytopapps';

// Upload helper
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
    console.log('Fetching dynamic data...');

    const api = (path) => fetch(`${host}/api/${path}`).then((r) => r.json());

    // Fetch all data
    const [
      apps,
      categories,
      tags,
      features,
      useCases,
      userTypes,
      industries,
      businessModels,
    ] = await Promise.all([
      api('apps'),
      api('categories'),
      api('tags'),
      api('features'),
      api('useCases'),
      api('userTypes'),
      api('industries'),
      api('businessModels'),
    ]);

    // Collect URLs
    let urls = [];

    const staticRoutes = ['/', '/apps', '/faq', '/login', '/signup'];
    urls.push(...staticRoutes.map((r) => ({ url: r })));

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

    // Split into 50k chunks
    const chunks = [];
    while (urls.length) chunks.push(urls.splice(0, MAX_URLS));

    console.log(`Total sitemap parts: ${chunks.length}`);

    const sitemapIndexItems = [];

    // Generate each sitemap part
    for (let i = 0; i < chunks.length; i++) {
      const part = i + 1;
      const filename = `sitemap-${part}.xml`;
      const key = `${FOLDER_NAME}/${filename}`;

      const smStream = new SitemapStream({ hostname: host });
      chunks[i].forEach((url) => smStream.write(url));
      smStream.end();

      const xml = await streamToPromise(smStream);

      console.log(`Uploading ${filename} ...`);
      await uploadToS3(key, xml.toString());

      sitemapIndexItems.push({
        url: `${host}/api/sitemaps/${filename}`, // absolute URL
      });
    }

    // Create sitemap index
    console.log('Building sitemap index...');

    const indexStream = new SitemapIndexStream();

    sitemapIndexItems.forEach((item) => indexStream.write(item));
    indexStream.end();

    const indexXml = await streamToPromise(indexStream);
    const indexKey = `${FOLDER_NAME}/sitemap-index.xml`; // main index filename

    console.log('Uploading sitemap-index.xml (index)...');
    await uploadToS3(indexKey, indexXml.toString());

    console.log('Sitemap generation completed successfully!');
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }
})();
