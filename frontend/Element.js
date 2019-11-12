class Element {
  constructor(id, x = '50%', y = '50%', title = '', content = '', relations = []) {
    this.id = id
    this.x = x
    this.y = y

    this.title = title
    this.content = content
    this.relations = relations

    this.append()
  }

  append() {
    let div = document.createElement('div')

    div.className = 'element'
    div.id = this.id
    div.style.left = this.x
    div.style.top = this.y

    div.innerHTML = `<div class="area" data-area="1"></div>
        <div class="area" data-area="2"></div>
        <div class="area" data-area="3"></div>
        <div class="area" data-area="4"></div>`

    router.appendChild(div)
  }
}