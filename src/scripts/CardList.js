// Класс для хранения и отрисовки карточек
export default class CardList {

    constructor(container, createCard, userInfo, api, preloader) {
        this.container = container;
        this.createCard = createCard;
        this.userInfo = userInfo;
        this.api = api;
        this.preloader = preloader;
    }

    // Отрисовывает карточки при загрузке страницы
    render() {
        this.setDeleteHandler();
        this.setLikeHandler();
        this.preloader.classList.remove('root__hide');

        this.api.getInitialCards()
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                return Promise.reject(`Ошибка: ${res.status}`);
            })
            .then((result) => {
                this.container.innerHTML = '';
                for (let i = 0; i < result.length; i++) {
                    
                    let placeName = result[i].name;
                    let link = result[i].link;
                    let likes = result[i].likes;
                    let id = result[i]._id;
                    let cardUserId = result[i].owner._id;

                    // Создание DOM-элемента карточки
                    let cardElem = this.createCard(placeName, link, likes);
                    let card = cardElem.createCard(placeName, link, likes);

                    this.hideDeleteIcon(cardUserId, card);
                    this.likedOrNot(likes, card);
                    this.createDataAttribute(id, card);                  
                    this.addCard(card);
                }
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                this.preloader.classList.add('root__hide');
            });
    }

    // Удаляет карточку из контейнера
    deleteCard(event) {   

        if (!event.target.classList.contains('place-card__delete-icon')) {
            return;
        } else if (!window.confirm("Вы действительно хотите удалить эту карточку?")) {
            return;
        }

        const card = event.target.closest('.place-card');
        const id = card.getAttribute('data-id');

        this.api.deleteCard(id)
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                return Promise.reject(`Ошибка: ${res.status}`);
            })
            .then((result) => {
                const card = this.container.querySelector(`[data-id="${id}"]`); // DOM-элемент           
                card.remove();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    // Проверяет, стоит ли лайк у карточки
    likeHandler(event) {

        if (!event.target.classList.contains('place-card__like-icon')) {
            return;
        }

        const card = event.target.closest('.place-card');
        const id = card.getAttribute('data-id');

        if (!event.target.classList.contains('place-card__like-icon_liked')) {
            this.likeCard(id);
        } else {
            this.removeLike(id);
        }

        event.target.classList.toggle('place-card__like-icon_liked');
    }

    // Ставит лайк
    likeCard(id) {
        this.api.likeCard(id)
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            return Promise.reject(`Ошибка: ${res.status}`);
        })
        .then((result) => {
            const card = this.container.querySelector(`[data-id="${id}"]`); // DOM-элемент  
            card.querySelector('.place-card__likes-number').textContent =  result.likes.length;
        })
        .catch((err) => {
            console.log(err);
        });
    }

    // Снимает лайк
    removeLike(id) {
        this.api.removeLike(id)
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            return Promise.reject(`Ошибка: ${res.status}`);
        })
        .then((result) => {
            const card = this.container.querySelector(`[data-id="${id}"]`); // DOM-элемент  
            card.querySelector('.place-card__likes-number').textContent =  result.likes.length;
        })
        .catch((err) => {
            console.log(err);
        });
    }

    // Устанавливает слушатель удаления карточек
    setDeleteHandler() {
        this.container.addEventListener('click', this.deleteCard.bind(this));
    }

    // Устанавливает слушатель проставления лайков
    setLikeHandler() {
        this.container.addEventListener('click', this.likeHandler.bind(this));
    }

    // Скрывает иконку удаления у чужих карточек
    hideDeleteIcon(cardUserId, card) {
        let myId = this.userInfo.getMyId();
        if (!(cardUserId === myId)) {
            card.querySelector('.place-card__delete-icon').classList.add('place-card__delete-icon_hide');
        }
    }

    // Отображает лайк при загрузке, если карточка была лайкнута ранее
    likedOrNot(likes, card) {
        let myId = this.userInfo.getMyId();
        for (let i = 0; i < likes.length; i++) {
            if (likes[i]._id === myId) {
                card.querySelector('.place-card__like-icon').classList.add('place-card__like-icon_liked');
            }
        }
    }

    // Записывает id карточки в ее data-атрибут
    createDataAttribute(id, card) {
        let attribute = document.createAttribute("data-id");
        attribute.value = id;
        card.setAttributeNode(attribute);
    }

    // Добавляет карточку в список
    addCard(card) {
        this.container.appendChild(card);
    }
}