const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

// Templates
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

// Data
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const productDataObj = JSON.parse(data);

// Slugs
// TODO: Replace ids with slugs
const productDataWithSlugs = productDataObj.map((product) => {
  return {
    ...product,
    slug: slugify(product.productName, { lower: true }),
  };
});

// Server
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = productDataObj
      .map((product) => replaceTemplate(tempCard, product))
      .join();
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);
  } else if (pathname === '/product') {
    const product = productDataObj[query.id];
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(replaceTemplate(tempProduct, product));
  } else if (pathname === '/API') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  } else {
    res.writeHead(404, {
      'Content-Type': 'text/html',
    });
    res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
