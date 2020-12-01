import {RenderPosition, SECONDS_IN_MINUTE} from "../const.js";
import AbstractView from "../view/abstract";

const render = (container, child, place) => {
  if (container instanceof AbstractView) {
    container = container.element;
  }

  if (child instanceof AbstractView) {
    child = child.element;
  }

  switch (place) {
    case RenderPosition.AFTER_BEGIN:
      container.prepend(child);
      break;
    case RenderPosition.BEFORE_END:
      container.append(child);
      break;
  }
};

const createElement = (template) => {
  const newElement = document.createElement(`div`);
  newElement.innerHTML = template;

  return newElement.firstChild;
};

const getFormatTime = (minutes) => Math.floor(minutes / SECONDS_IN_MINUTE)
  ? `${Math.floor(minutes / SECONDS_IN_MINUTE)}h ${Math.floor(minutes % SECONDS_IN_MINUTE)}m`
  : `${Math.floor(minutes % SECONDS_IN_MINUTE)}m`;

export {
  getFormatTime,
  render,
  createElement
};
