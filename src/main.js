import Profile from "./view/profile.js";
import FooterStatistics from "./view/footer-statistics.js";
import PageMainContent from "./presenter/page-main-content.js";
import FilmModel from "./model/film.js";
import {generateFilm} from "./mock/film.js";
import {generateStats} from "./mock/stats.js";
import {render} from "./utils/render.js";
import {generateFilterData} from "./mock/filter";
import {RenderPosition, TOTAL_FILMS} from "./const.js";

const body = document.querySelector(`body`);
const header = body.querySelector(`.header`);
const footerStatistics = body.querySelector(`.footer__statistics`);
const films = new Array(TOTAL_FILMS).fill().map(generateFilm);
const stats = generateStats(films);
const filterData = generateFilterData(films);
const filmsModel = new FilmModel();
const pageMainContentPresenter = new PageMainContent(body, filmsModel);

filmsModel.films(films);
render(header, new Profile(stats).element, RenderPosition.BEFORE_END);
pageMainContentPresenter.init(filterData);
render(footerStatistics, new FooterStatistics(TOTAL_FILMS).element, RenderPosition.BEFORE_END);
