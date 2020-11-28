import dayjs from "dayjs";
import {getFormatTime, createElement} from "../utils";

const SHORT_DESCRIPTION_LENGTH = 139;

const createFilmTemplate = (film) => {
  const {id, name, poster, description, comments, rating, releaseDate, runtime, genres} = film;

  const commentCount = comments.length;
  const year = dayjs(releaseDate).format(`YYYY`);
  const duration = getFormatTime(runtime);
  const shortDescription = description.length > SHORT_DESCRIPTION_LENGTH
    ? `${description.substr(0, SHORT_DESCRIPTION_LENGTH)}&hellip;`
    : description;

  return `<article id="${id}" class="film-card">
    <h3 class="film-card__title">${name}</h3>
    <p class="film-card__rating">${rating}</p>
    <p class="film-card__info">
      <span class="film-card__year">${year}</span>
      <span class="film-card__duration">${duration}</span>
      <span class="film-card__genre">${genres[0]}</span>
    </p>
    <img src="./images/posters/${poster}" alt="${name}" class="film-card__poster">
    <p class="film-card__description">${shortDescription}</p>
    <a class="film-card__comments">${commentCount} comments</a>
    <div class="film-card__controls">
      <button class="film-card__controls-item button film-card__controls-item--add-to-watchlist" type="button">Add to watchlist</button>
      <button class="film-card__controls-item button film-card__controls-item--mark-as-watched" type="button">Mark as watched</button>
      <button class="film-card__controls-item button film-card__controls-item--favorite" type="button">Mark as favorite</button>
    </div>
  </article>`;
};

export default class Film {
  constructor(film) {
    this._element = null;
    this._film = film;
  }

  getTemplate() {
    return createFilmTemplate(this._film);
  }

  getElement() {
    if (!this._element) {
      this._element = createElement(this.getTemplate());
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
