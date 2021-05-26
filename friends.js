const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";
const dataPanel = document.querySelector("#data-panel");
const nav = document.querySelector("#nav-bar-content");
const topOfNav = nav.offsetTop
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const USERS_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
const dataPanelSummary = document.querySelector('#data-panel-summary')
const sortDataPanel = document.querySelector('#sort-data-panel')


// 建構子
function UserListModel() { }
function UserListView() { }
function UserListController() { }

// Model，一些資料
UserListModel.state = ''
UserListModel.women = []
UserListModel.male = []
UserListModel.sortedByAge = []
UserListModel.sortedByID = []
UserListModel.filteredByKeyword = []
UserListModel.friends = JSON.parse(localStorage.getItem('friends')) || []
UserListModel.tmpCurrentData = []

UserListModel.prototype.getDataByPage = function (data, page) {
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

UserListModel.prototype.removeFromFriend = function (id) {
  if (!UserListModel.friends.length) return
  const index = (UserListModel.friends).findIndex(friend => friend.id === id)
  if (index === -1) return
  UserListModel.friends.splice(index, 1)
  localStorage.clear()
  localStorage.setItem('friends', JSON.stringify(UserListModel.friends))
}

// View
UserListView.prototype.renderDataList = function (data) {
  //   用好友宣染dataPanel每一個卡片
  dataPanel.innerHTML = '';
  data.forEach((user) => {
    // change avatar, name, id
    dataPanel.innerHTML += `<div class="card border cards col-2 mb-5 mr-3 pb-1">
  <img src="${user.avatar}"
       class="card-img-top"
       alt="User Avatar">
  <!-- buttons trigger modals -->
  <div class="card-body text-muted d-flex flex-column align-items-center justify-content-center py-3 px-0">
    <div class="user-container text-light card-title">
      <div class="user-name d-inline-flex justify-content-center border-bottom">
        <h6 class="mr-1">${user.name}</h6><i class="blue-check fa fa-check-circle text-success"></i>
      </div>    
    </div>
    <div class="feedback-action text-light d-flex align-items-center justify-content-around border-bottom pb-2">
      <div class="fb-wrapper">
        <i class="fa fa-info-circle"
           aria-hidden="true"
           id="icon-show-user-info"
           data-toggle="modal"
           data-target="#modalShowUser"
           data-id=${user.id}></i>
      </div>
      <div class="fb-wrapper">
        <i class="fa fa-heart text-danger"
           id="icon-add-friends"
           data-id=${user.id}></i>
      </div>
      <div class="fb-wrapper">
        <i class="far fa-comment"></i>
      </div>
    </div>
  </div>
</div>`;
  });
}

UserListView.prototype.renderDataPanelSummary = function (summary) {
  //   宣染當前資料的summary，方便讓使用者知道正在使用哪些資料
  dataPanelSummary.innerHTML = ''
  dataPanelSummary.innerHTML = `<h3>Check ${summary} friends! ${UserListModel.tmpCurrentData.length} on your list!</h3>`
}

UserListView.prototype.renderSortDataPanelSummary = function (summary) {
  //   讓使用者知道正在使用甚麼方法排序資料
  sortDataPanel.innerText = ''
  sortDataPanel.innerText = `Sort by ${summary}`
}

UserListView.prototype.renderDataPanelSearchKeywordSummary = function () {
  //   讓使用者知道有多少搜尋結果
  dataPanelSummary.innerHTML = ''
  dataPanelSummary.innerHTML = `<h3>${UserListModel.filteredByKeyword.length} search results on your friends list!</h3>`
}

UserListView.prototype.showUserInfoModal = function (id) {
  const modalShowUserInfoContent = document.querySelector('#modal-show-user-info-content')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    modalShowUserInfoContent.innerHTML = '';
    modalShowUserInfoContent.innerHTML = `
        <div class="modal-header bg-danger">
          <h5 class="modal-title text-light"
              id="modal-show-user-name">${data.name} ${data.surname}</h5>
          <button type="button"
                  class="close text-light"
                  data-dismiss="modal"
                  aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-sm-3">
              <img src=${data.avatar}
                   alt="User Poster"
                   id="modal-show-user-avatar">
            </div>
            <div class="col-sm-9"
                 id="modal-show-user-attributes">
              <!-- render modal user attributes -->
              <ul>
                <li class="list-unstyled"><i class="fas fa-id-badge mr-3"></i> ID: ${data.id}</li>
                <li class="list-unstyled"><i class="fas fa-venus-double mr-3"></i>Gender: ${data.gender}</li>
                <li class="list-unstyled"><i class="fas fa-glass-cheers mr-3"></i>Age: ${data.age}</li>
                <li class="list-unstyled"><i class="fas fa-birthday-cake mr-3"></i>Birthday: ${data.birthday}</li>
                <li class="list-unstyled"><i class="fas fa-street-view mr-3"></i>Location: ${data.region}</li>
                <li class="list-unstyled"><i class="fas fa-envelope mr-3"></i>Email: ${data.email}</li>
              </ul>
              <em>
                <p>Updated At: ${data.updated_at}</p>
              </em>
            </div>
        </div>
      </div>`
  });
}

UserListView.prototype.renderPaginator = function (amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  paginator.innerHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    paginator.innerHTML += `<li class="page-item"><a class="page-link text-dark"
           href="#" data-page=${page}>${page}</a></li>`
  }
}

// Controller

