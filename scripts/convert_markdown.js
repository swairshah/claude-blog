const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Create a blog post template
function createHtmlFromMarkdown(title, date, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Algorithmic Exchanges</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <h1>${title}</h1>
        <nav>
            <ul>
                <li><a href="../index.html">Home</a></li>
                <li><a href="../about.html">About</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <article>
            <p class="date">${date}</p>
            ${content}
        </article>
    </main>
    <footer>
        <p>&copy; 2025 Algorithmic Exchanges. All rights reserved.</p>
    </footer>
</body>
</html>`;
}

// Process markdown files
function processMarkdownFiles() {
  const postsDir = path.join(__dirname, '../_posts');
  const outputDir = path.join(__dirname, '../_site/posts');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get list of markdown files
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
  
  const blogEntries = [];
  
  // Process each markdown file
  files.forEach(file => {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files marked for deletion
    if (content.trim() === 'DELETE') {
      return;
    }
    
    // Extract front matter and content
    const frontMatterRegex = /---\n([\s\S]*?)---\n([\s\S]*)/;
    const match = content.match(frontMatterRegex);
    
    if (match) {
      const frontMatter = match[1];
      const markdownContent = match[2];
      
      // Parse front matter
      const titleMatch = frontMatter.match(/title: (.*)/);
      const dateMatch = frontMatter.match(/date: (.*)/);
      
      if (titleMatch && dateMatch) {
        const title = titleMatch[1].trim();
        const date = dateMatch[1].trim();
        const slug = file.replace('.md', '');
        
        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownContent);
        
        // Create HTML file
        const htmlOutput = createHtmlFromMarkdown(title, date, htmlContent);
        fs.writeFileSync(path.join(outputDir, `${slug}.html`), htmlOutput);
        
        // Get first paragraph for preview (skip headers)
        const paragraphs = markdownContent.split('\n\n').filter(p => !p.startsWith('#') && p.trim().length > 0);
        const preview = paragraphs[0] ? paragraphs[0].substring(0, 200) + '...' : 'Read more about this topic...';
        
        // Add to blog entries
        blogEntries.push({
          title,
          date,
          slug,
          preview
        });
      }
    }
  });
  
  return blogEntries;
}

// Update home page (index.html) with all blog posts
function updateHomePage(entries) {
  const homePagePath = path.join(__dirname, '../index.html');
  
  // Sort entries by date (newest first)
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Create HTML for ALL entries
  let entriesHtml = '';
  entries.forEach(entry => {
    entriesHtml += `
        <article id="${entry.slug}">
            <h2>${entry.title}</h2>
            <p class="date">${entry.date}</p>
            <p>${entry.preview}</p>
            <a href="posts/${entry.slug}.html">Read more</a>
        </article>
`;
  });
  
  // Create the full index.html content
  const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Algorithmic Exchanges</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <h1>Algorithmic Exchanges: Claude & Swair Talk Tech</h1>
        <nav>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
            </ul>
        </nav>
    </header>
    <main>${entriesHtml}    </main>
    <footer>
        <p>&copy; 2025 Algorithmic Exchanges. All rights reserved.</p>
    </footer>
</body>
</html>`;
  
  fs.writeFileSync(homePagePath, indexContent);
}

// Copy static files to _site
function copyStaticFiles() {
  const rootDir = path.join(__dirname, '..');
  const siteDir = path.join(__dirname, '../_site');
  
  // Ensure _site directory exists
  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
  }
  
  // Copy CSS directory
  const cssSource = path.join(rootDir, 'css');
  const cssTarget = path.join(siteDir, 'css');
  if (fs.existsSync(cssSource)) {
    if (!fs.existsSync(cssTarget)) {
      fs.mkdirSync(cssTarget, { recursive: true });
    }
    const cssFiles = fs.readdirSync(cssSource);
    cssFiles.forEach(file => {
      fs.copyFileSync(path.join(cssSource, file), path.join(cssTarget, file));
    });
  }
  
  // Copy about.html
  const aboutSource = path.join(rootDir, 'about.html');
  const aboutTarget = path.join(siteDir, 'about.html');
  if (fs.existsSync(aboutSource)) {
    fs.copyFileSync(aboutSource, aboutTarget);
  }
  
  // Copy index.html (after it's been updated)
  const indexSource = path.join(rootDir, 'index.html');
  const indexTarget = path.join(siteDir, 'index.html');
  if (fs.existsSync(indexSource)) {
    fs.copyFileSync(indexSource, indexTarget);
  }
}

// Main execution
function main() {
  console.log('Converting markdown files to HTML...');
  const entries = processMarkdownFiles();
  
  if (entries.length > 0) {
    console.log('Updating home page with all posts...');
    updateHomePage(entries);
    
    console.log('Copying static files to _site...');
    copyStaticFiles();
    
    console.log('Done! Processed', entries.length, 'markdown files.');
  } else {
    console.log('No markdown files found in _posts directory.');
  }
}

main();