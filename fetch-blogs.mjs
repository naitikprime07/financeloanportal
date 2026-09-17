import https from 'https';
import fs from 'fs';

const baseURL = 'https://automatedsalesplatform.com';

// Fetch the main page to get the JS bundle
https.get(baseURL, (res) => {
  let html = '';
  res.on('data', (chunk) => html += chunk);
  res.on('end', () => {
    // Extract JS bundle URL
    const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (!jsMatch) {
      console.log('Could not find JS bundle');
      process.exit(1);
    }

    const jsURL = baseURL + jsMatch[1];
    console.log('Fetching:', jsURL);

    // Fetch the JS bundle
    https.get(jsURL, (res2) => {
      let js = '';
      res2.on('data', (chunk) => js += chunk);
      res2.on('end', () => {
        // Try to extract blog data patterns
        // Look for title patterns
        const titles = [];
        const titleMatches = js.matchAll(/title:"([^"]{20,150})"/g);
        for (const match of titleMatches) {
          if (match[1].length > 20 && !titles.includes(match[1])) {
            titles.push(match[1]);
          }
        }

        console.log('\nFound titles:');
        titles.forEach((title, i) => {
          console.log(`${i + 1}. ${title}`);
        });

        // Save to file
        fs.writeFileSync('blog-titles.txt', titles.join('\n'));
        console.log(`\nSaved ${titles.length} titles to blog-titles.txt`);
      });
    });
  });
});
