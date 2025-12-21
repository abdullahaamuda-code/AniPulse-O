const container = document.getElementById('anime-container');
const searchInput = document.getElementById('search');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close');
const guideBtn = document.getElementById('guide-btn');
const guideModal = document.getElementById('guide-modal');
const closeGuide = document.querySelector('.close-guide');

const cache = {};

// --- UTILITIES ---
function seasonHTML(seasons){
  return seasons.map((s,i)=>{
    return `<div class="season ${i===seasons.length-1?'current':''}">
      <img src="${s.image}" alt="${s.title}" />
      <div>
        <strong>${s.title}</strong><br>
        Episodes: ${s.episodes??'?'}<br>
        Status: ${s.status}
      </div>
    </div>`;
  }).join('');
}

function calculateSeasons(anime){
  let seasons = [];

  if(anime.relations?.length){
    anime.relations.forEach(rel=>{
      rel.entry.forEach(e=>{
        if(e.type==='TV'){
          seasons.push({
            title:e.title_english || e.title,
            episodes:e.episodes,
            status:e.status,
            image:e.images?.jpg?.image_url || ''
          });
        }
      });
    });
  }

  // Include main anime
  seasons.unshift({
    title:anime.title_english || anime.title,
    episodes:anime.episodes,
    status:anime.status,
    image:anime.images?.jpg?.image_url || ''
  });

  return seasons;
}

// --- FETCH ANIME ---
async function fetchAnime(title){
  container.innerHTML='';

  if(cache[title]){
    renderCards(cache[title].animes);
    return;
  }

  try{
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=10`);
    const data = await res.json();
    if(!data.data.length){ container.innerHTML='<p>No anime found.</p>'; return; }

    const animes = data.data.filter(a=>a.type==='TV' && a.title_english).map(a=>{
      return {
        title:a.title_english || a.title,
        episodes:a.episodes,
        status:a.status,
        image:a.images?.jpg?.image_url || '',
        seasons:calculateSeasons(a)
      };
    });

    cache[title] = { animes };
    renderCards(animes);
  }catch(e){
    container.innerHTML='<p>Error fetching anime.</p>';
    console.error(e);
  }
}

// --- RENDER SEARCH CARDS ---
function renderCards(animes){
  container.innerHTML='';
  animes.forEach(anime=>{
    const card=document.createElement('div');
    card.className='anime-card';
    card.innerHTML=`
      <img src="${anime.image}" alt="${anime.title}" />
      <h3>${anime.title}</h3>
      <p>Seasons: ${anime.seasons.length}</p>
      <p>Total Episodes: ${anime.episodes ?? '?'}</p>
    `;
    container.appendChild(card);

    card.addEventListener('click',()=>{
      modal.style.display='flex';
      modalBody.innerHTML=`
        <h2>${anime.title}</h2>
        ${seasonHTML(anime.seasons)}
      `;
    });
  });
}

// --- EVENTS ---
closeBtn.onclick = ()=>{ modal.style.display='none'; }
closeGuide.onclick = ()=>{ guideModal.style.display='none'; }
window.onclick = e=>{
  if(e.target==modal) modal.style.display='none';
  if(e.target==guideModal) guideModal.style.display='none';
}
searchInput.addEventListener('keyup', e=>{
  if(e.key==='Enter'){
    const q = searchInput.value.trim();
    if(q.length>2) fetchAnime(q);
  }
});
guideBtn.addEventListener('click', ()=>{ guideModal.style.display='flex'; });
const searchBtn = document.getElementById('search-btn');

searchBtn.addEventListener('click', ()=>{
  const q = searchInput.value.trim();
  if(q.length>2) fetchAnime(q);
});
// --- DEFAULT ---
fetchAnime('Attack on Titan');
