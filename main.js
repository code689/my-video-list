const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filterMovies = []
const dataPanel = document.querySelector("#dataPanel")
const serchForm = document.querySelector("#searchForm")
const paginator = document.querySelector('#Pagination')
const MOVIES_PER_PAGE = 12

window.onload = () => {
  axios
    .get(INDEX_URL)
    .then((response) => {
      movies.push(...response.data.results)
      renderPaginator(movies.length)
      renderMovieList(getMoviesByPage(1))
    })
    .catch((err) => console.log(err))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  }
  if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

serchForm.addEventListener('click', (event) => {
  event.preventDefault()
  if (event.target.id === "searchSubmitButton") {
    const searchInput = document.querySelector('#searchInput')
    const keyword = searchInput.value.trim().toLowerCase()
    keyword.length ? serchMovie(keyword) : renderMovieList(movies)
    //重製分頁器
    renderPaginator(filterMovies.length)  //新增這裡
    //預設顯示第 1 頁的搜尋結果
    renderMovieList(getMoviesByPage(1))  //修改這裡
  }
})

paginator.addEventListener('click', (event) => {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

function renderMovieList(data) {

  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#MovieModal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function serchMovie(title) {
  filterMovies = movies.filter(movie => movie.title.toLowerCase().includes(title))
  filterMovies.length ? renderMovieList(filterMovies) : alert("查無資料")
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#MovieModalTitle')
  const modalImage = document.querySelector('#MovieModalImage')
  const modalDate = document.querySelector('#MovieModalDate')
  const modalDescription = document.querySelector('#MovieModalDescription')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`

  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMoviesByPage(page) {
  const data = filterMovies.length ? filterMovies : movies
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}



function renderPaginator(amount) {

  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  console.log(numberOfPages)
  //製作 template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}