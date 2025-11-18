require('dotenv').config();
const { SitemapStream, streamToPromise } = require('sitemap');
const AWS = require('aws-sdk');

const today = new Date();
const isSunday = today.getDay() === 0; // 0 = Sunday

if (!isSunday) {
  console.log('Not Sunday, skipping weekly job.');
  process.exit(0);
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME; // sitemaps-bucket1
const FOLDER_NAME = 'trytopapps'; // optional folder prefix

(async () => {
  try {
    const host = 'https://www.trytopapps.com';
    const sitemap = new SitemapStream({ hostname: host });

    // Fetch dynamic data
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
      fetch('http://www.trytopapps.com/api/apps'),
      fetch('http://www.trytopapps.com/api/categories'),
      fetch('http://www.trytopapps.com/api/tags'),
      fetch('http://www.trytopapps.com/api/features'),
      fetch('http://www.trytopapps.com/api/useCases'),
      fetch('http://www.trytopapps.com/api/userTypes'),
      fetch('http://www.trytopapps.com/api/industries'),
      fetch('http://www.trytopapps.com/api/businessModels'),
    ]);

    const apps = await appsRes.json();
    const categories = await categoriesRes.json();
    const tags = await tagsRes.json();
    const features = await featuresRes.json();
    const useCases = await useCasesRes.json();
    const userTypes = await userTypesRes.json();
    const industries = await industriesRes.json();
    const businessModels = await businessModelsRes.json();

    // Static pages
    const staticRoutes = ['/', '/apps', '/faq', '/login', '/signup'];

    staticRoutes.forEach((route) => sitemap.write({ url: route }));

    // Dynamic pages
    apps.forEach((app) =>
      sitemap.write({ url: `/apps/${app.id}`, changefreq: 'weekly' }),
    );

    categories.forEach((c) =>
      sitemap.write({
        url: `/apps/categories/${c.slug}`,
        changefreq: 'weekly',
      }),
    );

    tags.forEach((c) =>
      sitemap.write({
        url: `/apps/tags/${c.slug}`,
        changefreq: 'weekly',
      }),
    );

    features.forEach((c) =>
      sitemap.write({
        url: `/apps/features/${c.slug}`,
        changefreq: 'weekly',
      }),
    );

    useCases.forEach((c) =>
      sitemap.write({
        url: `/apps/useCases/${c.slug}`,
        changefreq: 'weekly',
      }),
    );

    userTypes.forEach((c) =>
      sitemap.write({
        url: `/apps/userTypes/${c.slug}`,
        changefreq: 'weekly',
      }),
    );

    industries.forEach((c) =>
      sitemap.write({
        url: `/apps/industries/${c.slug}`,
        changefreq: 'weekly',
      }),
    );

    businessModels.forEach((c) =>
      sitemap.write({
        url: `/apps/businessModels/${c.slug}`,
        changefreq: 'weekly',
      }),
    );

    sitemap.end();

    const xml = await streamToPromise(sitemap);

    // Upload to S3
    const key = `${FOLDER_NAME}/sitemap.xml`; // e.g., trytopapps/sitemap.xml
    await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: xml.toString(),
        ContentType: 'application/xml',
      })
      .promise();

    console.log(`Sitemap uploaded to s3://${BUCKET_NAME}/${key} successfully!`);
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }
})();
