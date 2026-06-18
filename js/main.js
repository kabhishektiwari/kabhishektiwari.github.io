async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}
function calculateReadingTime(html) {
  const text = html.replace(/<[^>]+>/g, "").trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

document.addEventListener("DOMContentLoaded", async () => {

  const storiesData = await loadJSON("data/stories.json");
const stories = Array.isArray(storiesData) ? storiesData : storiesData.stories;
  const authors = await loadJSON("data/authors.json");

  
/* INDEX */
  const storiesEl = document.getElementById("stories");
  const navEl = document.getElementById("categoryNav");
  const sectionTitleEl = document.getElementById("sectionTitle");

  if (storiesEl && navEl && sectionTitleEl) {
    const tabs = ["World", "India", "Markets", "US", "Europe"];

    // filterId is added to specifically track author IDs mathematically
    function renderGrid(filterValue, filterType = "tab", filterId = null) {
      storiesEl.innerHTML = "";
      
      // Dynamically update the large section title so the user knows what they are filtering by
      if (filterType === "author") {
        sectionTitleEl.textContent = `Author: ${filterValue}`;
      } else if (filterType === "date") {
        sectionTitleEl.textContent = `Date: ${filterValue}`;
      } else {
        sectionTitleEl.textContent = filterValue;
      }

      let filteredStories = stories;
      
      // Multi-layered filtering logic
      if (filterType === "tab" && filterValue !== "World") {
        filteredStories = stories.filter(s => s.category === filterValue);
      } else if (filterType === "tag") {
        filteredStories = stories.filter(s => s.tag === filterValue);
      } else if (filterType === "author") {
        filteredStories = stories.filter(s => s.authorId === filterId);
      } else if (filterType === "date") {
        filteredStories = stories.filter(s => {
          const storyDate = s.createdAt ? s.createdAt.split(' ')[0] : "Recent";
          return storyDate === filterValue;
        });
      }

      filteredStories.forEach(s => {
        const author = authors[s.authorId];
        const div = document.createElement("div");
        div.className = "story-card";
        
        const readTime = calculateReadingTime(s.body);
        const displayTag = s.tag || "News"; 
        const shortDate = s.createdAt ? s.createdAt.split(' ')[0] : "Recent";
        
        // Only generate the excerpt HTML if the 'about' section actually contains text
        const excerptHTML = s.about ? `<div class="story-excerpt">${s.about}</div>` : '';

        // The new HTML structure isolates the links
        div.innerHTML = `
          <div><span class="story-tag">${displayTag}</span></div>
          <div class="story-title">${s.title}</div>
          ${excerptHTML}
          <div class="story-meta">
            <span class="meta-link meta-author">${author.name}</span> • 
            <span class="meta-link meta-date">${shortDate}</span> • 
            ⏱ ${readTime} min read
          </div>
        `;
        
        // --- ISOLATED CLICK EVENTS ---

        // 1. Click Title -> Opens the Story
        div.querySelector('.story-title').onclick = () => location.href = `story.html?id=${s.id}`;

        // 2. Click Tag -> Filters by Tag
        div.querySelector('.story-tag').onclick = () => {
          document.querySelectorAll(".category-nav button").forEach(b => b.classList.remove("active"));
          renderGrid(displayTag, "tag");
        };

        // 3. Click Author -> Filters by Author Name & ID
        div.querySelector('.meta-author').onclick = () => {
          document.querySelectorAll(".category-nav button").forEach(b => b.classList.remove("active"));
          renderGrid(author.name, "author", s.authorId);
        };

        // 4. Click Date -> Filters by Specific Date
        div.querySelector('.meta-date').onclick = () => {
          document.querySelectorAll(".category-nav button").forEach(b => b.classList.remove("active"));
          renderGrid(shortDate, "date");
        };

        storiesEl.appendChild(div);
      });
    }

    // Build the Top Navigation Buttons
    tabs.forEach(tab => {
      const btn = document.createElement("button");
      btn.textContent = tab;
      if (tab === "World") btn.className = "active";
      
      btn.onclick = () => {
        document.querySelectorAll(".category-nav button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderGrid(tab, "tab");
      };
      navEl.appendChild(btn);
    });

    renderGrid("World", "tab");
  }
  
  /* STORY */
  const titleEl = document.getElementById("title");
  if (titleEl) {
    const id = Number(new URLSearchParams(location.search).get("id"));
    const story = stories.find(s => s.id === id);
    const author = authors[story.authorId];

    titleEl.textContent = story.title;
    authorLink.textContent = author.name;
    authorLink.href = `author.html?id=${story.authorId}`;
    const readTime = calculateReadingTime(story.body);
    date.textContent = `${story.createdAt} • ⏱ ${readTime} min read`;
    ;
    
    const avatarEl = document.getElementById("authorAvatar");
  if (avatarEl && author.avatar) {
  avatarEl.src = author.avatar;
  avatarEl.alt = author.name;
  }

    if (story.about) {
      aboutText.textContent = story.about;
    } else {
      aboutSection.style.display = "none";
    }

   content.innerHTML = marked.parse(story.body);
  }

  /* AUTHOR */
  const nameEl = document.getElementById("name");
  if (nameEl) {
    const id = new URLSearchParams(location.search).get("id");
    const author = authors[id];
    nameEl.textContent = author.name;
    bio.innerHTML = author.bio;
    avatar.src = author.avatar;
  }

});
