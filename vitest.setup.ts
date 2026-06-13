import '@testing-library/jest-dom'

// jsdom does not implement scrollIntoView — mock it globally
Element.prototype.scrollIntoView = () => {}

// jsdom does not implement HTMLDialogElement.showModal / close — polyfill them
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
}
