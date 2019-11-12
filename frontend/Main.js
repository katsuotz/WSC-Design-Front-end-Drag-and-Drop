class Main {
  //  init new route editor
  init() {
    this.appendActionOverlay()

    let localElements = JSON.parse(localStorage.getItem('elements'))
    let localLinks = JSON.parse(localStorage.getItem('links'))

    this.elements = {}
    this.links = {}
    this.mainElement = localStorage.getItem('mainElement')

    if (localElements) {
      for (let k in localElements) {
        let el = localElements[k]
        this.newElement(el.x, el.y, null, null, el.id, el.title, el.content, el.relations)
      }

      for (let k in localLinks) {
        let link = localLinks[k]
        this.newLink(link.fromId, link.fromArea, link.toId, link.toArea)
      }
    } else {
      this.newElement()
    }
  }

  //  generate action overlay
  appendActionOverlay() {
    let div = document.createElement('div')
    div.className = 'action-overlay'
    div.innerHTML = `<button class="btn btn-warning btn-edit">Edit</button>
      <button class="btn btn-danger btn-delete">Delete</button>`

    router.appendChild(div)
  }

  //  random id
  generateId() {
    return '_' + Math.random().toString(36).substr(2, 9)
  }

  //  new element
  newElement(x = '50%', y = '50%', fromId = null, fromArea = null, id = null, title = '', content = '', relations = []) {
    id = id || this.generateId()

    this.elements[id] = new Element(id, x, y, title, content, relations)

    if (!this.mainElement) {
      this.mainElement = id
    }

    if (fromId && fromArea) {
      let toArea

      switch (fromArea) {
        case 1:
          toArea = 3
          break
        case 2:
          toArea = 4
          break
        case 3:
          toArea = 1
          break
        case 4:
          toArea = 2
          break
      }

      this.newLink(fromId, fromArea, id, toArea)
    }

    this.updateStorage()
  }

  // new link
  newLink(fromId, fromArea, toId, toArea, id = null) {
    id = id || this.generateId()

    this.links[id] = new Link(id, fromId, fromArea, toId, toArea)

    this.updateStorage()
  }

  //    update Position
  updatePosition(id, x, y) {
    this.elements[id].x = x
    this.elements[id].y = y

    for (let k in this.links)
      this.links[k].updatePosition()

    this.updateStorage()
  }

  // update local storage
  updateStorage() {
    localStorage.setItem('elements', JSON.stringify(this.elements))
    localStorage.setItem('links', JSON.stringify(this.links))
    localStorage.setItem('mainElement', this.mainElement)
  }

  // delete link
  deleteLink(el) {
    let link = this.links[el.id]

    let fromAreaEl = select(`#${link.fromId} > .area[data-area="${link.fromArea}"]`)
    let toAreaEl = select(`#${link.toId} > .area[data-area="${link.toArea}"]`)


    fromAreaEl.removeAttribute('data-link')
    toAreaEl.removeAttribute('data-link')

    replaceClass(fromAreaEl, / connected/g)
    replaceClass(toAreaEl, / connected/g)

    el.remove()
    delete this.links[el.id]

    this.updateStorage()
  }

  // delete element
  deleteElement(el) {
    let element = this.elements[el.id]

    let areas = selectAll(`#${el.id} > .area.connected`)

    for (let i = 0; i < areas.length; i++) {
      let area = areas[i]
      this.deleteLink(select(`#${area.getAttribute('data-link')}`))
      return this.deleteElement(el)
    }

    el.remove()
    delete this.elements[el.id]

    let mainElement = select(`#${this.mainElement}`)

    //  change main element if main element deleted
    if (!mainElement) {
      for (let k in this.elements) {
        this.mainElement = k
        break
      }
    }

    let i = 0

    for (let k in this.elements) {
      i++
      break
    }

    // recreate element if there are no elements
    if (i == 0) {
      this.newElement()
    }

    this.updateStorage()
  }

  //  update element title
  updateTitle(el, value) {
    this.elements[el].title = value

    this.updateStorage()
  }

  //  update element content
  updateContent(el, value) {
    this.elements[el].content = value

    this.updateStorage()
  }

  //  update element relation
  updateRelation(el, area, value) {
    this.elements[el].relations[area] = value.toString()

    this.updateStorage()
  }
}