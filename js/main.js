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

  if (storiesEl && navEl) {
    // Determine Categories
    const categories = ["All", "India", "World", "Markets", "US", "UK"];
    let currentCategory = "All";

    // Function to render the grid based on selection
    function renderGrid(filterCat) {
      storiesEl.innerHTML = "";
      
      const filteredStories = filterCat === "All" 
        ? stories 
        : stories.filter(s => (s.category || "World") === filterCat);

      filteredStories.forEach(s => {
        const author = authors[s.authorId];
        const div = document.createElement("div");
        div.className = "story-card";
        div.onclick = () => location.href = `story.html?id=${s.id}`;
        
        const readTime = calculateReadingTime(s.body);
        const displayCategory = s.category || "World"; // Fallback for older posts
        const shortDate = s.createdAt.split(' ')[0]; // Strips the time off the date

        div.innerHTML = `
          <div class="story-category">${displayCategory}</div>
          <div class="story-title">${s.title}</div>
          <div class="story-meta">${author.name} • ${shortDate} • ⏱ ${readTime} min read</div>
        `;
        storiesEl.appendChild(div);
      });
    }

    // Build the Navigation Buttons
    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.textContent = cat;
      if (cat === "All") btn.className = "active";
      
      btn.onclick = () => {
        document.querySelectorAll(".category-nav button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderGrid(cat);
      };
      navEl.appendChild(btn);
    });

    // Initial render
    renderGrid("All");
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
