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
  const titleEl = document.getElementById("sectionTitle");

  if (storiesEl && navEl && titleEl) {
    // World is now the aggregate, followed by specific countries
    const tabs = ["World", "India", "Markets", "US", "UK"];

    // Function to render the grid based on Filter Type and Value
    function renderGrid(filterValue, filterType = "tab") {
      storiesEl.innerHTML = "";
      
      // Update the large section title
      titleEl.textContent = filterValue;

      // Logic: If "World" is selected, show all. Otherwise, filter by category or tag.
      let filteredStories = stories;
      
      if (filterType === "tab" && filterValue !== "World") {
        filteredStories = stories.filter(s => s.category === filterValue);
      } else if (filterType === "tag") {
        filteredStories = stories.filter(s => s.tag === filterValue);
      }

      filteredStories.forEach(s => {
        const author = authors[s.authorId];
        const div = document.createElement("div");
        div.className = "story-card";
        
        // Clicking the card goes to the story
        div.onclick = () => location.href = `story.html?id=${s.id}`;
        
        const readTime = calculateReadingTime(s.body);
        const displayTag = s.tag || "News"; 
        const shortDate = s.createdAt.split(' ')[0]; 

        div.innerHTML = `
          <div><span class="story-tag">${displayTag}</span></div>
          <div class="story-title">${s.title}</div>
          <div class="story-meta">${author.name} • ${shortDate} • ⏱ ${readTime} min read</div>
        `;
        
        // INTERCEPT LOGIC: Make the tag clickable without triggering the card click
        const tagElement = div.querySelector('.story-tag');
        tagElement.onclick = (event) => {
          event.stopPropagation(); // Stops the click from bubbling up to the card
          
          // Remove active state from top tabs since we are in a custom Tag view
          document.querySelectorAll(".category-nav button").forEach(b => b.classList.remove("active"));
          
          // Render the grid filtered exclusively by this tag
          renderGrid(displayTag, "tag");
        };

        storiesEl.appendChild(div);
      });
    }

    // Build the Top Navigation Buttons
    tabs.forEach(tab => {
      const btn = document.createElement("button");
      btn.textContent = tab;
      if (tab === "World") btn.className = "active"; // World is default
      
      btn.onclick = () => {
        document.querySelectorAll(".category-nav button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderGrid(tab, "tab");
      };
      navEl.appendChild(btn);
    });

    // Initial render loads the aggregate "World" view
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
