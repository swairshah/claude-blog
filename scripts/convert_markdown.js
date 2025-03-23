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
    <title>${title} - My Blog</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <h1>${title}</h1>
        <nav>
            <ul>
                <li><a href="../index.html">Home</a></li>
                <li><a href="../about.html">About</a></li>
                <li><a href="../blog.html">Blog Posts</a></li>
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
        <p>&copy; 2025 My Blog. All rights reserved.</p>
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
        
        // Add to blog entries
        blogEntries.push({
          title,
          date,
          slug,
          preview: markdownContent.split('\n').slice(0, 2).join(' ').substring(0, 150) + '...'
        });
      }
    }
  });
  
  return blogEntries;
}

// Update blog index
function updateBlogIndex(entries) {
  const blogIndexPath = path.join(__dirname, '../blog.html');
  let blogIndexContent = fs.readFileSync(blogIndexPath, 'utf8');
  
  // Sort entries by date (newest first)
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Create HTML for entries
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
  
  // Update the main content section
  const mainContentRegex = /<main>([\s\S]*?)<\/main>/;
  const updatedContent = blogIndexContent.replace(
    mainContentRegex, 
    `<main>
    ${entriesHtml}
    </main>`
  );
  
  fs.writeFileSync(blogIndexPath, updatedContent);
}

// Update home page with latest posts
function updateHomePage(entries) {
  const homePagePath = path.join(__dirname, '../index.html');
  let homePageContent = fs.readFileSync(homePagePath, 'utf8');
  
  // Sort entries by date (newest first)
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Take only the 3 most recent entries
  const recentEntries = entries.slice(0, 3);
  
  // Create HTML for entries
  let entriesHtml = '';
  recentEntries.forEach(entry => {
    entriesHtml += `
            <article>
                <h3>${entry.title}</h3>
                <p>${entry.preview}</p>
                <a href="posts/${entry.slug}.html">Read more</a>
            </article>
    `;
  });
  
  // Update the section content
  const sectionContentRegex = /<section>\s*<h2>Latest Posts<\/h2>([\s\S]*?)<\/section>/;
  const updatedContent = homePageContent.replace(
    sectionContentRegex, 
    `<section>
            <h2>Latest Posts</h2>${entriesHtml}
        </section>`
  );
  
  fs.writeFileSync(homePagePath, updatedContent);
}

// Main execution
function main() {
  console.log('Converting markdown files to HTML...');
  const entries = processMarkdownFiles();
  
  if (entries.length > 0) {
    console.log('Updating blog index...');
    updateBlogIndex(entries);
    
    console.log('Updating home page...');
    updateHomePage(entries);
    
    console.log('Done! Processed', entries.length, 'markdown files.');
  } else {
    console.log('No markdown files found in _posts directory.');
  }
}

main();