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

  const stories = await loadJSON("data/stories.json");
  const authors = await loadJSON("data/authors.json");

  /* INDEX */
  const storiesEl = document.getElementById("stories");
  if (storiesEl) {
    stories.forEach(s => {
      const author = authors[s.authorId];
      const div = document.createElement("div");
      div.className = "story-card";
      div.onclick = () => location.href = `story.html?id=${s.id}`;
      const readTime = calculateReadingTime(s.body);
      div.innerHTML = `
      <div class="story-title">${s.title}</div>
       <div>
         ${author.name} • ${s.createdAt} • ⏱ ${readTime} min read
       </div>
       `;
      storiesEl.appendChild(div);
    });
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

    content.innerHTML = story.body;
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