// 流程
UserListController.prototype.switchState = function () {
  userListController.initializeData()
  switch (UserListModel.state) {
    case 'women':
      UserListModel.tmpCurrentData = UserListModel.women;
      break
    case 'male':
      UserListModel.tmpCurrentData = UserListModel.male;
      break
    case 'id':
      UserListModel.tmpCurrentData = UserListModel.sortedByID;
      break
    case 'age':
      UserListModel.tmpCurrentData = UserListModel.sortedByAge;
      break
    case 'all':
      UserListModel.tmpCurrentData = UserListModel.friends;
      break
    case 'keyword':
      UserListModel.tmpCurrentData = UserListModel.filteredByKeyword;
      break
  }
}
UserListController.prototype.fixedNav = function () {
  if (window.scrollY > topOfNav) {
    document.body.style.paddingTop = nav.offsetHeight + 'px'
    document.body.classList.add('fixed-nav')
  } else {
    document.body.style.paddingTop = 0
    document.body.classList.remove('fixed-nav')
  }
}


UserListController.prototype.initializeData = function () {
  UserListModel.friends = JSON.parse(localStorage.getItem('friends')) || []
  // 只有女生
  UserListModel.women = UserListModel.friends.filter(user => user.gender === 'female')
  // 只有男生
  UserListModel.male = UserListModel.friends.filter(user => user.gender === 'male')
  // 用Age排
  UserListModel.sortedByAge = []
  UserListModel.sortedByAge.push(...UserListModel.tmpCurrentData.sort((userA, userB) => {
    return userA.age - userB.age;
  }))
  // 用ID排
  UserListModel.sortedByID = []
  UserListModel.sortedByID.push(...UserListModel.tmpCurrentData.sort((userA, userB) => {
    return userA.id - userB.id;
  }))
}

// 產生datapanel
UserListController.prototype.generateDataPanelByPage = function (data = UserListModel.tmpCurrentData, page = 1) {
  switch (UserListModel.state) {
    case 'age':
    case 'id':
      userListView.renderSortDataPanelSummary(UserListModel.state)
      break
    case 'keyword':
      userListView.renderDataPanelSearchKeywordSummary()
      break
    default:
      userListView.renderDataPanelSummary(UserListModel.state)
      break
  }
  userListView.renderDataList(userListModel.getDataByPage(data, page))
}
// 用資料數量宣染分頁
UserListController.prototype.generatePaginator = function (amount = UserListModel.tmpCurrentData.length) {
  userListView.renderPaginator(amount)
}


// 點擊分頁用分頁的資料產生datapanel
UserListController.prototype.onPaginatorClicked = function (e) {
  if (e.target.tagName !== 'A') return
  const page = e.target.dataset.page
  e.target.classList.add('[checked]')
  userListController.generateDataPanelByPage(UserListModel.tmpCurrentData, page)
}

// 用關鍵字結果產生datapanel的人物卡片
UserListController.prototype.onSearchFormSubmitted = function (e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) return alert('Please enter something.')
  UserListModel.filteredByKeyword = UserListModel.tmpCurrentData.filter(user => user.name.toLowerCase().includes(keyword))
  //   提醒使用者輸入的關鍵字沒有找到任何符合的結果
  if (!UserListModel.filteredByKeyword.length) return alert('Cannot find results by keyword: ' + keyword)
  UserListModel.state = 'keyword'
  userListController.switchState()
  userListController.generateDataPanelByPage()
  userListController.generatePaginator()
}


UserListController.prototype.onDataPanelClicked = function (e) {
  const id = Number(e.target.dataset.id);
  // modal畫面
  if (e.target.matches("#icon-show-user-info")) {
    return userListView.showUserInfoModal(id);
  }
  //   刪除好友
  if (e.target.matches("#icon-add-friends")) {
    userListModel.removeFromFriend(id)
  }
  userListController.switchState()
  userListController.generateDataPanelByPage()
  userListController.generatePaginator()
}
// navbar的瀏覽功能，瀏覽只有男生、只有女生的清單
UserListController.prototype.onNavBarClicked = function onNavBarClicked(e) {
  const type = e.target.dataset.type;
  switch (type) {
    case 'women':
      UserListModel.state = 'women'
      break
    case 'male':
      UserListModel.state = 'male'
      break
    case 'age':
      UserListModel.state = 'age'
      break
    case 'id':
      UserListModel.state = 'id'
      break
    case 'all':
      UserListModel.state = 'all'
      break
  }
  userListController.switchState()
  userListController.generateDataPanelByPage()
  userListController.generatePaginator()
}


// 以下是事件綁定
UserListController.prototype.bindDataPanelClicked = function () {
  dataPanel.addEventListener("click", userListController.onDataPanelClicked);
}

UserListController.prototype.bindNavBarClicked = function () {
  nav.addEventListener("click", userListController.onNavBarClicked);
}

UserListController.prototype.bindOnSearchFormSubmitted = function () {
  searchForm.addEventListener('submit', userListController.onSearchFormSubmitted)
}

UserListController.prototype.bindOnPaginatorClicked = function () {
  paginator.addEventListener('click', userListController.onPaginatorClicked)
}

UserListController.prototype.bindOnScrollTriggered = function () {
  window.addEventListener('scroll', userListController.fixedNav)
}




// 主程序
const userListController = new UserListController()
const userListView = new UserListView()
const userListModel = new UserListModel()

// 產生資料方便後續存取
userListController.initializeData()

// 當前頁面資料，只要修改這一行，選擇要宣染在datapanel的資料
UserListModel.state = 'all'
// 更新流程，方便存取正確的資料宣染畫面
userListController.switchState()

// 宣染所有使用者畫面第一頁array
userListController.generateDataPanelByPage()
userListController.generatePaginator()

//  事件綁定
userListController.bindDataPanelClicked()
userListController.bindNavBarClicked()
userListController.bindOnSearchFormSubmitted()
userListController.bindOnPaginatorClicked()
userListController.bindOnScrollTriggered()













