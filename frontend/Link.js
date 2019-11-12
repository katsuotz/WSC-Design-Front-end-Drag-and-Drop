class Link {
  constructor(id, fromId, fromArea, toId, toArea) {
    this.id = id
    this.fromId = fromId
    this.fromArea = fromArea
    this.toId = toId
    this.toArea = toArea

    let fromAreaEl = select(`#${this.fromId} > .area[data-area="${this.fromArea}"]`)
    let toAreaEl = select(`#${this.toId} > .area[data-area="${this.toArea}"]`)

    fromAreaEl.className += ' connected'
    toAreaEl.className += ' connected'

    this.append()
  }

  setPosition() {
    let fromAreaEl = select(`#${this.fromId} > .area[data-area="${this.fromArea}"]`)
    let toAreaEl = select(`#${this.toId} > .area[data-area="${this.toArea}"]`)

    fromAreaEl.setAttribute('data-link', this.id)
    toAreaEl.setAttribute('data-link', this.id)

    let fromArea = fromAreaEl.parentElement
    let toArea = toAreaEl.parentElement

    let x1 = fromArea.offsetLeft
    let y1 = fromArea.offsetTop

    let x2 = toArea.offsetLeft
    let y2 = toArea.offsetTop

    switch (this.fromArea) {
      case 1:
        y1 -= 48
        break
      case 3:
        y1 += 48
        break
      case 2:
        x1 += 48
        break
      case 4:
        x1 -= 48
        break
    }

    switch (this.toArea) {
      case 1:
        y2 -= 48
        break
      case 3:
        y2 += 48
        break
      case 2:
        x2 += 48
        break
      case 4:
        x2 -= 48
        break
    }

    let x = x2 - x1
    let y = y2 - y1

    this.x = x1 + 'px'
    this.y = y1 + 'px'

    this.width = Math.sqrt(x * x + y * y) + 'px'
    this.angle = Math.atan2(y, x) * 180 / Math.PI
  }

  //  update position
  updatePosition() {
    this.setPosition()

    let link = selectId(this.id)
    link.style.left = this.x
    link.style.top = this.y
    link.style.transform = `rotate(${this.angle}deg)`
    link.style.width = this.width
  }

  //  append to router
  append() {
    this.setPosition()

    let div = document.createElement('div')
    div.className = 'link'
    div.id = this.id
    router.appendChild(div)

    this.updatePosition()
  }
}